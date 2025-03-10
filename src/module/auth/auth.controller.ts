import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Request,
  SetMetadata,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginUserDto } from './dto/auth.dto';
import { Auth } from 'src/schemas/auth.schema';
import { AuthGuard } from 'src/gurad/auth/auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(AuthGuard)
  @SetMetadata('roles', ['Admin'])
  @Get('')
  async findAll(): Promise<Auth[]> {
    return this.authService.findAll();
  }

  @Post('register')
  async registerUser(@Body() createUser: CreateUserDto): Promise<Auth> {
    return this.authService.registerUser(createUser);
  }

  @Post('login')
  async loginUser(
    @Body() loginUser: LoginUserDto,
  ): Promise<{ user: Auth; access_token: string }> {
    return this.authService.loginUser(loginUser);
  }

  @UseGuards(AuthGuard)
  @Get('profile')
  getProfile(@Request() req: any) {
    return req.user;
  }
}
