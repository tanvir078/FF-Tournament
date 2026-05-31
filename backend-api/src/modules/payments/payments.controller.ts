import { Controller, Post, Put, Body, Param } from '@nestjs/common';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Post('stripe')
  async createStripePayment(@Body('amount') amount: number) {
    return this.paymentsService.createStripePayment(amount);
  }

  @Post('sslcommerz')
  async createSSLCommerzPayment(@Body('amount') amount: number) {
    return this.paymentsService.createSSLCommerzPayment(amount);
  }

  @Post('verify/:paymentId')
  async verifyPayment(@Param('paymentId') paymentId: string) {
    return this.paymentsService.verifyPayment(paymentId);
  }
}
