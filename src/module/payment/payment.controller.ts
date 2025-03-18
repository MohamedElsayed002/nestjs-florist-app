import { Controller, Post, Param, Body } from '@nestjs/common';
import { PaymentService } from './payment.service';

@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('create-payment-intent/:orderId')
  async createPaymentIntent(@Param('orderId') orderId: string) {
    return this.paymentService.createPaymentIntent(orderId);
  }

  @Post('confirm-payment/:orderId')
  async confirmPayment(
    @Param('orderId') orderId: string,
    @Body('paymentIntentId') paymentIntentId: string
  ) {
    return this.paymentService.confirmPayment(orderId, paymentIntentId);
  }
}
