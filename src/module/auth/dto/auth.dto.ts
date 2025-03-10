import { IsNotEmpty, IsStrongPassword } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  phone: string;

  @IsNotEmpty()
  @IsStrongPassword()
  password: string;

  @IsNotEmpty()
  gender: 'male' | 'female';
}

export class LoginUserDto {
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  password: string;
}
