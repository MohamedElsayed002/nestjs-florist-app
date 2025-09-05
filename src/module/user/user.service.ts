import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { CreateUserDto } from '../auth/dto/auth.dto';
import { Auth } from 'src/schemas/auth.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { EmailService } from 'src/service/email.provider';
import { Product } from 'src/schemas/product.schema';
import { Order } from 'src/schemas/order.schema';
import { formatDate } from 'utils';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(Auth.name) private authModel: Model<Auth>,
    @InjectModel(Product.name) private productModel: Model<Product>,
    @InjectModel(Order.name) private orderModel: Model<Order>,
    private authService: AuthService,
    private emailService: EmailService,
  ) { }

  async forgotPassword(email: string): Promise<{ message: string }> {
    const user = await this.authModel.findOne({ email });
    if (!user) {
      throw new NotFoundException('Email not found');
    }
    const verificationCode = Math.floor(
      100000 + Math.random() * 900000,
    ).toString(); // 6-digit code
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 30); // Set expiry time to 30 minutes
    user.verificationCode = verificationCode;
    user.codeExpiresAt = expiresAt;
    await user.save();
    await this.emailService.sendVerificationCode(email, verificationCode);
    return { message: 'Verification code send to your email' };
  }

  async adminStats() {
    // Basic counts
    const users = await this.authModel.countDocuments();
    const products = await this.productModel.countDocuments();
    const totalOrders = await this.orderModel.countDocuments();
    const paidOrders = await this.orderModel
      .find({ isPaid: true })
      .countDocuments();

    // Revenue calculations
    const totalRevenue = await this.calculateTotalRevenue();
    const monthlyRevenue = await this.calculateMonthlyRevenue();
    const averageOrderValue = totalRevenue / (paidOrders || 1);

    // Top customers
    const topCustomers = await this.getTopCustomers(5);

    // Product performance
    const topProducts = await this.getTopSellingProducts(5);
    const lowStockProducts = await this.getLowStockProducts();

    // Order status distribution
    const orderStatusDistribution = await this.getOrderStatusDistribution();

    // Recent activity
    const recentOrders = await this.getRecentOrders(10);
    const newUsersThisMonth = await this.getNewUsersThisMonth();

    // Conversion metrics
    const conversionRate = (paidOrders / totalOrders) * 100;

    return {
      // Basic metrics
      users,
      products,
      totalOrders,
      paidOrders,

      // Revenue metrics
      totalRevenue,
      monthlyRevenue,
      averageOrderValue: Math.round(averageOrderValue * 100) / 100,

      // Customer insights
      topCustomers,
      newUsersThisMonth,

      // Product insights
      topProducts,
      lowStockProducts,

      // Order insights
      orderStatusDistribution,
      recentOrders,

      // Performance metrics
      conversionRate: Math.round(conversionRate * 100) / 100,
    };
  }

  // Chart data [{"date": "March 2025", "count": 3},{"date": "April 2025",count:9}]
  async fetchChartData() {
    const date = new Date();
    date.setMonth(date.getMonth() - 6);
    const sixMonthsAgo = date;

    const orders = await this.orderModel
      .find({
        createdAt: { $gte: sixMonthsAgo },
        isPaid: true,
      })
      .sort({ createdAt: 'asc' })
      .lean();

    const ordersPerMonth = orders.reduce(
      (total, current) => {
        const date = formatDate(current?.createdAt, true);
        const exitingEntry = total.find((entry) => entry.date === date);
        if (exitingEntry) {
          exitingEntry.count += 1;
        } else {
          total.push({ date, count: 1 });
        }
        return total;
      },
      [] as Array<{ date: string; count: number }>,
    );
    return ordersPerMonth;
  }

  async verifyCode(email: string, code: string): Promise<{ message: string }> {
    const user = await this.authModel.findOne({ email });

    if (!user) {
      throw new NotFoundException('Email not found');
    }

    // Check if code exists
    if (!user.verificationCode) {
      throw new BadRequestException(
        'No verification code found. Request a new one.',
      );
    }

    if (user.codeExpiresAt && new Date() > user.codeExpiresAt) {
      user.verificationCode = null;
      user.codeExpiresAt = null;
      await user.save();
      throw new BadRequestException(
        'Verification code expired. Please request a new one.',
      );
    }

    if (user.verificationCode !== code) {
      throw new BadRequestException('Invalid verification code');
    }

    user.verificationCode = null;
    user.codeExpiresAt = null;
    await user.save();
    return {
      message: 'Verification successful. You can now reset your password.',
    };
  }

  async forgotPasswordComplete(
    email: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    const user = await this.authModel.findOne({ email });

    if (!user) {
      throw new NotFoundException('Email not found');
    }

    // Ensure the user has verified their code before allowing password reset
    if (user.verificationCode) {
      throw new BadRequestException(
        'Verification code not confirmed. Please verify your code first.',
      );
    }

    if (newPassword.length < 8) {
      throw new BadRequestException(
        'Password must be at least 8 characters long.',
      );
    }

    // Hash the password asynchronously
    const hashPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password
    user.password = hashPassword;

    await user.save();

    return { message: 'Password changed successfully' };
  }

  async updateUser(id: string, updateUser: CreateUserDto) {
    if (updateUser.password) {
      updateUser.password = bcrypt.hashSync(updateUser.password, 8);
    }
    const user = await this.authModel.findByIdAndUpdate(id, updateUser, {
      new: true,
    });
    return user;
  }

  async deleteUser(
    requesterId: string,
    targetUserId: string,
    requesterRole: string,
  ): Promise<{ message: string }> {
    const userToDelete = await this.authService.findById(targetUserId);
    if (!userToDelete) {
      throw new NotFoundException('User not found');
    }

    if (requesterId.toString() !== targetUserId && requesterRole !== 'Admin') {
      throw new ForbiddenException('You are not allowed to delete this user');
    }

    await this.authModel.findByIdAndDelete(targetUserId);

    return { message: 'user deleted successfully' };
  }

  // ========== ADMIN ANALYTICS HELPER METHODS ==========

  /**
   * Calculate total revenue from all paid orders
   */
  private async calculateTotalRevenue(): Promise<number> {
    const result = await this.orderModel.aggregate([
      { $match: { isPaid: true } },
      { $group: { _id: null, total: { $sum: '$totalOrderPrice' } } }
    ]);
    return result.length > 0 ? result[0].total : 0;
  }

  /**
   * Calculate revenue for current month
   */
  private async calculateMonthlyRevenue(): Promise<number> {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const result = await this.orderModel.aggregate([
      {
        $match: {
          isPaid: true,
          createdAt: { $gte: startOfMonth }
        }
      },
      { $group: { _id: null, total: { $sum: '$totalOrderPrice' } } }
    ]);
    return result.length > 0 ? result[0].total : 0;
  }

  /**
   * Get top customers by total spending
   */
  private async getTopCustomers(limit: number = 5) {
    return await this.orderModel.aggregate([
      { $match: { isPaid: true } },
      {
        $group: {
          _id: '$user',
          totalSpent: { $sum: '$totalOrderPrice' },
          orderCount: { $sum: 1 },
          lastOrderDate: { $max: '$createdAt' }
        }
      },
      {
        $lookup: {
          from: 'auths',
          localField: '_id',
          foreignField: '_id',
          as: 'userInfo'
        }
      },
      { $unwind: '$userInfo' },
      {
        $project: {
          userId: '$_id',
          name: '$userInfo.name',
          email: '$userInfo.email',
          totalSpent: 1,
          orderCount: 1,
          lastOrderDate: 1
        }
      },
      { $sort: { totalSpent: -1 } },
      { $limit: limit }
    ]);
  }

  /**
   * Get top selling products by quantity sold
   */
  private async getTopSellingProducts(limit: number = 5) {
    return await this.orderModel.aggregate([
      { $match: { isPaid: true } },
      { $unwind: '$cartItems' },
      {
        $group: {
          _id: '$cartItems.product',
          totalQuantitySold: { $sum: '$cartItems.quantity' },
          totalRevenue: { $sum: { $multiply: ['$cartItems.quantity', '$cartItems.price'] } },
          orderCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'productInfo'
        }
      },
      { $unwind: '$productInfo' },
      {
        $lookup: {
          from: 'productdetails',
          localField: 'productInfo.details',
          foreignField: '_id',
          as: 'productDetails'
        }
      },
      {
        $project: {
          productId: '$_id',
          productName: { $arrayElemAt: ['$productDetails.title', 0] },
          currentPrice: '$productInfo.price',
          currentStock: '$productInfo.quantity',
          totalQuantitySold: 1,
          totalRevenue: 1,
          orderCount: 1
        }
      },
      { $sort: { totalQuantitySold: -1 } },
      { $limit: limit }
    ]);
  }

  /**
   * Get products with low stock (less than 10 items)
   */
  private async getLowStockProducts() {
    return await this.productModel.aggregate([
      { $match: { quantity: { $lt: 10 } } },
      {
        $lookup: {
          from: 'productdetails',
          localField: 'details',
          foreignField: '_id',
          as: 'productDetails'
        }
      },
      {
        $project: {
          productId: '$_id',
          productName: { $arrayElemAt: ['$productDetails.title', 0] },
          currentStock: '$quantity',
          price: 1,
          category: 1
        }
      },
      { $sort: { quantity: 1 } }
    ]);
  }

  /**
   * Get order status distribution
   */
  private async getOrderStatusDistribution() {
    return await this.orderModel.aggregate([
      {
        $group: {
          _id: {
            isPaid: '$isPaid',
            isDelivered: '$isDelivered',
            paymentStatus: '$paymentStatus'
          },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          status: {
            $cond: {
              if: { $and: ['$_id.isPaid', '$_id.isDelivered'] },
              then: 'Delivered',
              else: {
                $cond: {
                  if: '$_id.isPaid',
                  then: 'Paid',
                  else: {
                    $cond: {
                      if: { $eq: ['$_id.paymentStatus', 'failed'] },
                      then: 'Failed',
                      else: 'Pending'
                    }
                  }
                }
              }
            }
          },
          count: 1
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: '$count' }
        }
      },
      { $sort: { count: -1 } }
    ]);
  }

  /**
   * Get recent orders with user information
   */
  private async getRecentOrders(limit: number = 10) {
    return await this.orderModel.aggregate([
      { $sort: { createdAt: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: 'auths',
          localField: 'user',
          foreignField: '_id',
          as: 'userInfo'
        }
      },
      { $unwind: '$userInfo' },
      {
        $project: {
          orderId: '$_id',
          customerName: '$userInfo.name',
          customerEmail: '$userInfo.email',
          totalAmount: '$totalOrderPrice',
          isPaid: 1,
          isDelivered: 1,
          paymentMethod: 1,
          createdAt: 1,
          itemCount: { $size: '$cartItems' }
        }
      }
    ]);
  }

  /**
   * Get count of new users registered this month
   */
  private async getNewUsersThisMonth(): Promise<number> {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    return await this.authModel.countDocuments({
      createdAt: { $gte: startOfMonth }
    });
  }

  /**
   * Get detailed revenue analytics for charts
   */
  async getRevenueAnalytics() {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    // Monthly revenue data
    const monthlyRevenue = await this.orderModel.aggregate([
      {
        $match: {
          isPaid: true,
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: { $sum: '$totalOrderPrice' },
          orderCount: { $sum: 1 }
        }
      },
      {
        $project: {
          date: {
            $dateFromParts: {
              year: '$_id.year',
              month: '$_id.month',
              day: 1
            }
          },
          revenue: 1,
          orderCount: 1
        }
      },
      { $sort: { date: 1 } }
    ]);

    // Daily revenue for current month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const dailyRevenue = await this.orderModel.aggregate([
      {
        $match: {
          isPaid: true,
          createdAt: { $gte: startOfMonth }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          revenue: { $sum: '$totalOrderPrice' },
          orderCount: { $sum: 1 }
        }
      },
      {
        $project: {
          date: {
            $dateFromParts: {
              year: '$_id.year',
              month: '$_id.month',
              day: '$_id.day'
            }
          },
          revenue: 1,
          orderCount: 1
        }
      },
      { $sort: { date: 1 } }
    ]);

    return {
      monthlyRevenue,
      dailyRevenue
    };
  }

  /**
   * Get customer analytics
   */
  async getCustomerAnalytics() {
    // Customer acquisition over time
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const customerAcquisition = await this.authModel.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          newCustomers: { $sum: 1 }
        }
      },
      {
        $project: {
          date: {
            $dateFromParts: {
              year: '$_id.year',
              month: '$_id.month',
              day: 1
            }
          },
          newCustomers: 1
        }
      },
      { $sort: { date: 1 } }
    ]);

    // Customer lifetime value distribution
    const customerLTV = await this.orderModel.aggregate([
      { $match: { isPaid: true } },
      {
        $group: {
          _id: '$user',
          totalSpent: { $sum: '$totalOrderPrice' },
          orderCount: { $sum: 1 }
        }
      },
      {
        $bucket: {
          groupBy: '$totalSpent',
          boundaries: [0, 50, 100, 200, 500, 1000, Infinity],
          default: 'Other',
          output: {
            count: { $sum: 1 },
            avgOrderCount: { $avg: '$orderCount' }
          }
        }
      }
    ]);

    return {
      customerAcquisition,
      customerLTV
    };
  }
}
