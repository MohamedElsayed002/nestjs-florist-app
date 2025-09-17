import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order } from 'src/schemas/order.schema';
import { Cart } from 'src/schemas/cart.schema';
import { Product } from 'src/schemas/product.schema';
import { Auth } from 'src/schemas/auth.schema';
import { ProductDetail } from 'src/schemas/product.detail.schema';
import { ShippingAddressDto, statusShippingDto } from './dto/create.order.dto';
import { EmailService } from 'src/service/email.provider';
import { OrderRepository } from './repositories/order.repository';
import stripe from 'stripe';

@Injectable()
export class OrderService {
  constructor(
    private readonly orderRepository: OrderRepository,
    @InjectModel(Cart.name) private cartModel: Model<Cart>,
    @InjectModel(Product.name) private productModel: Model<Product>,
    @InjectModel(Auth.name) private authModel: Model<Auth>,
    private emailService: EmailService,
  ) {}

  // Pay online with proper webhook flow
  async createOrderStripeWithWebhook(
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
      throw new NotFoundException('Cart not found or empty');
    }

    // Get user information
    const user = await this.authModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Create line items with proper product names
    const line_items = cart.cartItems.map((item) => {
      // Get product name from details
      let productName = 'Product';
      if (item.product?.details && item.product.details.length > 0) {
        const englishDetail = item.product.details.find(
          (detail) => detail.lang === 'en',
        );
        const arabicDetail = item.product.details.find(
          (detail) => detail.lang === 'ar',
        );
        const anyDetail = item.product.details[0];
        productName =
          englishDetail?.title ||
          arabicDetail?.title ||
          anyDetail?.title ||
          'Product';
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
      const session = await new stripe.Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: '2025-02-24.acacia',
      }).checkout.sessions.create({
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
      console.log(error);
      throw new InternalServerErrorException('Stripe session creation failed');
    }
  }

  // Pay online (Legacy method - creates order immediately)
  async createOrderStripe(userId: string, lang) {
    const cart = await this.cartModel
      .findOne({ user: userId })
      .populate('cartItems.product');
    if (!cart || cart.cartItems.length === 0) {
      throw new NotFoundException('Cart not found or empty');
    }

    // Get user information
    const user = await this.authModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const line_items = cart.cartItems.map((item) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: 'Product 1',
        },
        unit_amount: Math.round(item.product.price * 100), // price per unit
      },
      quantity: item.quantity,
    }));

    try {
      const session = await new stripe.Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: '2025-02-24.acacia',
      }).checkout.sessions.create({
        payment_method_types: ['card'],
        line_items,
        mode: 'payment',
        success_url: `${process.env.CLIENT_URL}/${lang}`,
        cancel_url: `${process.env.CLIENT_URL}/cancel`,
        metadata: {
          userId: userId.toString(),
        },
      });

      const order = await this.orderRepository.create({
        user: userId,
        cartItems: cart.cartItems,
        totalOrderPrice: cart.totalPrice,
        paymentMethod: 'Card',
        isPaid: true,
        paidAt: new Date(),
        // I send static data here, because I'm not planning and the beginning to do it
        // and I need to make it in the future.
        // TODO
        shippingAddress: {
          city: 'city',
          street: 'Sedi bshr',
          phone: '+201093588197',
        },
      } as any);

      // Populate the order with product details for email
      await order.populate({
        path: 'cartItems.product',
        populate: {
          path: 'details',
          model: 'ProductDetail',
        },
      });

      const bulkUpdates = cart.cartItems.map((item) => ({
        updateOne: {
          filter: { _id: item.product },
          update: { $inc: { quantity: -item.quantity, sold: item.quantity } },
        },
      }));

      // Perform the bulk update for product stock
      await this.productModel.bulkWrite(bulkUpdates);

      // Delete the cart immediately after creating the session
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
      } catch (emailError) {
        console.error('Failed to send order receipt email:', emailError);
        // Don't throw error here to avoid breaking the order creation
      }

      return { url: session.url };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Stripe session creation failed');
    }
  }

  // Order on Delivery
  async createOrder(
    userId: string,
    shippingAddress: ShippingAddressDto,
  ): Promise<Order> {
    const cart = await this.cartModel
      .findOne({ user: userId })
      .populate('cartItems.product');

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    // Get user information
    const user = await this.authModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Create a new order
    const order = await this.orderRepository.create({
      user: userId,
      cartItems: cart.cartItems,
      paymentMethod: 'Cash',
      totalOrderPrice: cart.totalPrice,
      shippingAddress,
    } as any);

    // Populate the order with product details for email
    await order.populate({
      path: 'cartItems.product',
      populate: {
        path: 'details',
        model: 'ProductDetail',
      },
    });

    // If order created successfully, update stock & delete cart
    if (order) {
      const bulkUpdates = cart.cartItems.map((item) => ({
        updateOne: {
          filter: { _id: item.product },
          update: { $inc: { quantity: -item.quantity, sold: item.quantity } },
        },
      }));

      await this.productModel.bulkWrite(bulkUpdates);
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

        console.log(
          'Cash order - cartItems with populated products:',
          JSON.stringify(order.cartItems, null, 2),
        );
        await this.emailService.sendOrderReceipt(user.email, orderReceiptData);
      } catch (emailError) {
        console.error('Failed to send order receipt email:', emailError);
        // Don't throw error here to avoid breaking the order creation
      }
    }

    return order;
  }

  // ✅ Get all orders (Admin only)
  async getAllOrders(
    page = 1,
    limit = 10,
  ): Promise<{
    data: Order[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      this.orderRepository
        .find()
        .skip(skip)
        .limit(limit)
        .populate('user', 'email name')
        .populate('cartItems.product'),
      this.orderRepository.count(),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: orders,
      total,
      page,
      totalPages,
    };
  }

  // ✅ Get orders of a specific user
  async getUserOrders(userId: string): Promise<Order[]> {
    return await this.orderRepository
      .find({ user: userId })
      .populate('cartItems.product');
  }

  // ✅ Get single order (Admin or order owner only)
  async getSingleOrder(userId: string, orderId: string): Promise<Order> {
    const order = await this.orderRepository
      .findById(orderId)
      .populate({ path: 'user', select: 'email name' })
      .populate('cartItems.product');

    if (!order) {
      throw new BadRequestException('Order not found');
    }

    // Allow access only if the user owns the order or is an admin
    // if (order.user.toString() !== userId) {
    //     throw new ForbiddenException('You are not authorized to view this order');
    // }

    return order;
  }

  // ✅ Update order status (Admin only)
  async updateOrderStatus(
    orderId: string,
    status: statusShippingDto,
  ): Promise<Order> {
    const order = await this.orderRepository.updateById(orderId, {
      isDelivered: status.isDelivered,
      deliveredAt: status.deliveredAt ?? new Date(),
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  // ✅ Mark order as paid (Admin & User)
  async markOrderAsPaid(orderId: string): Promise<Order> {
    const order = await this.orderRepository.updateById(orderId, {
      isPaid: true,
      paidAt: new Date(),
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  // ✅ Cancel order (User only, before shipping)
  async cancelOrder(
    userId: string,
    orderId: string,
  ): Promise<{ message: string }> {
    const order = await this.orderRepository.findById(orderId);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.user.toString() !== userId.toString()) {
      throw new ForbiddenException('You can only cancel your own order');
    }

    if (order.isDelivered) {
      throw new BadRequestException(
        'Cannot cancel an order that has been delivered',
      );
    }

    await this.orderRepository.deleteById(orderId);
    return { message: 'Order cancelled successfully' };
  }

  // ✅ Delete order (Admin only)
  async deleteOrder(orderId: string): Promise<{ message: string }> {
    const order = await this.orderRepository.findById(orderId);
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.isDelivered) {
      throw new BadRequestException(
        'Cannot delete an order that has been delivered',
      );
    }

    await this.orderRepository.deleteById(orderId);
    return { message: 'Order deleted successfully' };
  }
}
