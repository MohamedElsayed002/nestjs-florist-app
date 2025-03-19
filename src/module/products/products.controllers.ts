// import {
//   BadRequestException,
//   Body,
//   Controller,
//   Delete,
//   Get,
//   Param,
//   Post,
//   Put,
//   Req,
//   SetMetadata,
//   UploadedFile,
//   UseGuards,
//   UseInterceptors,
// } from '@nestjs/common';
// import { ProductsService } from './products.services';
// import { FileInterceptor } from '@nestjs/platform-express';
// import slugify from 'slugify';
// import { AuthGuard } from 'src/gurad/auth/auth.guard';
// import { Product } from 'src/schemas/product.schema';
// import { CreateProductDto, UpdateProductDto } from './dto/product.dto';
// import { Logger } from '@nestjs/common';
// @Controller('products')
// export class ProductsController {
//   private logger = new Logger('ProductController');
//   constructor(private readonly productsService: ProductsService) {}

//   @Get('')
//   async getAllProducts() {
//     this.logger.verbose(`User retrieving all tasks`);
//     return this.productsService.getAllProducts();
//   }

//   @Post('add')
//   @UseGuards(AuthGuard)
//   @SetMetadata('roles', ['Admin', 'User'])
//   @UseInterceptors(FileInterceptor('image'))
//   async addProduct(
//     @UploadedFile() file: Express.Multer.File,
//     @Body() createProductDto: CreateProductDto,
//     @Req() req: any,
//   ): Promise<{ message: string; product: Product }> {
//     this.logger.verbose(
//       `User ${req.user.email}  using this route ${JSON.stringify(createProductDto)}`,
//     );
//     if (!file) {
//       throw new BadRequestException('File is missing');
//     }

//     const titleExists = await this.productsService.isTitleTake(
//       createProductDto.title,
//     );
//     if (titleExists) {
//       throw new BadRequestException(
//         'Product title already exists. Please try another title',
//       );
//     }

//     const { imageId, imageUrl } = await this.productsService.uploadImage(file);

//     const newProduct = await this.productsService.createProduct(
//       {
//         title: createProductDto.title,
//         slug: slugify(createProductDto.title),
//         description: createProductDto.description,
//         price: createProductDto.price,
//         quantity: createProductDto.quantity,
//         imageId,
//         image: imageUrl,
//       },
//       file,
//     );

//     return {
//       message: 'Product added successfully',
//       product: newProduct,
//     };
//   }

//   @Get(':slug')
//   async getSingleProduct(@Param('slug') slug: string): Promise<Product> {
//     return this.productsService.getProductBySlug(slug);
//   }

//   @Put(':id')
//   @UseInterceptors(FileInterceptor('image'))
//   @UseGuards(AuthGuard)
//   @SetMetadata('roles', ['Admin', 'User'])
//   async updateProduct(
//     @Param('id') productId: string,
//     @Body() updateData?: UpdateProductDto,
//     @UploadedFile() file?: Express.Multer.File,
//   ) {
//     return await this.productsService.updateProduct(
//       productId,
//       updateData,
//       file,
//     );
//   }

//   @UseGuards(AuthGuard)
//   @SetMetadata('roles', ['Admin'])
//   @Delete(':id')
//   async DeleteProduct(@Param('id') productId: string) {
//     return this.productsService.deleteProduct(productId);
//   }

//   // this.logger.error(`Failed to get tasks for user ${req.user.email} . Filters ${JSON.stringify(filterDto)}`,error.stack)
// }