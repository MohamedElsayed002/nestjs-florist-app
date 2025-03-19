import { Module } from '@nestjs/common';
// import { ProductsController } from './products.controllers';
import { ProductController } from './products.controller';
import { ProductService } from './products.service';
// import { ProductsService } from './products.services';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductSchema } from 'src/schemas/product.schema';
import {
  ProductDetail,
  ProductDetailSchema,
} from 'src/schemas/product.detail.schema';
import { ConfigModule } from '@nestjs/config';
import { CloudinaryProvider } from 'src/service/cloundinary.provider';
import { AuthModule } from '../auth/auth.module'; // ✅ Import AuthModule

@Module({
  imports: [
    ConfigModule,
    AuthModule,
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
      { name: ProductDetail.name, schema: ProductDetailSchema }, // ✅ Register ProductDetail schema
    ]),
  ],
  controllers: [ProductController],
  providers: [ProductService, CloudinaryProvider],
  exports: [CloudinaryProvider],
})
export class ProductModule {}
