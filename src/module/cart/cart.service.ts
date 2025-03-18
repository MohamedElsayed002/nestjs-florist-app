import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cart } from '../../schemas/cart.schema';
import { Product } from '../../schemas/product.schema';

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

    // check the quantity of products in stock
    if (quantity > product.quantity) {
      throw new BadRequestException("we don't have all this quantity");
    }

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

  async removeCart(
    userId: string,
    productId: string,
  ): Promise<{ message: string }> {
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
      return { message: 'product removed from cart. your cart is empty' };
    }

    await cart.save();
    return { message: 'product removed from cart' };
  }

  async updateCart(
    userId: string,
    productId: string,
    quantity: number,
  ): Promise<Cart> {
    const cart = await this.cartModel
      .findOne({ user: userId })
      .populate('cartItems.product'); // Ensure product details are populated

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    const itemIndex = cart.cartItems.findIndex(
      (item) => item.product._id.toString() === productId, // Use `_id` instead of `toString()`
    );

    if (itemIndex > -1) {
      // Ensure product exists and has a price before calculation
      const product = cart.cartItems[itemIndex].product;
      if (
        !product ||
        product.price === undefined ||
        product.quantity === undefined
      ) {
        throw new NotFoundException('Product details not found');
      }

      // Check if requested quantity exceeds stock
      if (quantity > product.quantity) {
        throw new BadRequestException(
          `Exceeded stock. Only ${product.quantity} available.`,
        );
      }

      cart.cartItems[itemIndex].quantity = quantity;
      cart.cartItems[itemIndex].price = quantity * product.price;
    } else {
      throw new NotFoundException('Product not found in cart');
    }

    cart.totalPrice = cart.cartItems.reduce(
      (total, item) => total + item.price,
      0,
    );

    return await cart.save();
  }

  async clearCart(userId: string): Promise<Cart> {
    const cart = await this.cartModel.findOne({ user: userId });
    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    cart.cartItems = [];
    cart.totalPrice = 0;
    cart.totalPriceDiscount = 0;
    return await cart.save();
  }
}
