import { Injectable, NotImplementedException } from '@nestjs/common';

@Injectable()
export class PaymentsService {
  async createStripePayment(amount: number, currency: string = 'usd') {
    throw new NotImplementedException('Stripe payments are not configured');
  }

  async createSSLCommerzPayment(amount: number) {
    throw new NotImplementedException('SSLCommerz payments are not configured');
  }

  async verifyPayment(paymentId: string) {
    throw new NotImplementedException('Payment verification is not configured');
  }
}
