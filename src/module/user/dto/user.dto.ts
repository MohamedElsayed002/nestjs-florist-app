import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  Matches,
  MinLength,
} from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  name: string;

  @IsOptional()
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @IsOptional()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  password: string;

  @IsOptional()
  @Matches(/^\+20\d{10}$/, {
    message: 'Phone number must start with +20 and be 12 digits long',
  })
  phone: string;

  @IsOptional()
  @IsEnum(['Male', 'Female'], { message: 'Gender must be Male or Female' })
  gender: string;
}
