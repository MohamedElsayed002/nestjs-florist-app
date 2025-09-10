import {
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
  Body,
  Param,
  Put,
  Delete,
  SetMetadata,
  Query,
} from '@nestjs/common';
import { AuthGuard } from 'src/gurad/auth/auth.guard';
import { OrderService } from './order.service';
import { ShippingAddressDto, statusShippingDto } from './dto/create.order.dto';
import { TestUserGuard } from 'src/gurad/test-user/test-user.guard';

@Controller('order')
@UseGuards(AuthGuard) // Protect routes
export class OrderController {
  constructor(private readonly orderService: OrderService) { }

  @Post('add-stripe')
  @UseGuards(TestUserGuard)
  @SetMetadata('roles', ['User', 'Admin'])
  async createOrderStripe(@Req() req: any, @Query('lang') lang: string = 'en') {
    const userId = req.user._id;
    return this.orderService.createOrderStripe(userId, lang);
  }

  @Post('add-stripe-webhook')
  @SetMetadata('roles', ['User', 'Admin'])
  async createOrderStripeWithWebhook(
    @Req() req: any,
    @Query('lang') lang: string = 'en',
    @Body() shippingAddress: ShippingAddressDto
  ) {
    const userId = req.user._id;
    return this.orderService.createOrderStripeWithWebhook(userId, lang, shippingAddress);
  }

  // ✅ Create a new order (User)
  @Post('add')
  @UseGuards(TestUserGuard)
  @SetMetadata('roles', ['Admin', 'User'])
  async createOrder(
    @Req() req: any,
    @Body() shippingAddress: ShippingAddressDto,
  ) {
    const userId = req.user._id;
    return this.orderService.createOrder(userId, shippingAddress);
  }

  // ✅ Get all orders (Admin only)
  @Get('')
  @SetMetadata('roles', ['Admin'])
  async getAllOrders(
    @Query('page') page: string,
    @Query('limit') limit: string,
  ) {
    const pageNumber = parseInt(page, 10) || 1;
    const limitNumber = parseInt(limit, 10) || 10;

    return this.orderService.getAllOrders(pageNumber, limitNumber);
  }

  // ✅ Get all orders of the logged-in user (User only)
  @Get('my-orders')
  @SetMetadata('roles', ['User', 'Admin'])
  async getUserOrders(@Req() req: any) {
    const userId = req.user._id;
    return this.orderService.getUserOrders(userId);
  }

  // ✅ Get a single order (Admin or User if they own the order)
  @Get(':id')
  @SetMetadata('roles', ['Admin', 'User'])
  async getSingleOrder(@Req() req: any, @Param('id') orderId: string) {
    const userId = req.user._id;
    return this.orderService.getSingleOrder(userId, orderId);
  }

  // ✅ Update order status (Admin only)
  @Put('order-status/:id')
  @SetMetadata('roles', ['Admin'])
  async updateOrderStatus(
    @Param('id') orderId: string,
    @Body() status: statusShippingDto,
  ) {
    return this.orderService.updateOrderStatus(orderId, status);
  }

  // ✅ Mark order as paid (Admin & User)
  @Put('make-order-paid/:id')
  @SetMetadata('roles', ['Admin', 'User'])
  async makeOrderAsPaid(@Param('id') orderId: string) {
    return this.orderService.markOrderAsPaid(orderId);
  }

  // ✅ Cancel an order (User only, before delivery)
  @Delete('cancel/:id')
  @SetMetadata('roles', ['User', 'Admin'])
  async cancelOrder(@Req() req: any, @Param('id') orderId: string) {
    const userId = req.user._id;
    return this.orderService.cancelOrder(userId, orderId);
  }

  // ✅ Delete an order (Admin only)
  @Delete('delete/:id')
  @SetMetadata('roles', ['Admin'])
  async deleteOrder(@Param('id') orderId: string) {
    return this.orderService.deleteOrder(orderId);
  }
}
