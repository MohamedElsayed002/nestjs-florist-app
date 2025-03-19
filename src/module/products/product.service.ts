import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import mongoose, { Model } from "mongoose";
import { Product, ProductDocument } from "src/schemas/product.schema";
import { CreateProductDto } from "./dto/product2.dto";
import { ProductDetail, ProductDetailDocument } from "src/schemas/product.detail.schema";
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class ProductService {
    constructor(
        @InjectModel(Product.name) private productModel: Model<ProductDocument>,
        @InjectModel(ProductDetail.name) private productDetailModel: Model<ProductDetailDocument>
    ) { }

    // Check if a product title is already taken
    async isTitleTaken(title: string): Promise<boolean> {
        const product = await this.productDetailModel.findOne({ title });
        return !!product;
    }

    // Create a new product
    async createProduct(createProductDto: CreateProductDto): Promise<Product> {
        if (!createProductDto.details || createProductDto.details.length === 0) {
            throw new BadRequestException('Product must have at least one detail.');
        }

        const product = new this.productModel({
            price: createProductDto.price,
            quantity: createProductDto.quantity
        });

        const details: mongoose.Types.ObjectId[] = [];

        for (const detailDto of createProductDto.details) {
            if (!detailDto.title) {
                throw new BadRequestException('Product detail must have a title.');
            }

            const detail = new this.productDetailModel({ ...detailDto });
            await detail.save();
            details.push(detail._id as mongoose.Types.ObjectId);
        }

        product.details = await this.productDetailModel.find({
            _id: { $in: details },
        }).exec();

        await product.save();
        return product;
    }

    // Fetch all products with language filtering
    async getAllProducts(lang: string): Promise<Array<ProductDocument>> {
        return this.productModel.find()
            .populate({
                path: 'details',
                match: { lang },
            })
            .exec();
    }

    // Fetch a single product with language filtering
    async getSingleProduct(lang: string, productId: string) {
        const product = await this.productModel.findById(productId)
            .populate({
                path: 'details',
                match: { lang }
            });

        if (!product) {
            throw new BadRequestException('Product not found.');
        }
        return product;
    }

    // Upload an image to Cloudinary
    async uploadImage(file: Express.Multer.File): Promise<{ imageUrl: string, imageId: string }> {
        if (!file) {
            throw new BadRequestException("File is missing! Ensure you are sending a valid file.");
        }

        return new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream({ folder: 'products' }, (error, result) => {
                if (error) {
                    reject(new Error('Failed to upload image to Cloudinary'));
                } else {
                    resolve({ imageUrl: result.secure_url, imageId: result.public_id });
                }
            }).end(file.buffer);
        });
    }

    // Add an image to a product
    async addImageToProduct(productId: string, file: Express.Multer.File): Promise<Product> {
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
                console.error("Error deleting old image:", error);
            }
        }

        // Upload new image
        const { imageId, imageUrl } = await this.uploadImage(file);

        // Update product with new image
        const updatedProduct = await this.productModel.findByIdAndUpdate(
            productId,
            { image: imageUrl, imageId: imageId },
            { new: true }
        );

        return updatedProduct;
    }



    // Delete a product and its details
    async deleteProduct(productId: string): Promise<{ message: string }> {
        const product = await this.productModel.findById(productId);
        if (!product) {
            throw new BadRequestException("Product not found.");
        }

        if (product.imageId) {
            try {
                await cloudinary.uploader.destroy(product.imageId);
            } catch (error) {
                console.error("Error deleting old image:", error);
            }
        }

        await this.productDetailModel.deleteMany({ _id: { $in: product.details } });
        await this.productModel.findByIdAndDelete(productId);

        return { message: "Product deleted successfully." };
    }

    // Update product price or quantity
    async updateProductStock(productId: string, updateData: { price?: number; quantity?: number }): Promise<Product> {
        const product = await this.productModel.findByIdAndUpdate(productId, updateData, { new: true });

        if (!product) {
            throw new BadRequestException("Product not found.");
        }

        return product;
    }


}
