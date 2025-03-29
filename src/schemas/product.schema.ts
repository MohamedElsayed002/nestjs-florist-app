import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { ProductDetail } from './product.detail.schema';

export type ProductDocument = Product & Document;

@Schema({ timestamps: true })
export class Product extends Document {
  @Prop({ min: 0 })
  price: number;

  @Prop({ min: 0, default: 0 })
  quantity: number;

  @Prop({ default: 0, min: 0 })
  sold: number;

  @Prop()
  image: string;

  @Prop()
  imageId: string;

  @Prop()
  category: string;

  // Add product details (translations)
  @Prop({
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: ProductDetail.name,
        required: true,
      },
    ],
  })
  details: Array<ProductDetail>;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
