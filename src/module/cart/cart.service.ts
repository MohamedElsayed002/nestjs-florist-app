import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isNotEmpty } from 'class-validator';
import { Model } from 'mongoose';
import { Auth } from 'src/schemas/auth.schema';
import { Cart } from 'src/schemas/cart.schema';
import { Product } from 'src/schemas/product.schema';

@Injectable()
export class CartService {
  constructor(
    @InjectModel(Cart.name) private cartModel: Model<Cart>,
    @InjectModel(Product.name) private productModel: Model<Product>,
  ) {}

  async addToCart(
    userId: string,
    productId: string,
    quantity: number,
  ): Promise<Cart> {
    const product = await this.productModel.findById(productId);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    console.log(Product.name, Auth.name, 'ds');
    let cart = await this.cartModel.findOne({ user: userId });

    if (!cart) {
      cart = new this.cartModel({
        user: userId,
        cartItems: [],
        totalPrice: 0,
      });
    }

    const existingItem = cart.cartItems.find(
      (item) => item.product.toString() === productId,
    );
    if (existingItem) {
      // If product exists, update the quantity and price
      existingItem.quantity += quantity;
      existingItem.price = existingItem.quantity * product.price;
    } else {
      // If product is new, add it to the cart
      cart.cartItems.push({
        product: product,
        quantity,
        price: product.price * quantity,
      });
    }

    cart.totalPrice = cart.cartItems.reduce(
      (total, item) => total + item.price,
      0,
    );
    await cart.save();
    return cart;
  }

  async getCart(userId: string): Promise<Cart> {
    const cart = await this.cartModel
      .findOne({ user: userId })
      .populate('cartItems.product');

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    return cart;
  }

  async removeCart(userId: string, productId: string): Promise<Cart> {
    const cart = await this.cartModel.findOne({ user: userId });

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    const productIndex = cart.cartItems.findIndex(
      (item) => item.product.toString() === productId,
    );

    if (productIndex === -1) {
      throw new NotFoundException('Product not found in cart');
    }

    cart.cartItems.splice(productIndex, 1);

    cart.totalPrice = cart.cartItems.reduce(
      (total, item) => total + item.price,
      0,
    );

    if (cart.cartItems.length === 0) {
      await this.cartModel.findByIdAndDelete(cart._id);
      return null;
    }

    await cart.save();
    return cart;
  }
}

