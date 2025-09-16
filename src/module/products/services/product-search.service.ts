import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ProductDetail, ProductDetailDocument } from 'src/schemas/product.detail.schema';
import { ProductRepository } from '../repositories/product.repository';

@Injectable()
export class ProductSearchService {
  constructor(
    private readonly productRepository: ProductRepository,
    @InjectModel(ProductDetail.name)
    private readonly productDetailModel: Model<ProductDetailDocument>,
  ) {}

  async validateLang(lang: string): Promise<boolean> {
    const validLangs = await this.productDetailModel.distinct('lang').exec();
    return validLangs.includes(lang);
  }

  async buildFilterByLangCategoryAndSearch(
    lang: string,
    category?: string,
    search?: string,
  ): Promise<Record<string, any> | null> {
    const detailQuery: any = { lang };
    const trimmedSearch = search?.trim() || '';
    if (trimmedSearch) {
      detailQuery.title = { $regex: trimmedSearch, $options: 'i' };
    }

    const productDetails = await this.productDetailModel.find(detailQuery).exec();
    const detailIds = productDetails.map((detail) => detail._id);

    const filter: any = {};
    if (category?.trim()) {
      const trimmedCategory = category.trim();
      const validCategories = await this.productRepository.distinctCategories();
      if (validCategories.includes(trimmedCategory)) {
        filter.category = trimmedCategory;
        const categoryCheck = await this.productRepository.countByCategory(
          trimmedCategory,
        );
        if (categoryCheck === 0) {
          return [] as any; // no products in this category
        }
      }
    }

    if (trimmedSearch && detailIds.length > 0) {
      filter.details = { $in: detailIds };
    } else if (trimmedSearch && detailIds.length === 0) {
      return null; // explicitly no results
    }

    return filter;
  }
}


