import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  Matches,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @MinLength(8, { message: 'Password must be at least 8 characters' })
  password: string;

  @IsNotEmpty({ message: 'Phone number is required' })
  @Matches(/^\+20\d{10}$/, {
    message: 'Phone number must start with +20 and be 12 digits long',
  })
  phone: string;

  @IsEnum(['Male', 'Female'], { message: 'Gender must be Male or Female' })
  gender: string;
}

export class LoginUserDto {
  @IsNotEmpty()
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @IsNotEmpty()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  password: string;
}
