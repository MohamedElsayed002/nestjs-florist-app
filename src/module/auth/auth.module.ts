import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { authenticateSchema } from 'src/schemas/auth.schema';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [authenticateSchema],
  controllers: [AuthController],
  providers: [JwtService, AuthService],
})
export class AuthModule {}
