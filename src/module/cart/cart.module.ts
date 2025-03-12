import { Module } from '@nestjs/common';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Cart, CartSchema } from 'src/schemas/cart.schema';
import { Product, productSchema } from 'src/schemas/product.schema';
import { Auth, authSchema } from 'src/schemas/auth.schema';
import { JwtService } from '@nestjs/jwt';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Cart.name, schema: CartSchema },
      { name: Product.name, schema: productSchema },
      { name: Auth.name, schema: authSchema },
    ]),
    AuthModule,
  ],
  controllers: [CartController],
  providers: [CartService, JwtService],
})
export class CartModule {}
