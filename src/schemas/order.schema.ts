import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Auth } from './auth.schema';
import { Product } from './product.schema';

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class Order extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Auth', required: true })
  user: Auth;

  @Prop([
    {
      product: {
        type: MongooseSchema.Types.ObjectId,
        ref: 'Product',
        required: true,
      },
      quantity: { type: Number, default: 1 },
      price: { type: Number },
    },
  ])
  cartItems: { product: Product; quantity: number; price: number }[];

  @Prop({ type: Number, required: true })
  totalOrderPrice: number;

  @Prop({
    type: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      phone: { type: String, required: true },
    },
    required: true,
  })
  shippingAddress: { street: string; city: string; phone: string };

  @Prop({ type: String, enum: ['Cash', 'Card'], default: 'Cash' })
  paymentMethod: string;

  @Prop({ default: false })
  isPaid: boolean;

  @Prop({ type: Date })
  paidAt: Date;

  @Prop({ type: String }) 
  paymentId: string; // Stores transaction ID from Stripe, PayPal, etc.

  @Prop({ type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' })
  paymentStatus: string; // Status of the payment


  @Prop({ default: false })
  isDelivered: boolean;

  @Prop({ type: Date })
  deliveredAt: Date;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
