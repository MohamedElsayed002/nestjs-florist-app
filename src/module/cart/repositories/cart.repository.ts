import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cart } from 'src/schemas/cart.schema';

@Injectable()
export class CartRepository {
  constructor(
    @InjectModel(Cart.name)
    private readonly cartModel: Model<Cart>,
  ) {}

  findByUser(userId: string) {
    return this.cartModel.findOne({ user: userId });
  }

  create(data: Partial<Cart>) {
    const cart = new this.cartModel(data);
    return cart.save();
  }

  deleteById(id: string) {
    return this.cartModel.findByIdAndDelete(id);
  }

  save(cart: any) {
    return cart.save();
  }
}
