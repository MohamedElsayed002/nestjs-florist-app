import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  Min,
  IsPositive,
  Length,
  IsOptional,
  IsUrl,
} from 'class-validator';

export class CreateProductDto {
  @IsNotEmpty()
  @IsString()
  @Length(3, 100)
  title: string;

  @IsOptional()
  slug: string;

  @IsNotEmpty()
  @Type(() => Number)
  @IsPositive({ message: 'Price must be a positive number' })
  @Min(1, { message: 'Price must be at least 1' })
  price: number;

  @IsNotEmpty()
  @IsString()
  @Length(10, 1000)
  description: string;

  @IsNotEmpty()
  @Type(() => Number)
  @IsPositive({ message: 'Quantity must be a positive number' })
  @Min(1, { message: 'Quantity must be at least 1' })
  quantity: number;

  @IsOptional()
  @IsUrl()
  image: string;

  @IsOptional()
  imageId: string;
}

export class UpdateProductDto {
  @IsOptional()
  @Length(3, 100)
  title: string;

  @IsOptional()
  @Type(() => Number)
  @IsPositive({ message: 'Price must be a positive number' })
  @Min(1, { message: 'Price must be at least 1' })
  price: number;

  @IsOptional()
  @IsString()
  @Length(10, 1000)
  description: string;

  @IsOptional()
  @Type(() => Number)
  @IsPositive({ message: 'Quantity must be a positive number' })
  @Min(1, { message: 'Quantity must be at least 1' })
  quantity: number;

  @IsOptional()
  @IsUrl()
  image: string;

  @IsOptional()
  imageId: string;
}
