import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import Stripe from 'stripe';
import { Order } from 'src/schemas/order.schema';
import { Cart } from 'src/schemas/cart.schema';
import { Product } from 'src/schemas/product.schema';
import { Auth } from 'src/schemas/auth.schema';
import { EmailService } from 'src/service/email.provider';

@Injectable()
export class StripeService {
    private readonly logger = new Logger(StripeService.name);
    private stripe: Stripe;

    constructor(
        @InjectModel(Order.name) private orderModel: Model<Order>,
        @InjectModel(Cart.name) private cartModel: Model<Cart>,
        @InjectModel(Product.name) private productModel: Model<Product>,
        @InjectModel(Auth.name) private authModel: Model<Auth>,
        private emailService: EmailService,
    ) {
        this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
            apiVersion: '2025-02-24.acacia',
        });
    }

    async createCheckoutSession(
        userId: string,
        lang: string,
        shippingAddress: {
            street: string;
            city: string;
            phone: string;
        },
    ) {
        const cart = await this.cartModel
            .findOne({ user: userId })
            .populate('cartItems.product');

        if (!cart || cart.cartItems.length === 0) {
            throw new Error('Cart not found or empty');
        }

        // Get user information
        const user = await this.authModel.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        // Create line items with proper product names
        const line_items = cart.cartItems.map((item) => {
            // Get product name from details
            let productName = 'Product';
            if (item.product?.details && item.product.details.length > 0) {
                const englishDetail = item.product.details.find(detail => detail.lang === 'en');
                const arabicDetail = item.product.details.find(detail => detail.lang === 'ar');
                const anyDetail = item.product.details[0];
                productName = englishDetail?.title || arabicDetail?.title || anyDetail?.title || 'Product';
            }

            return {
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: productName,
                        description: `Quantity: ${item.quantity}`,
                    },
                    unit_amount: Math.round(item.price * 100), // Convert to cents
                },
                quantity: item.quantity,
            };
        });

        try {
            const session = await this.stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items,
                mode: 'payment',
                success_url: `${process.env.CLIENT_URL}/${lang}/order-success?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${process.env.CLIENT_URL}/${lang}/cart`,
                metadata: {
                    userId: userId.toString(),
                    cartId: cart._id.toString(),
                    shippingAddress: JSON.stringify(shippingAddress),
                },
                customer_email: user.email,
                shipping_address_collection: {
                    allowed_countries: ['US', 'CA', 'GB', 'AU', 'EG'], // Add your supported countries
                },
            });

            return { url: session.url, sessionId: session.id };
        } catch (error) {
            this.logger.error('Stripe session creation failed:', error);
            throw new Error('Stripe session creation failed');
        }
    }

    async handleWebhook(body: Buffer, signature: string) {
        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

        if (!webhookSecret) {
            throw new Error('Stripe webhook secret not configured');
        }

        let event: Stripe.Event;

        try {
            event = this.stripe.webhooks.constructEvent(body, signature, webhookSecret);
        } catch (err) {
            this.logger.error('Webhook signature verification failed:', err);
            throw new Error('Invalid signature');
        }

        this.logger.log(`Received webhook event: ${event.type}`);

        switch (event.type) {
            case 'checkout.session.completed':
                await this.handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
                break;
            case 'payment_intent.succeeded':
                await this.handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
                break;
            case 'payment_intent.payment_failed':
                await this.handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
                break;
            default:
                this.logger.log(`Unhandled event type: ${event.type}`);
        }
    }

    private async handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
        try {
            const { userId, cartId, shippingAddress } = session.metadata;

            if (!userId || !cartId) {
                this.logger.error('Missing required metadata in session');
                return;
            }

            // Get the cart
            const cart = await this.cartModel
                .findById(cartId)
                .populate('cartItems.product');

            if (!cart) {
                this.logger.error('Cart not found for session:', session.id);
                return;
            }

            // Get user information
            const user = await this.authModel.findById(userId);
            if (!user) {
                this.logger.error('User not found for session:', session.id);
                return;
            }

            // Parse shipping address
            let parsedShippingAddress;
            try {
                parsedShippingAddress = JSON.parse(shippingAddress);
            } catch {
                // Fallback to session shipping address if metadata parsing fails
                parsedShippingAddress = {
                    street: session.shipping_details?.address?.line1 || 'Address not provided',
                    city: session.shipping_details?.address?.city || 'City not provided',
                    phone: session.shipping_details?.phone || user.phone || 'Phone not provided',
                };
            }

            // Create the order
            const order = new this.orderModel({
                user: userId,
                cartItems: cart.cartItems,
                totalOrderPrice: cart.totalPrice,
                paymentMethod: 'Card',
                isPaid: true,
                paidAt: new Date(),
                paymentId: session.payment_intent as string,
                paymentStatus: 'completed',
                shippingAddress: parsedShippingAddress,
            });

            await order.save();

            // Populate the order with product details for email
            await order.populate({
                path: 'cartItems.product',
                populate: {
                    path: 'details',
                    model: 'ProductDetail'
                }
            });

            // Update product stock
            const bulkUpdates = cart.cartItems.map((item) => ({
                updateOne: {
                    filter: { _id: item.product },
                    update: { $inc: { quantity: -item.quantity, sold: item.quantity } },
                },
            }));

            await this.productModel.bulkWrite(bulkUpdates);

            // Delete the cart
            await this.cartModel.findByIdAndDelete(cart._id);

            // Send order receipt email
            try {
                const orderReceiptData = {
                    orderId: order._id.toString(),
                    user: {
                        _id: user._id.toString(),
                        name: user.name,
                        email: user.email,
                    },
                    cartItems: order.cartItems,
                    totalOrderPrice: order.totalOrderPrice,
                    paymentMethod: order.paymentMethod,
                    isPaid: order.isPaid,
                    isDelivered: order.isDelivered,
                    shippingAddress: order.shippingAddress,
                    createdAt: order.createdAt,
                    deliveredAt: order.deliveredAt,
                    paidAt: order.paidAt,
                };

                await this.emailService.sendOrderReceipt(user.email, orderReceiptData);
                this.logger.log(`Order receipt email sent for order: ${order._id}`);
            } catch (emailError) {
                this.logger.error('Failed to send order receipt email:', emailError);
            }

            this.logger.log(`Order created successfully: ${order._id}`);
        } catch (error) {
            this.logger.error('Error handling checkout session completed:', error);
        }
    }

    private async handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
        this.logger.log(`Payment succeeded: ${paymentIntent.id}`);
        // Additional logic if needed for successful payments
    }

    private async handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
        this.logger.log(`Payment failed: ${paymentIntent.id}`);
        // Handle failed payments - maybe send notification to user
    }
}
