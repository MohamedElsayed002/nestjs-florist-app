import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Product extends Document {
  @Prop({ trim: true })
  title: string;

  @Prop({ unique: true, lowercase: true, trim: true })
  slug: string;

  @Prop({ min: 0 })
  price: number;

  @Prop({ minlength: 5, maxlength: 300, trim: true })
  description: string;

  @Prop({ min: 0, default: 0 })
  quantity: number;

  @Prop({ default: 0, min: 0 })
  sold: number;

  @Prop()
  image: string;

  @Prop()
  imageId: string;
}

export const productSchema = SchemaFactory.createForClass(Product);
