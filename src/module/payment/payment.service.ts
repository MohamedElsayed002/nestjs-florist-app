import {
  Injectable,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order } from 'src/schemas/order.schema';
import { ConfigService } from '@nestjs/config';
import { Inject } from '@nestjs/common';
import { PAYMENT_GATEWAY, PaymentGateway } from './tokens';

@Injectable()
export class PaymentService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
    private configService: ConfigService,
    @Inject(PAYMENT_GATEWAY) private readonly gateway: PaymentGateway,
  ) {}

  async createPaymentIntent(
    orderId: string,
  ): Promise<{ clientSecret: string }> {
    const order = await this.orderModel.findById(orderId);
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    try {
      const paymentIntent = await this.gateway.createPaymentIntent({
        amountCents: Math.round(order.totalOrderPrice * 100),
        currency: 'usd',
        metadata: { orderId },
      });

      return paymentIntent;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Error creating payment intent');
    }
  }

  async confirmPayment(
    orderId: string,
    paymentIntentId: string,
  ): Promise<Order> {
    try {
      await this.gateway.confirmPayment(paymentIntentId);

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
