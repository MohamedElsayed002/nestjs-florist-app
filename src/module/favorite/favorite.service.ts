import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Auth } from 'src/schemas/auth.schema';
import { Favorite, FavoriteDocument } from 'src/schemas/favorite.schema';
import { FavoriteRepository } from './repositories/favorite.repository';

@Injectable()
export class FavoriteService {
  constructor(
    private readonly favoriteRepository: FavoriteRepository,
    @InjectModel(Auth.name) private userModel: Model<Auth>,
  ) {}

  async toggleFavorite(userId: string, productId: string) {
    const user = await this.userModel.findOne({ _id: userId });
    if (!user) {
      throw new BadRequestException('User not found');
    }
    let favorite = await this.favoriteRepository.findByUser(userId);

    if (!favorite) {
      favorite = await this.favoriteRepository.create({
        user: userId,
        products: [productId] as any,
      } as any);
      return { message: 'Product added to Favorite' };
    }

    const index = favorite.products.findIndex(
      (product) => product.toString() === productId,
    );
    // const productObjectId = new Types.ObjectId(productId); // Convert productId to ObjectId

    if (index === -1) {
      // Product not found, add it
      favorite.products.push(new Types.ObjectId(productId));
      await this.favoriteRepository.save(favorite);
      return { message: 'Product added to Favorite' };
    } else {
      // Product exists, remove it
      favorite.products.splice(index, 1);
      await this.favoriteRepository.save(favorite);
      return { message: 'Product removed from Favorite' };
    }
  }

  async getFavorite(userId: string, lang: string) {
    const favorites = await this.favoriteRepository
      .findByUser(userId)
      .populate({
        path: 'products',
        populate: {
          path: 'details',
          match: { lang },
        },
      });

    if (!favorites) {
      // Still using NotFoundException, but response is clean and structured
      throw new NotFoundException({
        success: false,
        message: 'No favorites found for this user.',
        data: null,
      });
    }

    return {
      success: true,
      message:
        favorites.products.length > 0
          ? 'Favorites fetched successfully.'
          : 'Favorites list is empty.',
      data: favorites, // assuming 1 list per user
    };
  }
}
