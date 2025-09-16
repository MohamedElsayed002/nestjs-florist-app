import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery } from 'mongoose';
import { Product, ProductDocument } from 'src/schemas/product.schema';

@Injectable()
export class ProductRepository {
  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
  ) {}

  create(data: Partial<Product>): Promise<ProductDocument> {
    const product = new this.productModel(data);
    return product.save();
  }

  findById(id: string) {
    return this.productModel.findById(id);
  }

  findOne(filter: FilterQuery<ProductDocument>) {
    return this.productModel.findOne(filter);
  }

  find(filter: FilterQuery<ProductDocument>) {
    return this.productModel.find(filter);
  }

  findWithDetails(filter: FilterQuery<ProductDocument>, lang: string) {
    return this.productModel
      .find(filter)
      .populate({ path: 'details', match: { lang } });
  }

  updateById(id: string, update: Partial<Product>) {
    return this.productModel.findByIdAndUpdate(id, update, { new: true });
  }

  deleteById(id: string) {
    return this.productModel.findByIdAndDelete(id);
  }

  countByCategory(category: string) {
    return this.productModel.countDocuments({ category });
  }

  distinctCategories() {
    return this.productModel.distinct('category');
  }
}


