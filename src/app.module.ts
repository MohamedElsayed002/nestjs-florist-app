import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './module/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './module/user/user.module';
import { ProductModule } from './module/products/products.module';
import { CartModule } from './module/cart/cart.module';
import { OrderModule } from './module/order/order.module';
import { PaymentModule } from './module/payment/payment.module';
import { FavoriteModule } from './module/favorite/favorite.module';
import { StripeModule } from './module/stripe/stripe.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60 * 1000, // milliseconds
          limit: 20,
        },
      ],
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.MONGO_URL, {
      serverSelectionTimeoutMS: 20000,
      maxPoolSize: 20,
    }),
    AuthModule,
    UserModule,
    ProductModule,
    CartModule,
    OrderModule,
    PaymentModule,
    FavoriteModule,
    StripeModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
