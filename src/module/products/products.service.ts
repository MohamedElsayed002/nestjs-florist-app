import { BadRequestException, Body, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Product, ProductDocument } from '../../schemas/product.schema';
import { CreateProductDto } from './dto/product.dto';
import {
  ProductDetail,
  ProductDetailDocument,
} from '../../schemas/product.detail.schema';
import slugify from 'slugify';
import { ProductRepository } from './repositories/product.repository';
import { ProductSearchService } from './services/product-search.service';
import { ProductImageService } from './services/product-image.service';
@Injectable()
export class ProductService {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly productSearchService: ProductSearchService,
    private readonly productImageService: ProductImageService,
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
    const product = await this.productRepository.create({
      price: createProductDto.price,
      quantity: createProductDto.quantity,
    });
    const details: mongoose.Types.ObjectId[] = [];
    for (const detailData of slugs) {
      const detail = new this.productDetailModel(detailData);
      await detail.save();
      details.push(detail._id as mongoose.Types.ObjectId);
    }
    const populatedDetails = await this.productDetailModel
      .find({ _id: { $in: details } })
      .exec();
    const updated = await this.productRepository.updateById(product._id, {
      details: populatedDetails as any,
    } as any);
    return updated as any;
  }
  async getAllProducts(
    lang: string,
    category: string = '', // Optional, defaults to empty string
    search: string = '',
  ): Promise<Array<ProductDocument>> {
    try {
      const validLang = await this.productSearchService.validateLang(lang);
      if (!validLang) {
        console.warn(`Invalid lang: ${lang}. Valid languages: ${validLangs}`);
        return [];
      }

      // Step 2: Query ProductDetail for matching title and lang
      const filter = await this.productSearchService.buildFilterByLangCategoryAndSearch(
        lang,
        category,
        search,
      );
      if (filter === null) {
        console.log(
          'No matching ProductDetails found for search, returning empty array',
        );
        return [];
      }
      if (Array.isArray(filter)) {
        return [];
      }
      const products = await this.productRepository
        .findWithDetails(filter, lang)
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

      return filteredProducts as any;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw new Error(`Failed to fetch products: ${error.message}`);
    }
  }

  async getShopProducts(lang: string): Promise<Array<ProductDocument>> {
    return this.productRepository
      .findWithDetails({ category: 'shop' }, lang)
      .exec();
  }

  // Fetch a single product with language filtering
  async getSingleProduct(lang: string, productId: string) {
    const product = await this.productRepository.findById(productId).populate({
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

    return this.productImageService.uploadImage(file);
  }

  // Add an image to a product
  async addImageToProduct(
    productId: string,
    file: Express.Multer.File,
  ): Promise<Product> {
    const product = await this.productRepository.findById(productId);
    if (!product) {
      throw new BadRequestException('Product not found.');
    }

    if (!file) {
      throw new BadRequestException('File is missing.');
    }

    // If an image already exists, delete it from Cloudinary
    if (product.imageId) {
      await this.productImageService.deleteImage(product.imageId);
    }

    // Upload new image
    const { imageId, imageUrl } = await this.uploadImage(file);

    // Update product with new image
    const updatedProduct = await this.productRepository.updateById(productId, {
      image: imageUrl,
      imageId,
    } as any);

    return updatedProduct;
  }

  // Delete a product and its details
  async deleteProduct(productId: string): Promise<{ message: string }> {
    const product = await this.productRepository.findById(productId);
    if (!product) {
      throw new BadRequestException('Product not found.');
    }

    if (product.imageId) {
      await this.productImageService.deleteImage(product.imageId);
    }

    await this.productDetailModel.deleteMany({ _id: { $in: product.details } });
    await this.productRepository.deleteById(productId);

    return { message: 'Product deleted successfully.' };
  }

  // Update product price or quantity
  async updateProductStock(
    productId: string,
    updateData: { price?: number; quantity?: number },
  ): Promise<Product> {
    const product = await this.productRepository.updateById(
      productId,
      updateData as any,
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
    const product = await this.productRepository
      .findWithDetails({ details: productDetail._id }, lang)
      .exec();

    if (!product) {
      throw new BadRequestException('Product not found.');
    }

    return product;
  }
}
