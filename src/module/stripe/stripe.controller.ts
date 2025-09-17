import {
  Controller,
  Post,
  Req,
  Res,
  Headers,
  RawBody,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { StripeService } from './stripe.service'; // Stripe service import

@Controller('stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  @Post('webhook')
  async handleWebhook(
    @Req() req: Request,
    @Res() res: Response,
    @Headers('stripe-signature') signature: string,
    @RawBody() body: Buffer,
  ) {
    try {
      await this.stripeService.handleWebhook(body, signature);
      res.status(200).send('Webhook handled successfully');
    } catch (error) {
      console.error('Webhook error:', error);
      throw new HttpException('Webhook error', HttpStatus.BAD_REQUEST);
    }
  }
}
