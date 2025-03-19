import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Order, OrderSchema } from 'src/schemas/order.schema';
import { Auth, authSchema } from 'src/schemas/auth.schema';
import { Product, ProductSchema } from 'src/schemas/product.schema';
import { AuthModule } from '../auth/auth.module';
import { JwtService } from '@nestjs/jwt';
import { Cart, CartSchema } from 'src/schemas/cart.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Cart.name, schema: CartSchema },
      { name: Order.name, schema: OrderSchema },
      { name: Auth.name, schema: authSchema },
      { name: Product.name, schema: ProductSchema },
    ]),
    AuthModule,
  ],
  controllers: [OrderController],
  providers: [OrderService, JwtService],
})
export class OrderModule {}
