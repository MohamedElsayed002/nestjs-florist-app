import {
  Injectable,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order } from 'src/schemas/order.schema';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PaymentService {
  private stripe: Stripe;

  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
    private configService: ConfigService,
  ) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-02-24.acacia',
    });
  }

  async createPaymentIntent(
    orderId: string,
  ): Promise<{ clientSecret: string }> {
    const order = await this.orderModel.findById(orderId);
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: order.totalOrderPrice * 100,
        currency: 'usd',
        metadata: { orderId: orderId },
      });

      return { clientSecret: paymentIntent.client_secret };
    } catch (error) {
      throw new InternalServerErrorException('Error creating payment intent');
    }
  }

  async confirmPayment(
    orderId: string,
    paymentIntentId: string,
  ): Promise<Order> {
    try {
      const paymentIntent =
        await this.stripe.paymentIntents.retrieve(paymentIntentId);

      console.log(paymentIntent);
      if (paymentIntent.status !== 'succeeded') {
        throw new BadRequestException('Payment not successful');
      }

      const updateOrder = await this.orderModel.findByIdAndUpdate(
        orderId,
        { isPaid: true, paidAt: new Date(), paymentMethod: 'Card' },
        { new: true },
      );

      if (!updateOrder) {
        throw new NotFoundException('Order not found');
      }

      return updateOrder;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Error confirming payment');
    }
  }
}
