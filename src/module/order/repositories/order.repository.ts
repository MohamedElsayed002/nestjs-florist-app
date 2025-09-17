import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order } from 'src/schemas/order.schema';

@Injectable()
export class OrderRepository {
  constructor(
    @InjectModel(Order.name)
    private readonly orderModel: Model<Order>,
  ) {}

  create(data: Partial<Order>) {
    const order = new this.orderModel(data);
    return order.save();
  }

  findById(id: string) {
    return this.orderModel.findById(id);
  }

  find(filter: any = {}) {
    return this.orderModel.find(filter);
  }

  updateById(id: string, update: Partial<Order>) {
    return this.orderModel.findByIdAndUpdate(id, update, { new: true });
  }

  deleteById(id: string) {
    return this.orderModel.findByIdAndDelete(id);
  }

  count() {
    return this.orderModel.countDocuments();
  }
}
