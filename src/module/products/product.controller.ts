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
    Patch
} from "@nestjs/common";
import { ProductService } from "./product.service";
import { CreateProductDto, ProductDetailDto } from "./dto/product2.dto";
import { ProductDocument } from "src/schemas/product.schema";
import { FileInterceptor } from "@nestjs/platform-express";

@Controller('products')
export class ProductController {
    
    constructor(
        private readonly productService: ProductService
    ) {}

    @Post('create')
    async createProduct(
        @Body() createProductDto: CreateProductDto
    ): Promise<ProductDocument> {
        return this.productService.createProduct(createProductDto);
    }

    @Get('all')
    async getAllProducts(
        @Query('lang') lang: string = 'en'
    ): Promise<Array<ProductDocument>> {
        return this.productService.getAllProducts(lang);
    }

    @Get('get-single-product/:productId')
    async getSingleProduct(
        @Param('productId') productId: string,
        @Query('lang') lang: string = 'en'
    ) {
        return this.productService.getSingleProduct(lang, productId);
    }

    @Put('update-image/:productId')
    @UseInterceptors(FileInterceptor('image'))
    async updateImage(
        @UploadedFile() file: Express.Multer.File,
        @Param('productId') productId: string
    ) {
        if (!file) {
            throw new BadRequestException('No image file provided.');
        }
        return this.productService.addImageToProduct(productId, file);
    }

    @Delete('/:productId')
    async deleteProduct(
        @Param('productId') productId: string 
    ) {
        return this.productService.deleteProduct(productId)
    }

    @Patch('update-stock/:productId')
    async updateProductStock(
        @Param('productId') productId: string,
        @Body() updateData: { price?: number; quantity?: number }
    ) {
        return this.productService.updateProductStock(productId, updateData);
    }
}
