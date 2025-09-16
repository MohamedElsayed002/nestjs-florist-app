import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { PaymentGateway } from './tokens';

@Injectable()
export class StripeGateway implements PaymentGateway {
  private readonly stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-02-24.acacia',
    });
  }

  async createPaymentIntent(params: {
    amountCents: number;
    currency: string;
    metadata?: Record<string, any>;
  }): Promise<{ clientSecret: string }> {
    const intent = await this.stripe.paymentIntents.create({
      amount: params.amountCents,
      currency: params.currency,
      metadata: params.metadata,
    });
    return { clientSecret: intent.client_secret };
  }

  async confirmPayment(paymentIntentId: string): Promise<void> {
    const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
    if (paymentIntent.status !== 'succeeded') {
      throw new Error('Payment not successful');
    }
  }
}


