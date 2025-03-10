import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { CreateUserDto } from '../auth/dto/auth.dto';
import { Auth } from 'src/schemas/auth.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt'; 
import { EmailService } from 'src/service/email.service';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(Auth.name) private authModel: Model<Auth>,
    private authService: AuthService,
    private emailService: EmailService,
  ) {}

  async forgotPassword(email: string): Promise<{ message: string }> {
    const user = await this.authModel.findOne({ email });
    if (!user) {
      throw new NotFoundException('Email not found');
    }
    const verificationCode = Math.floor(
      100000 + Math.random() * 900000,
    ).toString(); // 6-digit code
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 30); // Set expiry time to 30 minutes
    user.verificationCode = verificationCode;
    user.codeExpiresAt = expiresAt;
    await user.save();
    await this.emailService.sendVerificationCode(email, verificationCode);
    return { message: 'Verification code send to your email' };
  }

  async verifyCode(email: string, code: string): Promise<{ message: string }> {
    const user = await this.authModel.findOne({ email });

    if (!user) {
      throw new NotFoundException('Email not found');
    }

    // Check if code exists
    if (!user.verificationCode) {
      throw new BadRequestException(
        'No verification code found. Request a new one.',
      );
    }

    if (user.codeExpiresAt && new Date() > user.codeExpiresAt) {
      user.verificationCode = null;
      user.codeExpiresAt = null;
      await user.save();
      throw new BadRequestException(
        'Verification code expired. Please request a new one.',
      );
    }

    if (user.verificationCode !== code) {
      throw new BadRequestException('Invalid verification code');
    }

    user.verificationCode = null;
    user.codeExpiresAt = null;
    await user.save();
    return {
      message: 'Verification successful. You can now reset your password.',
    };
  }


  async forgotPasswordComplete(email: string, newPassword: string) : Promise<{message : string}> {
    const user = await this.authModel.findOne({ email });

    if (!user) {
        throw new NotFoundException('Email not found');
    }

    // Ensure the user has verified their code before allowing password reset
    if (user.verificationCode) {
        throw new BadRequestException('Verification code not confirmed. Please verify your code first.');
    }

    if (newPassword.length < 8) {
        throw new BadRequestException('Password must be at least 8 characters long.');
    }

    // Hash the password asynchronously
    const hashPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password
    user.password = hashPassword;


    await user.save();

    return { message: 'Password changed successfully' };
}

  async updateUser(id: string, updateUser: CreateUserDto) {
    if (updateUser.password) {
      updateUser.password = bcrypt.hashSync(updateUser.password, 8);
    }
    const user = await this.authModel.findByIdAndUpdate(id, updateUser, {
      new: true,
    });
    return user;
  }

  async deleteUser(
    requesterId: string,
    targetUserId: string,
    requesterRole: string,
  ): Promise<{ message: string }> {
    const userToDelete = await this.authService.findById(targetUserId);
    if (!userToDelete) {
      throw new NotFoundException('User not found');
    }

    if (requesterId.toString() !== targetUserId && requesterRole !== 'Admin') {
      throw new ForbiddenException('You are not allowed to delete this user');
    }

    await this.authModel.findByIdAndDelete(targetUserId);

    return { message: 'user deleted successfully' };
  }
}
