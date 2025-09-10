import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StripeController } from './stripe.controller';
import { StripeService } from './stripe.service';
import { Order, OrderSchema } from 'src/schemas/order.schema';
import { Cart, CartSchema } from 'src/schemas/cart.schema';
import { Product, ProductSchema } from 'src/schemas/product.schema';
import { Auth, authSchema } from 'src/schemas/auth.schema';
import { ProductDetail, ProductDetailSchema } from 'src/schemas/product.detail.schema';
import { EmailService } from 'src/service/email.provider';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Order.name, schema: OrderSchema },
            { name: Cart.name, schema: CartSchema },
            { name: Product.name, schema: ProductSchema },
            { name: Auth.name, schema: authSchema },
            { name: ProductDetail.name, schema: ProductDetailSchema },
        ]),
    ],
    controllers: [StripeController],
    providers: [StripeService, EmailService],
    exports: [StripeService],
})
export class StripeModule { }

