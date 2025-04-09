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

  async getCart(userId: string, lang: string){
    // Find the cart associated with the user
    const cart = await this.cartModel.findOne({ user: userId }).populate({
      path: 'cartItems.product',
      populate: {
        path: 'details',
        match: { lang }, // Ensure product details are filtered by language
      },
    });
  
    // Case 1: If no cart is found for the user, return an empty cart
    if (!cart) {
      return {
        message: 'Cart not found',
        cartItems: [],
        totalPrice: 0,
        totalPriceDiscount: 0,
        id: null,
      };
    }
  
    // Case 2: Ensure each product has details in the requested language
    cart.cartItems = cart.cartItems.filter(
      (item) => item.product.details && item.product.details.length > 0,
    );
  
    // Case 3: If the cart has no items after filtering, return a message with an empty cart
    if (cart.cartItems.length === 0) {
      return {
        message: 'No items in the cart',
        cartItems: [],
        totalPrice: 0,
        totalPriceDiscount: 0,
        id: cart._id,
      };
    }
  
    // Case 4: If the cart has products, return the cart with the necessary details
    const totalPrice = cart.cartItems.reduce((total, item) => total + item.product.price * item.quantity, 0);
    const totalPriceDiscount = 0; // You can implement logic for discounts if needed
  
    return {
      message: 'Cart found',
      cartItems: cart.cartItems,
      totalPrice,
      totalPriceDiscount,
      id: cart._id,
    };
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
