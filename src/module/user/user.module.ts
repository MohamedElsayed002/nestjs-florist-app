import { Module } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { AuthModule } from '../auth/auth.module';
import { JwtService } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { Auth, authSchema } from 'src/schemas/auth.schema';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { EmailService } from 'src/service/email.provider';
import { ProductModule } from '../products/products.module';
import { Product, ProductSchema } from 'src/schemas/product.schema';
import { Order, OrderSchema } from 'src/schemas/order.schema';
import { OrderModule } from '../order/order.module';

@Module({
  imports: [
    AuthModule,
    ProductModule,
    OrderModule,
    MongooseModule.forFeature([
      { name: Auth.name, schema: authSchema },
      { name: Product.name, schema: ProductSchema },
      { name: Order.name, schema: OrderSchema },
    ]),
  ],
  controllers: [UserController],
  providers: [JwtService, UserService, EmailService],
  exports: [AuthService], // ✅ Export AuthService so other modules can use it
})
export class UserModule {}
