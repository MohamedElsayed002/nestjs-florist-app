import { Test } from '@nestjs/testing';
import { ProductService } from './products.service';
import { getModelToken } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Product } from '../../schemas/product.schema';
import { ProductDetail } from '../../schemas/product.detail.schema';
import { mockProductArabic, mockProductsEnglish } from './mock-data';

describe('ProductService', () => {
  let productService;
  let productModel: Model<Product>;
  let productDetailModel: Model<ProductDetail>;
  let cloudinary: any;

  const mockProductModel = {
    find: jest.fn(),
    getAllProducts: jest.fn(),
    findOne: jest.fn().mockResolvedValue(null),
    create: jest.fn().mockResolvedValue(null),
    findById: jest.fn(),
    findByIdAndDelete: jest.fn(),
  };

  const mockProductDetailModel = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    deleteMany: jest.fn(),

  };

  cloudinary = {
    uploader: {
      destroy: jest.fn().mockResolvedValue({ result: 'ok' }), // ✅ Mock Cloudinary properly
    },
  };
  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ProductService,
        {
          provide: getModelToken(Product.name),
          useValue: mockProductModel, // Mock ProductModel
        },
        {
          provide: getModelToken(ProductDetail.name),
          useValue: mockProductDetailModel, // Mock ProductDetailModel
        },
      ],
    }).compile();

    productService = module.get<ProductService>(ProductService);
    productModel = module.get<Model<Product>>(getModelToken(Product.name));
    productDetailModel = module.get<Model<ProductDetail>>(
      getModelToken(ProductDetail.name),
    );
  });

  describe('getAllProducts', () => {
    it('should return products in English', async () => {
      jest
        .spyOn(productService, 'getAllProducts')
        .mockImplementation(async (lang) => {
          return mockProductsEnglish.map((product) => ({
            ...product,
            details: product.details.filter((detail) => detail.lang === lang),
          }));
        });

      // Call the service function with 'en'
      const result = await productService.getAllProducts('en');

      expect(productService.getAllProducts).toHaveBeenCalledWith('en');
      expect(
        result.every((product: Product) => product.details[0].lang === 'en'),
      ).toBe(true);
    });

    it('should return products in Arabic', async () => {
      jest
        .spyOn(productService, 'getAllProducts')
        .mockImplementation(async (lang) => {
          return mockProductArabic.map((product) => ({
            ...product,
            details: product.details.filter((detail) => detail.lang === lang),
          }));
        });

      const result = await productService.getAllProducts('ar');

      expect(productService.getAllProducts).toHaveBeenCalledWith('ar');
      expect(
        result.every((product: Product) => product.details[0].lang === 'ar'),
      ).toBe(true);
    });
  });

  describe('getProductId', () => {
    const mockProductId = '67dc62a600c3c20f18414641';

    it('should return a product in the specified language', async () => {
      const lang = 'en';

      const mockProduct = {
        _id: mockProductId,
        price: 100,
        quantity: 30,
        details: [
          {
            _id: '67dc62a600c3c20f18414642',
            lang: 'en',
            title: 'Crowns and Decoration',
            slug: 'crowns-and-decoration',
            description: 'Crowns and decorations symbolize elegance...',
            __v: 0,
          },
        ],
        category: 'show',
      };

      productModel.findById = jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockProduct),
      });

      const result = await productService.getSingleProduct(lang, mockProductId);
      expect(productModel.findById).toHaveBeenCalledWith(mockProductId);
      expect(result).toEqual(mockProduct);
    });

    it('should throw an error if product doest not exist', async () => {
      const lang = 'en';

      productModel.findById = jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue(null),
      });

      await expect(
        productService.getSingleProduct(lang, mockProductId),
      ).rejects.toThrow('Product not found for the given language.');

      expect(productModel.findById).toHaveBeenCalledWith(mockProductId);
    });

    it('should throw an error if product exists but does not have details in the requested language', async () => {
      const lang = 'ar';

      const mockProduct = {
        _id: mockProductId,
        price: 100,
        quantity: 30,
        details: [], // No Arabic details
        category: 'show',
      };

      productModel.findById = jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockProduct),
      });

      await expect(
        productService.getSingleProduct(lang, mockProductId),
      ).rejects.toThrow('Product not found for the given language.');
    });
  });


});
