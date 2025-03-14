import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Order } from './order.schema';
import { Auth } from './auth.schema';

@Schema({ timestamps: true })
export class Payment extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Order', required: true })
  order: Order;

  @Prop({
    type: String,
    enum: ['Pending', 'Completed', 'Failed'],
    default: 'Pending',
  })
  user: Auth;

  @Prop({
    type: String,
    enum: ['Pending', 'Completed', 'Failed'],
    default: 'Pending',
  })
  status: string;

  @Prop({ type: Number, required: true })
  amount: number;

  @Prop({ type: String })
  transactionId: string; // From Stripe/PayPal

  @Prop({ type: String })
  paymentMethod: string;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
