import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Favorite, FavoriteDocument } from 'src/schemas/favorite.schema';

@Injectable()
export class FavoriteRepository {
  constructor(
    @InjectModel(Favorite.name)
    private readonly favoriteModel: Model<FavoriteDocument>,
  ) {}

  findByUser(userId: string) {
    return this.favoriteModel.findOne({ user: userId });
  }

  create(data: Partial<Favorite>) {
    const favorite = new this.favoriteModel(data);
    return favorite.save();
  }

  save(favorite: any) {
    return favorite.save();
  }
}


