import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { v2 as cloudinary, UploadStream } from 'cloudinary';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product } from 'src/schemas/product.schema';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';
@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<Product>,
  ) {}

  // find by name. product name must be unique in the database
  async isTitleTake(title: string): Promise<boolean> {
    const product = await this.productModel.findOne({ title });
    return !!product;
  }

  async uploadImage(
    file: Express.Multer.File,
  ): Promise<{ imageUrl: string; imageId: string }> {
    if (!file) {
      throw new Error('File is missing! Ensure you are sending a valid file.');
    }

    return new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ folder: 'products' }, (error, result) => {
          if (error) {
            reject(new Error('Failed to upload image to Cloudinary.'));
          } else {
            resolve({ imageUrl: result.secure_url, imageId: result.public_id });
          }
        })
        .end(file.buffer);
    });
  }
  async createProduct(
    createProductDto: CreateProductDto,
    file: Express.Multer.File,
  ): Promise<Product> {
    const { imageUrl, imageId } = await this.uploadImage(file);

    createProductDto.image = imageUrl;
    createProductDto.imageId = imageId;

    const newProduct = new this.productModel(createProductDto);
    await newProduct.save();

    return newProduct;
  }

  async getAllProducts(): Promise<Product[]> {
    const products = this.productModel.find();
    return products;
  }

  async getProductBySlug(slug: string): Promise<Product> {
    const product = await this.productModel.findOne({ slug });
    if (!product) {
      throw new BadRequestException('Product not found');
    }
    return product;
  }

  async updateProduct(
    productId: string,
    updateData: UpdateProductDto,
    file?: Express.Multer.File,
  ): Promise<Product> {
    const product = await this.productModel.findById(productId);
    if (!product) {
      throw new NotFoundException('Product not found.');
    }

    // check if title is changing and already taken or no
    if (updateData.title && updateData.title !== product.title) {
      const isTitleTake = await this.isTitleTake(updateData.title);
      if (isTitleTake) {
        throw new BadRequestException(
          'Product title already exists. Please choose another one',
        );
      }
    }

    if (file) {
      // Delete old image
      if (product.imageId) {
        await cloudinary.uploader.destroy(product.imageId);
      }
      const { imageId, imageUrl } = await this.uploadImage(file);
      updateData.image = imageUrl;
      updateData.imageId = imageId;
    }

    const updateProduct = await this.productModel.findByIdAndUpdate(
      productId,
      updateData,
      { new: true },
    );
    return updateProduct;
  }

  async deleteProduct(id: string): Promise<{ message: string }> {
    const product = await this.productModel.findByIdAndDelete(id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    if (product.imageId) {
      await cloudinary.uploader.destroy(product.imageId);
    }
    return { message: 'Product deleted successfully' };
  }
}
