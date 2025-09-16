import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Order, OrderSchema } from 'src/schemas/order.schema';
import { Auth, authSchema } from 'src/schemas/auth.schema';
import { Product, ProductSchema } from 'src/schemas/product.schema';
import { ProductDetail, ProductDetailSchema } from 'src/schemas/product.detail.schema';
import { AuthModule } from '../auth/auth.module';
import { JwtService } from '@nestjs/jwt';
import { Cart, CartSchema } from 'src/schemas/cart.schema';
import { EmailService } from 'src/service/email.provider';
import { OrderRepository } from './repositories/order.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Cart.name, schema: CartSchema },
      { name: Order.name, schema: OrderSchema },
      { name: Auth.name, schema: authSchema },
      { name: Product.name, schema: ProductSchema },
      { name: ProductDetail.name, schema: ProductDetailSchema },
    ]),
    AuthModule,
  ],
  controllers: [OrderController],
  providers: [OrderService, JwtService, EmailService, OrderRepository],
})
export class OrderModule { }
