import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ProductDetailDocument = ProductDetail & Document;

@Schema()
export class ProductDetail extends Document {
  @Prop({ type: String, index: true })
  lang: string; // 'en' or 'ar'

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  slug: string;

  @Prop({ required: true })
  description: string;
}

export const ProductDetailSchema = SchemaFactory.createForClass(ProductDetail);
