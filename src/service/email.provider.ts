import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

Injectable();
export class EmailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.NODEMAILER_EMAIL,
        pass: process.env.NODEMAILER_PASSWORD,
      },
    });
  }

  async sendVerificationCode(email: string, code: string) {
    const mailOptions = {
      from: 'mohamedelsayed20258@gmail.com',
      to: email,
      subject: 'Password Reset Verification Code',
      text: `Your verification code is ${code}. </br> the code will expire after 30 minutes `,
    };

    await this.transporter.sendMail(mailOptions);
  }
}
