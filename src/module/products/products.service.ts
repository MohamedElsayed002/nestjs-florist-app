import { BadRequestException, Body, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Product, ProductDocument } from '../../schemas/product.schema';
import { CreateProductDto } from './dto/product.dto';
import {
  ProductDetail,
  ProductDetailDocument,
} from '../../schemas/product.detail.schema';
import { v2 as cloudinary } from 'cloudinary';
import slugify from 'slugify';
@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(ProductDetail.name)
    private productDetailModel: Model<ProductDetailDocument>,
  ) {}

  // Check if a product title is already taken
  async isTitleTaken(title: string): Promise<boolean> {
    const product = await this.productDetailModel.findOne({ title });
    return !!product;
  }

  // Create a new product

  async createProduct(
    @Body() createProductDto: CreateProductDto,
  ): Promise<Product> {
    if (!createProductDto.details || createProductDto.details.length !== 2) {
      throw new BadRequestException(
        'Product must have exactly one Arabic and one English detail.',
      );
    }

    if (!createProductDto.category) {
      throw new BadRequestException('Category is required');
    }

    // Generate slugs for both details
    const slugs = createProductDto.details.map((detail) => ({
      ...detail,
      slug:
        detail.lang === 'ar'
          ? detail.title.replace(/\s+/g, '-')
          : slugify(detail.title, { lower: true, strict: true }),
    }));

    // Check if any slug already exists
    const existingSlug = await this.productDetailModel.findOne({
      slug: { $in: slugs.map((d) => d.slug) },
    });

    if (existingSlug) {
      throw new BadRequestException(
        `A product detail with the slug "${existingSlug.slug}" already exists.`,
      );
    }

    // Create a new product
    const product = new this.productModel({
      price: createProductDto.price,
      quantity: createProductDto.quantity,
    });

    const details: mongoose.Types.ObjectId[] = [];

    for (const detailData of slugs) {
      const detail = new this.productDetailModel(detailData);
      await detail.save();
      details.push(detail._id as mongoose.Types.ObjectId);
    }

    product.details = await this.productDetailModel
      .find({
        _id: { $in: details },
      })
      .exec();

    await product.save();
    return product;
  }
  async getAllProducts(
    lang: string,
    category: string = '', // Optional, defaults to empty string
    search: string = '',
  ): Promise<Array<ProductDocument>> {
    try {
      const validLangs = await this.productDetailModel.distinct('lang').exec();
      if (!validLangs.includes(lang)) {
        console.warn(`Invalid lang: ${lang}. Valid languages: ${validLangs}`);
        return [];
      }

      // Step 2: Query ProductDetail for matching title and lang
      const detailQuery: any = { lang };
      const trimmedSearch = search?.trim() || '';
      if (trimmedSearch) {
        detailQuery.title = { $regex: trimmedSearch, $options: 'i' };
      }

      const productDetails = await this.productDetailModel
        .find(detailQuery)
        .exec();

      // Step 3: Get ProductDetail IDs
      const detailIds = productDetails.map((detail) => detail._id);

      // Step 4: Build Product filter
      const filter: any = {};
      if (category?.trim()) {
        const trimmedCategory = category.trim();
        const validCategories = await this.productModel
          .distinct('category')
          .exec();
        if (!validCategories.includes(trimmedCategory)) {
          console.warn(
            `Invalid category: ${trimmedCategory}. Valid categories: ${validCategories}`,
          );
        } else {
          filter.category = trimmedCategory;
          const categoryCheck = await this.productModel
            .countDocuments({ category: trimmedCategory })
            .exec();
          if (categoryCheck === 0) {
            console.warn(`No products found with category: ${trimmedCategory}`);
          }
        }
      }
      if (trimmedSearch && detailIds.length > 0) {
        filter.details = { $in: detailIds };
      } else if (trimmedSearch && detailIds.length === 0) {
        console.log(
          'No matching ProductDetails found for search, returning empty array',
        );
        return [];
      }

      // Step 5: Query Products and populate details
      const products = await this.productModel
        .find(filter)
        .populate({
          path: 'details',
          match: { lang },
        })
        .exec();

      // Step 6: Filter out products with empty details
      const filteredProducts = products.filter(
        (product) => product.details.length > 0,
      );

      if (filteredProducts.length === 0 && products.length > 0) {
        console.warn(
          'All products filtered out due to empty details after population',
        );
      } else if (filteredProducts.length === 0) {
        console.warn('No products found matching the criteria');
      }

      return filteredProducts;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw new Error(`Failed to fetch products: ${error.message}`);
    }
  }

  async getShopProducts(lang: string): Promise<Array<ProductDocument>> {
    return this.productModel
      .find({ category: 'shop' })
      .populate({ path: 'details', match: { lang } })
      .exec();
  }

  // Fetch a single product with language filtering
  async getSingleProduct(lang: string, productId: string) {
    const product = await this.productModel.findById(productId).populate({
      path: 'details',
      match: { lang },
    });

    if (!product || !product.details || product.details.length === 0) {
      throw new BadRequestException(
        'Product not found for the given language.',
      );
    }

    return product;
  }

  // Upload an image to Cloudinary
  async uploadImage(
    file: Express.Multer.File,
  ): Promise<{ imageUrl: string; imageId: string }> {
    if (!file) {
      throw new BadRequestException(
        'File is missing! Ensure you are sending a valid file.',
      );
    }

    return new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ folder: 'products' }, (error, result) => {
          if (error) {
            reject(new Error('Failed to upload image to Cloudinary'));
          } else {
            resolve({ imageUrl: result.secure_url, imageId: result.public_id });
          }
        })
        .end(file.buffer);
    });
  }

  // Add an image to a product
  async addImageToProduct(
    productId: string,
    file: Express.Multer.File,
  ): Promise<Product> {
    const product = await this.productModel.findById(productId);
    if (!product) {
      throw new BadRequestException('Product not found.');
    }

    if (!file) {
      throw new BadRequestException('File is missing.');
    }

    // If an image already exists, delete it from Cloudinary
    if (product.imageId) {
      try {
        await cloudinary.uploader.destroy(product.imageId);
      } catch (error) {
        console.error('Error deleting old image:', error);
      }
    }

    // Upload new image
    const { imageId, imageUrl } = await this.uploadImage(file);

    // Update product with new image
    const updatedProduct = await this.productModel.findByIdAndUpdate(
      productId,
      { image: imageUrl, imageId: imageId },
      { new: true },
    );

    return updatedProduct;
  }

  // Delete a product and its details
  async deleteProduct(productId: string): Promise<{ message: string }> {
    const product = await this.productModel.findById(productId);
    if (!product) {
      throw new BadRequestException('Product not found.');
    }

    if (product.imageId) {
      try {
        await cloudinary.uploader.destroy(product.imageId);
      } catch (error) {
        console.error('Error deleting old image:', error);
      }
    }

    await this.productDetailModel.deleteMany({ _id: { $in: product.details } });
    await this.productModel.findByIdAndDelete(productId);

    return { message: 'Product deleted successfully.' };
  }

  // Update product price or quantity
  async updateProductStock(
    productId: string,
    updateData: { price?: number; quantity?: number },
  ): Promise<Product> {
    const product = await this.productModel.findByIdAndUpdate(
      productId,
      updateData,
      { new: true },
    );

    if (!product) {
      throw new BadRequestException('Product not found.');
    }

    return product;
  }

  async getProductBySlug(slug: string, lang: string): Promise<ProductDocument> {
    // Find the product detail by slug and language
    const productDetail = await this.productDetailModel.findOne({ slug, lang });

    if (!productDetail) {
      throw new BadRequestException('Product with this slug not found.');
    }

    // Find the associated product
    const product = await this.productModel
      .findOne({ details: productDetail._id })
      .populate({
        path: 'details',
        match: { lang }, // Return only the requested language details
      })
      .exec();

    if (!product) {
      throw new BadRequestException('Product not found.');
    }

    return product;
  }
}
