import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  SetMetadata,
  UseGuards,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { AuthGuard } from 'src/gurad/auth/auth.guard';
import { CreateCartDto } from './dto/cart.dto';

@Controller('cart')
@UseGuards(AuthGuard) // Protect routes
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post('add/:productId')
  @SetMetadata('roles', ['Admin', 'User'])
  async addToCart(
    @Param('productId') productId: string,
    @Body() data: CreateCartDto,
  ) {
    return this.cartService.addToCart(data.userId, productId, data.quantity);
  }

  @Get(':userId')
  @SetMetadata('roles', ['Admin', 'User'])
  async getCart(
    @Param('userId') userId: string,
    @Query('lang') lang: string = 'en',
  ) {
    return this.cartService.getCart(userId, lang);
  }

  @Delete('remove/:productId')
  @SetMetadata('roles', ['Admin', 'User'])
  async removeFromCart(@Req() req, @Param('productId') productId: string) {
    const userId = req.user._id;
    return this.cartService.removeCart(userId, productId);
  }

  @Put('update/:productId')
  @SetMetadata('roles', ['Admin', 'User'])
  async updateProduct(
    @Param('productId') productId: string,
    @Body('quantity') quantity: number,
    @Req() req: any,
  ) {
    const userId = req.user._id;
    if (!quantity) {
      throw new BadRequestException('Quantity required');
    }
    return this.cartService.updateCart(userId, productId, quantity);
  }

  @Delete('remove')
  @SetMetadata('roles', ['Admin', 'User'])
  async clearCart(@Req() req: any) {
    const userId = req.user._id;
    return this.cartService.clearCart(userId);
  }
}
