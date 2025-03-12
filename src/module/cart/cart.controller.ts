import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { AuthGuard } from 'src/gurad/auth/auth.guard';

@Controller('cart')
@UseGuards(AuthGuard) // Protect routes
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get('')
  async getAllCarts(@Req() req) {
    console.log(req.user);
    return 'dasfdsf';
  }
  @Post('add/:productId')
  async addToCart(
    @Param('productId') productId: string,
    @Body('userId') userId: string,
    @Body('quantity') quantity: number,
  ) {
    return this.cartService.addToCart(userId, productId, quantity);
  }

  @Get(':userId')
  async getCart(@Param('userId') userId: string) {
    return this.cartService.getCart(userId);
  }

  @Delete('remove/:productId')
  async removeFromCart(@Req() req, @Param('productId') productId: string) {
    const userId = req.user._id;
    return this.cartService.removeCart(userId, productId);
  }
}
