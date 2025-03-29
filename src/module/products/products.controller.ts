import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  Delete,
  Patch,
  UseGuards,
  Logger,
  SetMetadata,
  Req,
} from '@nestjs/common';
import { ProductService } from './products.service';
import { CreateProductDto, ProductDetailDto } from './dto/product.dto';
import { ProductDocument } from 'src/schemas/product.schema';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from 'src/gurad/auth/auth.guard';
import {} from '@nestjs/common';
@Controller('products')
export class ProductController {
  private logger = new Logger('ProductController');
  constructor(private readonly productService: ProductService) {}

  @Post('create')
  @UseGuards(AuthGuard)
  @SetMetadata('roles', ['Admin'])
  async createProduct(
    @Body() createProductDto: CreateProductDto,
    @Req() req: any,
  ): Promise<ProductDocument> {
    this.logger.verbose(
      `Product create by ${req.user.email} and data ${JSON.stringify(createProductDto)}`,
    );
    return this.productService.createProduct(createProductDto);
  }

  @Get('all')
  async getAllProducts(
    @Query('lang') lang: string = 'en',
    @Query('category') category: string = 'show',
  ): Promise<Array<ProductDocument>> {
    return this.productService.getAllProducts(lang, category);
  }

  @Get('shop')
  async getShopProducts(
    @Query('lang') lang: string = 'en',
  ): Promise<Array<ProductDocument>> {
    return this.productService.getShopProducts(lang);
  }
  @Get('get-single-product/:productId')
  async getSingleProduct(
    @Param('productId') productId: string,
    @Query('lang') lang: string = 'en',
  ) {
    return this.productService.getSingleProduct(lang, productId);
  }

  @Get('get-product-by-slug/:slug')
  async getProductSlug(
    @Param('slug') slug: string,
    @Query('lang') lang: string = 'en',
  ) {
    return this.productService.getProductBySlug(slug, lang);
  }

  @Put('update-image/:productId')
  @UseGuards(AuthGuard)
  @SetMetadata('roles', ['Admin'])
  @UseInterceptors(FileInterceptor('image'))
  async updateImage(
    @UploadedFile() file: Express.Multer.File,
    @Param('productId') productId: string,
  ) {
    if (!file) {
      throw new BadRequestException('No image file provided.');
    }
    return this.productService.addImageToProduct(productId, file);
  }

  @Delete('/:productId')
  @UseGuards(AuthGuard)
  @SetMetadata('roles', ['Admin'])
  async deleteProduct(@Param('productId') productId: string) {
    return this.productService.deleteProduct(productId);
  }

  @Patch('update-stock/:productId')
  @UseGuards(AuthGuard)
  @SetMetadata('roles', ['Admin'])
  async updateProductStock(
    @Param('productId') productId: string,
    @Body() updateData: { price?: number; quantity?: number },
  ) {
    return this.productService.updateProductStock(productId, updateData);
  }
}
