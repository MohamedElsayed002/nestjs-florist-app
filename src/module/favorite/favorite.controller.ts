import {
  Controller,
  Post,
  Param,
  UseGuards,
  SetMetadata,
  Req,
  Query,
  Get,
} from '@nestjs/common';
import { FavoriteService } from './favorite.service';
import { AuthGuard } from 'src/gurad/auth/auth.guard';

@Controller('favorite')
@UseGuards(AuthGuard) // Protect routes
export class FavoriteController {
  constructor(private readonly favoriteService: FavoriteService) {}

  @Post(':productId')
  @SetMetadata('roles', ['Admin', 'User'])
  async toggleFavorite(@Param('productId') productId: string, @Req() req: any) {
    return this.favoriteService.toggleFavorite(req.user._id, productId);
  }

  @Get('/:userId')
  @SetMetadata('roles', ['Admin', 'User'])
  async getFavorites(
    @Query('lang') lang: string,
    @Param('userId') userId: string,
  ) {
    return this.favoriteService.getFavorite(userId, lang);
  }
}
