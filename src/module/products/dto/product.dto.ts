import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
  Min,
  ValidateNested,
  IsNotEmpty,
  Matches,
  IsUrl,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ProductDetailDto {
  @IsNotEmpty()
  @IsString()
  @Matches(/^(en|ar)$/, { message: "Language must be 'en' or 'ar'." }) // Ensure valid language codes
  lang: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @Matches(/\S/, { message: 'Title cannot contain only whitespace.' }) // Prevents empty string with spaces
  title: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(10)
  @Matches(/\S/, { message: 'Description cannot contain only whitespace.' }) // Prevents empty string with spaces
  description: string;
}

export class CreateProductDto {
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  price: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  quantity: number;

  @IsOptional()
  @IsString()
  @IsUrl({}, { message: 'Image must be a valid URL.' }) // Ensures image is a valid URL if provided
  image?: string;

  @IsNotEmpty()
  @IsString()
  category: string;

  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductDetailDto)
  @ArrayMinSize(1, { message: 'At least one product detail is required.' }) // Ensures at least one detail exists
  details: ProductDetailDto[];
}
