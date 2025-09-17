export const PAYMENT_GATEWAY = Symbol('PAYMENT_GATEWAY');

export interface PaymentGateway {
  createPaymentIntent(params: {
    amountCents: number;
    currency: string;
    metadata?: Record<string, any>;
  }): Promise<{ clientSecret: string }>;

  confirmPayment(paymentIntentId: string): Promise<void>;
}
