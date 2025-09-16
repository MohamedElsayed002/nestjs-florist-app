import { Module } from '@nestjs/common';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Cart, CartSchema } from 'src/schemas/cart.schema';
import { Product, ProductSchema } from 'src/schemas/product.schema';
import { Auth, authSchema } from 'src/schemas/auth.schema';
import { JwtService } from '@nestjs/jwt';
import { AuthModule } from '../auth/auth.module';
import { CartRepository } from './repositories/cart.repository';
import { CartPricingService } from './services/cart-pricing.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Cart.name, schema: CartSchema },
      { name: Product.name, schema: ProductSchema },
      { name: Auth.name, schema: authSchema },
    ]),
    AuthModule,
  ],
  controllers: [CartController],
  providers: [CartService, JwtService, CartRepository, CartPricingService],
})
export class CartModule {}
