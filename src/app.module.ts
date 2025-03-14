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

@Module({
  imports: [
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

// import {
//   Module,
//   NestModule,
//   MiddlewareConsumer,
//   RequestMethod,
// } from '@nestjs/common';
// import { LoggerMiddleware } from './logger.module';
// import { AuthModule } from './auth/auth.module';
// import { ConfigModule } from '@nestjs/config';
// import { AuthController } from './auth/auth.controller';
// import configuration from './config/configuration';

// // consumer.apply(cors(), helmet(), logger).forRoutes(CatsController);

// @Module({
//   imports: [ConfigModule.forRoot({
//     envFilePath: '.env',
//     isGlobal : true,
//     load : [configuration]
//   }),AuthModule],
// })
// export class AppModule implements NestModule {
//   configure(consumer: MiddlewareConsumer) {
//     consumer
//       .apply(LoggerMiddleware)
//       .forRoutes({ path: 'auth', method: RequestMethod.GET });
//   }
// }
