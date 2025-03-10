import { Module } from '@nestjs/common';
import { AuthController } from '../auth/auth.controller';
import { AuthService } from '../auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { Auth, authSchema } from 'src/schemas/auth.schema';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { EmailService } from 'src/service/email.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Auth.name, schema: authSchema }]),
  ],
  controllers: [UserController],
  providers: [JwtService, AuthService, UserService, EmailService],
  exports: [AuthService], // ✅ Export AuthService so other modules can use it
})
export class UserModule {}
