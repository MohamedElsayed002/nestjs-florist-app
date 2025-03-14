import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  SetMetadata,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { FileInterceptor } from '@nestjs/platform-express';
import slugify from 'slugify';
import { AuthGuard } from 'src/gurad/auth/auth.guard';
import { Product } from 'src/schemas/product.schema';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get('')
  async getAllProducts() {
    return this.productsService.getAllProducts();
  }

  @Post('add')
  @UseGuards(AuthGuard)
  @SetMetadata('roles', ['Admin', 'User'])
  @UseInterceptors(FileInterceptor('image'))
  async addProduct(
    @UploadedFile() file: Express.Multer.File,
    @Body() createProductDto: CreateProductDto,
  ): Promise<{ message: string; product: Product }> {
    if (!file) {
      throw new BadRequestException('File is missing');
    }

    const titleExists = await this.productsService.isTitleTake(
      createProductDto.title,
    );
    if (titleExists) {
      throw new BadRequestException(
        'Product title already exists. Please try another title',
      );
    }

    const { imageId, imageUrl } = await this.productsService.uploadImage(file);

    const newProduct = await this.productsService.createProduct(
      {
        title: createProductDto.title,
        slug: slugify(createProductDto.title),
        description: createProductDto.description,
        price: createProductDto.price,
        quantity: createProductDto.quantity,
        imageId,
        image: imageUrl,
      },
      file,
    );

    return {
      message: 'Product added successfully',
      product: newProduct,
    };
  }

  @Get(':slug')
  async getSingleProduct(@Param('slug') slug: string): Promise<Product> {
    return this.productsService.getProductBySlug(slug);
  }

  @Put(':id')
  @UseInterceptors(FileInterceptor('image'))
  @UseGuards(AuthGuard)
  @SetMetadata('roles', ['Admin', 'User'])
  async updateProduct(
    @Param('id') productId: string,
    @Body() updateData?: UpdateProductDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return await this.productsService.updateProduct(
      productId,
      updateData,
      file,
    );
  }

  @UseGuards(AuthGuard)
  @SetMetadata('roles', ['Admin'])
  @Delete(':id')
  async DeleteProduct(@Param('id') productId: string) {
    return this.productsService.deleteProduct(productId);
  }
}
