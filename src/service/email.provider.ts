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
    const htmlTemplate = this.generateVerificationEmailHTML(code);

    const mailOptions = {
      from: 'mohamedelsayed20258@gmail.com',
      to: email,
      subject: 'Password Reset Verification Code - Flower Obsession',
      text: `Your verification code is ${code}. The code will expire after 30 minutes.`,
      html: htmlTemplate,
    };

    await this.transporter.sendMail(mailOptions);
  }

  async sendOrderReceipt(email: string, orderData: any) {
    const htmlTemplate = this.generateOrderReceiptHTML(orderData);

    const mailOptions = {
      from: 'mohamedelsayed20258@gmail.com',
      to: email,
      subject: `Order Confirmation #${orderData.orderId} - Flower Obsession`,
      text: `Thank you for your order! Order #${orderData.orderId} has been confirmed. Total: $${orderData.totalOrderPrice}`,
      html: htmlTemplate,
    };

    await this.transporter.sendMail(mailOptions);
  }

  private generateVerificationEmailHTML(code: string): string {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset Verification</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                background-color: #f4f4f4;
            }
            
            .email-container {
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                border-radius: 10px;
                overflow: hidden;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            
            .header {
                background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                padding: 30px 20px;
                text-align: center;
            }
            
            .header h1 {
                color: #ffffff;
                font-size: 28px;
                font-weight: 600;
                margin-bottom: 10px;
            }
            
            .header p {
                color: #d1fae5;
                font-size: 16px;
            }
            
            .content {
                padding: 40px 30px;
            }
            
            .greeting {
                font-size: 18px;
                color: #374151;
                margin-bottom: 20px;
            }
            
            .message {
                font-size: 16px;
                color: #6b7280;
                margin-bottom: 30px;
                line-height: 1.7;
            }
            
            .code-container {
                background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
                border: 2px solid #10b981;
                border-radius: 12px;
                padding: 25px;
                text-align: center;
                margin: 30px 0;
            }
            
            .code-label {
                font-size: 14px;
                color: #059669;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 1px;
                margin-bottom: 10px;
            }
            
            .verification-code {
                font-size: 32px;
                font-weight: 700;
                color: #10b981;
                letter-spacing: 8px;
                font-family: 'Courier New', monospace;
                background-color: #ffffff;
                padding: 15px 20px;
                border-radius: 8px;
                border: 2px dashed #10b981;
                display: inline-block;
                margin: 10px 0;
            }
            
            .expiry-notice {
                background-color: #fef3c7;
                border-left: 4px solid #f59e0b;
                padding: 15px 20px;
                margin: 25px 0;
                border-radius: 0 8px 8px 0;
            }
            
            .expiry-notice p {
                color: #92400e;
                font-size: 14px;
                margin: 0;
                font-weight: 500;
            }
            
            .security-tips {
                background-color: #f8fafc;
                border: 1px solid #e2e8f0;
                border-radius: 8px;
                padding: 20px;
                margin: 25px 0;
            }
            
            .security-tips h3 {
                color: #374151;
                font-size: 16px;
                margin-bottom: 15px;
                font-weight: 600;
            }
            
            .security-tips ul {
                list-style: none;
                padding: 0;
            }
            
            .security-tips li {
                color: #6b7280;
                font-size: 14px;
                margin-bottom: 8px;
                padding-left: 20px;
                position: relative;
            }
            
            .security-tips li:before {
                content: "🔒";
                position: absolute;
                left: 0;
                top: 0;
            }
            
            .footer {
                background-color: #f9fafb;
                padding: 25px 30px;
                text-align: center;
                border-top: 1px solid #e5e7eb;
            }
            
            .footer p {
                color: #6b7280;
                font-size: 14px;
                margin-bottom: 10px;
            }
            
            .footer .company-info {
                color: #9ca3af;
                font-size: 12px;
            }
            
            .flower-icon {
                font-size: 24px;
                margin-right: 10px;
            }
            
            @media (max-width: 600px) {
                .email-container {
                    margin: 10px;
                    border-radius: 8px;
                }
                
                .header {
                    padding: 20px 15px;
                }
                
                .header h1 {
                    font-size: 24px;
                }
                
                .content {
                    padding: 30px 20px;
                }
                
                .verification-code {
                    font-size: 24px;
                    letter-spacing: 4px;
                    padding: 12px 15px;
                }
                
                .footer {
                    padding: 20px 15px;
                }
            }
        </style>
    </head>
    <body>
        <div class="email-container">
            <!-- Header -->
            <div class="header">
                <h1><span class="flower-icon">🌸</span>Flower Obsession</h1>
                <p>Your trusted online florist</p>
            </div>
            
            <!-- Main Content -->
            <div class="content">
                <div class="greeting">
                    Hello there! 👋
                </div>
                
                <div class="message">
                    We received a request to reset your password for your Flower Obsession account. 
                    To complete the password reset process, please use the verification code below:
                </div>
                
                <!-- Verification Code -->
                <div class="code-container">
                    <div class="code-label">Your Verification Code</div>
                    <div class="verification-code">${code}</div>
                </div>
                
                <!-- Expiry Notice -->
                <div class="expiry-notice">
                    <p>⏰ This code will expire in 30 minutes for your security.</p>
                </div>
                
                <!-- Security Tips -->
                <div class="security-tips">
                    <h3>Security Tips:</h3>
                    <ul>
                        <li>Never share this code with anyone</li>
                        <li>Our team will never ask for your verification code</li>
                        <li>If you didn't request this reset, please ignore this email</li>
                        <li>For security, this code can only be used once</li>
                    </ul>
                </div>
                
                <div class="message">
                    If you have any questions or need assistance, please don't hesitate to contact our support team.
                </div>
            </div>
            
            <!-- Footer -->
            <div class="footer">
                <p>Thank you for choosing Flower Obsession! 🌺</p>
                <div class="company-info">
                    <p>This email was sent from a secure system. Please do not reply to this email.</p>
                    <p>© 2025 Flower Obsession. All rights reserved.</p>
                </div>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  private generateOrderReceiptHTML(orderData: any): string {
    const formatDate = (date: Date) => {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    const getPaymentStatusColor = (isPaid: boolean, paymentMethod: string) => {
      if (paymentMethod === 'Card' && isPaid) return '#10b981'; // Green for paid online
      if (paymentMethod === 'Cash') return '#f59e0b'; // Orange for cash on delivery
      return '#ef4444'; // Red for pending
    };

    const getPaymentStatusText = (isPaid: boolean, paymentMethod: string) => {
      if (paymentMethod === 'Card' && isPaid) return 'Paid Online';
      if (paymentMethod === 'Cash') return 'Cash on Delivery';
      return 'Payment Pending';
    };

    const getDeliveryStatus = (isDelivered: boolean) => {
      return isDelivered ? 'Delivered' : 'Processing';
    };

    const getDeliveryStatusColor = (isDelivered: boolean) => {
      return isDelivered ? '#10b981' : '#f59e0b';
    };

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Receipt - Flower Obsession</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                background-color: #f4f4f4;
            }
            
            .email-container {
                max-width: 700px;
                margin: 0 auto;
                background-color: #ffffff;
                border-radius: 10px;
                overflow: hidden;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            
            .header {
                background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                padding: 30px 20px;
                text-align: center;
            }
            
            .header h1 {
                color: #ffffff;
                font-size: 28px;
                font-weight: 600;
                margin-bottom: 10px;
            }
            
            .header p {
                color: #d1fae5;
                font-size: 16px;
            }
            
            .order-status {
                background-color: #f0fdf4;
                border: 2px solid #10b981;
                border-radius: 8px;
                padding: 20px;
                margin: 20px;
                text-align: center;
            }
            
            .order-status h2 {
                color: #10b981;
                font-size: 24px;
                margin-bottom: 10px;
            }
            
            .order-info {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
                margin: 20px;
            }
            
            .info-card {
                background-color: #f9fafb;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                padding: 20px;
            }
            
            .info-card h3 {
                color: #374151;
                font-size: 16px;
                margin-bottom: 15px;
                font-weight: 600;
            }
            
            .info-item {
                display: flex;
                justify-content: space-between;
                margin-bottom: 8px;
                font-size: 14px;
            }
            
            .info-label {
                color: #6b7280;
                font-weight: 500;
            }
            
            .info-value {
                color: #374151;
                font-weight: 600;
            }
            
            .status-badge {
                display: inline-block;
                padding: 4px 12px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            
            .products-section {
                margin: 20px;
            }
            
            .products-section h3 {
                color: #374151;
                font-size: 20px;
                margin-bottom: 20px;
                font-weight: 600;
            }
            
            .product-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 15px;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                margin-bottom: 10px;
                background-color: #ffffff;
            }
            
            .product-info {
                flex: 1;
            }
            
            .product-name {
                font-weight: 600;
                color: #374151;
                margin-bottom: 5px;
            }
            
            .product-details {
                font-size: 14px;
                color: #6b7280;
            }
            
            .product-price {
                text-align: right;
                font-weight: 600;
                color: #10b981;
            }
            
            .total-section {
                background-color: #f0fdf4;
                border: 2px solid #10b981;
                border-radius: 8px;
                padding: 20px;
                margin: 20px;
            }
            
            .total-row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 10px;
                font-size: 16px;
            }
            
            .total-row.final {
                border-top: 2px solid #10b981;
                padding-top: 15px;
                margin-top: 15px;
                font-size: 20px;
                font-weight: 700;
                color: #10b981;
            }
            
            .shipping-info {
                background-color: #f8fafc;
                border: 1px solid #e2e8f0;
                border-radius: 8px;
                padding: 20px;
                margin: 20px;
            }
            
            .shipping-info h3 {
                color: #374151;
                font-size: 18px;
                margin-bottom: 15px;
                font-weight: 600;
            }
            
            .shipping-details {
                color: #6b7280;
                line-height: 1.8;
            }
            
            .footer {
                background-color: #f9fafb;
                padding: 25px 30px;
                text-align: center;
                border-top: 1px solid #e5e7eb;
            }
            
            .footer p {
                color: #6b7280;
                font-size: 14px;
                margin-bottom: 10px;
            }
            
            .footer .company-info {
                color: #9ca3af;
                font-size: 12px;
            }
            
            .flower-icon {
                font-size: 24px;
                margin-right: 10px;
            }
            
            .thank-you {
                background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
                border: 2px solid #10b981;
                border-radius: 8px;
                padding: 20px;
                margin: 20px;
                text-align: center;
            }
            
            .thank-you h2 {
                color: #10b981;
                font-size: 22px;
                margin-bottom: 10px;
            }
            
            .thank-you p {
                color: #059669;
                font-size: 16px;
            }
            
            @media (max-width: 600px) {
                .email-container {
                    margin: 10px;
                    border-radius: 8px;
                }
                
                .header {
                    padding: 20px 15px;
                }
                
                .header h1 {
                    font-size: 24px;
                }
                
                .order-info {
                    grid-template-columns: 1fr;
                    margin: 15px;
                }
                
                .product-item {
                    flex-direction: column;
                    align-items: flex-start;
                }
                
                .product-price {
                    text-align: left;
                    margin-top: 10px;
                }
                
                .info-card, .products-section, .total-section, .shipping-info, .thank-you {
                    margin: 15px;
                }
            }
        </style>
    </head>
    <body>
        <div class="email-container">
            <!-- Header -->
            <div class="header">
                <h1><span class="flower-icon">🌸</span>Flower Obsession</h1>
                <p>Your trusted online florist</p>
            </div>
            
            <!-- Order Status -->
            <div class="order-status">
                <h2>Order Confirmed! 🎉</h2>
                <p>Thank you for your purchase. We're preparing your beautiful flowers!</p>
            </div>
            
            <!-- Order Information -->
            <div class="order-info">
                <div class="info-card">
                    <h3>Order Details</h3>
                    <div class="info-item">
                        <span class="info-label">Order Number:</span>
                        <span class="info-value">#${orderData.orderId}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Order Date:</span>
                        <span class="info-value">${formatDate(orderData.createdAt)}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Payment Method:</span>
                        <span class="info-value">${orderData.paymentMethod}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Payment Status:</span>
                        <span class="status-badge" style="background-color: ${getPaymentStatusColor(orderData.isPaid, orderData.paymentMethod)}; color: white;">
                            ${getPaymentStatusText(orderData.isPaid, orderData.paymentMethod)}
                        </span>
                    </div>
                </div>
                
                <div class="info-card">
                    <h3>Delivery Information</h3>
                    <div class="info-item">
                        <span class="info-label">Delivery Status:</span>
                        <span class="status-badge" style="background-color: ${getDeliveryStatusColor(orderData.isDelivered)}; color: white;">
                            ${getDeliveryStatus(orderData.isDelivered)}
                        </span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Expected Delivery:</span>
                        <span class="info-value">2-5 business days</span>
                    </div>
                    ${orderData.isDelivered ? `
                    <div class="info-item">
                        <span class="info-label">Delivered On:</span>
                        <span class="info-value">${formatDate(orderData.deliveredAt)}</span>
                    </div>
                    ` : ''}
                </div>
            </div>
            
            <!-- Products Section -->
            <div class="products-section">
                <h3>Your Order Items</h3>
                ${orderData.cartItems.map(item => {
      // Handle product name from details array
      let productName = 'Product';

      if (item.product?.details && item.product.details.length > 0) {
        // Try to get English title first, then Arabic, then any available title
        const englishDetail = item.product.details.find(detail => detail.lang === 'en');
        const arabicDetail = item.product.details.find(detail => detail.lang === 'ar');
        const anyDetail = item.product.details[0];

        productName = englishDetail?.title || arabicDetail?.title || anyDetail?.title || 'Product';
      } else if (item.product?.name || item.product?.productName || item.product?.title) {
        // Fallback to direct product fields
        productName = item.product.name || item.product.productName || item.product.title;
      }

      return `
                  <div class="product-item">
                      <div class="product-info">
                          <div class="product-name">${productName}</div>
                          <div class="product-details">
                              Quantity: ${item.quantity} • Price: $${item.price}
                          </div>
                      </div>
                      <div class="product-price">
                          $${(item.quantity * item.price).toFixed(2)}
                      </div>
                  </div>
                  `;
    }).join('')}
            </div>
            
            <!-- Total Section -->
            <div class="total-section">
                <div class="total-row">
                    <span>Subtotal:</span>
                    <span>$${orderData.totalOrderPrice.toFixed(2)}</span>
                </div>
                <div class="total-row">
                    <span>Delivery Fee:</span>
                    <span>Free</span>
                </div>
                <div class="total-row final">
                    <span>Total Amount:</span>
                    <span>$${orderData.totalOrderPrice.toFixed(2)}</span>
                </div>
            </div>
            
            <!-- Shipping Information -->
            <div class="shipping-info">
                <h3>Shipping Address</h3>
                <div class="shipping-details">
                    <strong>${orderData.user.name}</strong><br>
                    ${orderData.shippingAddress.street}<br>
                    ${orderData.shippingAddress.city}<br>
                    Phone: ${orderData.shippingAddress.phone}
                </div>
            </div>
            
            <!-- Thank You Message -->
            <div class="thank-you">
                <h2>Thank You for Choosing Flower Obsession! 🌺</h2>
                <p>We're excited to deliver beautiful flowers to brighten your day. If you have any questions, please don't hesitate to contact us.</p>
            </div>
            
            <!-- Footer -->
            <div class="footer">
                <p>Need help? Contact our customer support team.</p>
                <div class="company-info">
                    <p>This is your official order receipt. Please keep this email for your records.</p>
                    <p>© 2025 Flower Obsession. All rights reserved.</p>
                </div>
            </div>
        </div>
    </body>
    </html>
    `;
  }
}
