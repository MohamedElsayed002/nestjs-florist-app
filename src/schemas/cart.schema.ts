import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, mongo, Schema as MongooseSchema } from 'mongoose';
import { Auth } from './auth.schema';
import { Product } from './product.schema';

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class Cart extends Document {
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

  @Prop({ type: Number, default: 0 })
  totalPrice: number;

  @Prop({ type: Number, default: 0 })
  totalPriceDiscount: number;
}

export const CartSchema = SchemaFactory.createForClass(Cart);
