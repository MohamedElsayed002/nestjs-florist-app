import { IsArray, IsNumber, IsOptional, IsString, MinLength, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class ProductDetailDto {
@IsOptional()
_id :string
  @IsString()
  lang: string; // Language code: 'en' or 'ar'

  @IsString()
  @MinLength(3)
  title: string;

  @IsString()
  @MinLength(10)
  description: string;
}

export class CreateProductDto {
  @IsNumber()
  @Min(0)
  price: number;

  @IsNumber()
  @Min(0)
  quantity: number;

  @IsOptional()
  @IsString()
  image?: string; // Image URL (optional at creation)

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductDetailDto)
  details: ProductDetailDto[];
}
