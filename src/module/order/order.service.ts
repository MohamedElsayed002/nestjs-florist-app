import {
    Injectable,
    NotFoundException,
    InternalServerErrorException,
    BadRequestException,
    ForbiddenException,
  } from '@nestjs/common';
  import { InjectModel } from '@nestjs/mongoose';
  import { Model } from 'mongoose';
  import { Order } from 'src/schemas/order.schema';
  import { Cart } from 'src/schemas/cart.schema';
  import { Product } from 'src/schemas/product.schema';
  import { ShippingAddressDto, statusShippingDto } from './dto/create.order.dto';
  
  @Injectable()
  export class OrderService {
    constructor(
      @InjectModel(Order.name) private orderModel: Model<Order>,
      @InjectModel(Cart.name) private cartModel: Model<Cart>,
      @InjectModel(Product.name) private productModel: Model<Product>,
    ) {}
  
    // ✅ Create an order
    async createOrder(
      userId: string,
      shippingAddress: ShippingAddressDto,
    ): Promise<Order> {
      const cart = await this.cartModel.findOne({ user: userId });
      if (!cart) {
        throw new NotFoundException('Cart not found');
      }
  
      // Create a new order
      const order = new this.orderModel({
        user: userId,
        cartItems: cart.cartItems,
        totalOrderPrice: cart.totalPrice,
        shippingAddress,
      });
  
      await order.save();
  
      // If order created successfully, update stock & delete cart
      if (order) {
        let bulkUpdates = cart.cartItems.map((item) => ({
          updateOne: {
            filter: { _id: item.product },
            update: { $inc: { quantity: -item.quantity, sold: item.quantity } },
          },
        }));
  
        await this.productModel.bulkWrite(bulkUpdates);
        await this.cartModel.findByIdAndDelete(cart._id);
      }
  
      return order;
    }
  
    // ✅ Get all orders (Admin only)
    async getAllOrders(): Promise<Order[]> {
      return await this.orderModel
        .find()
        .populate('user', 'email name')
        .populate('cartItems.product');
    }
  
    // ✅ Get orders of a specific user
    async getUserOrders(userId: string): Promise<Order[]> {
      return await this.orderModel
        .find({ user: userId })
        .populate('cartItems.product');
    }
  
    // ✅ Get single order (Admin or order owner only)
    async getSingleOrder(userId: string, orderId: string): Promise<Order> {
      const order = await this.orderModel
        .findById(orderId)
        .populate({ path: 'user', select: 'email name' })
        .populate('cartItems.product');
  
      if (!order) {
        throw new BadRequestException('Order not found');
      }
  
      // Allow access only if the user owns the order or is an admin
      // if (order.user.toString() !== userId) {
      //     throw new ForbiddenException('You are not authorized to view this order');
      // }
  
      return order;
    }
  
    // ✅ Update order status (Admin only)
    async updateOrderStatus(
      orderId: string,
      status: statusShippingDto,
    ): Promise<Order> {
      const order = await this.orderModel.findByIdAndUpdate(
        orderId,
        {
          isDelivered: status.isDelivered,
          deliveredAt: status.deliveredAt ?? new Date(),
        },
        { new: true },
      );
  
      if (!order) {
        throw new NotFoundException('Order not found');
      }
  
      return order;
    }
  
    // ✅ Mark order as paid (Admin & User)
    async markOrderAsPaid(orderId: string): Promise<Order> {
      const order = await this.orderModel.findByIdAndUpdate(
        orderId,
        { isPaid: true, paidAt: new Date() },
        { new: true },
      );
  
      if (!order) {
        throw new NotFoundException('Order not found');
      }
  
      return order;
    }
  
    // ✅ Cancel order (User only, before shipping)
    async cancelOrder(
      userId: string,
      orderId: string,
    ): Promise<{ message: string }> {
      const order = await this.orderModel.findById(orderId);
  
      if (!order) {
        throw new NotFoundException('Order not found');
      }
      
      if (order.user.toString() !== userId.toString()) {
        throw new ForbiddenException('You can only cancel your own order');
      }
  
      if (order.isDelivered) {
        throw new BadRequestException(
          'Cannot cancel an order that has been delivered',
        );
      }
  
      await this.orderModel.findByIdAndDelete(orderId);
      return { message: 'Order cancelled successfully' };
    }
  
    // ✅ Delete order (Admin only)
    async deleteOrder(orderId: string): Promise<{ message: string }> {
      const order = await this.orderModel.findById(orderId);
      if (!order) {
        throw new NotFoundException('Order not found');
      }
  
      if (order.isDelivered) {
        throw new BadRequestException(
          'Cannot delete an order that has been delivered',
        );
      }
  
      await this.orderModel.findByIdAndDelete(orderId);
      return { message: 'Order deleted successfully' };
    }
  }