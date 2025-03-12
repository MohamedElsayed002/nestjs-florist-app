import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, productSchema } from 'src/schemas/product.schema';
import { ConfigModule } from '@nestjs/config';
import { CloudinaryProvider } from 'src/service/cloundinary.provider';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from '../auth/auth.module'; // ✅ Import AuthModule

@Module({
  imports: [
    ConfigModule,
    AuthModule,
    MongooseModule.forFeature([{ name: Product.name, schema: productSchema }]),
  ],
  controllers: [ProductsController],
  providers: [ProductsService, CloudinaryProvider],
  exports: [CloudinaryProvider],
})
export class ProductModule {}
