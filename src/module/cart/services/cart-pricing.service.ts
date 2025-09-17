import { Injectable } from '@nestjs/common';

@Injectable()
export class CartPricingService {
  computeTotalPrice(cartItems: Array<{ price: number }>): number {
    return cartItems.reduce((total, item) => total + (item.price || 0), 0);
  }
}
