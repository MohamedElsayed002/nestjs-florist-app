import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';
import { Product } from './product.schema';
import { Auth } from './auth.schema';

@Schema()
export class Favorite {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: Auth.name, required: true })
  user: Types.ObjectId[];

  @Prop({
    type: [{ type: MongooseSchema.Types.ObjectId, ref: Product.name }],
    required: true,
  })
  products: Types.ObjectId[];
}

export type FavoriteDocument = HydratedDocument<Favorite>;
export const FavoriteSchema = SchemaFactory.createForClass(Favorite);
