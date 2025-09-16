import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Order, OrderSchema } from 'src/schemas/order.schema';
import { ConfigModule } from '@nestjs/config';
import { PAYMENT_GATEWAY } from './tokens';
import { StripeGateway } from './stripe.gateway';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Order.name, schema: OrderSchema }]),
    ConfigModule,
  ],
  providers: [
    PaymentService,
    { provide: PAYMENT_GATEWAY, useClass: StripeGateway },
  ],
  controllers: [PaymentController],
  exports: [PaymentService],
})
export class PaymentModule {}
