import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  SetMetadata,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from '../auth/dto/auth.dto';
import { AuthGuard } from 'src/gurad/auth/auth.guard';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Post('forgot-password')
  async forgotPassword(@Body('email') email: string) {
    return this.userService.forgotPassword(email);
  }

  @Post('verify-code')
  async verifyCode(@Body('email') email: string, @Body('code') code: string) {
    return this.userService.verifyCode(email, code);
  }

  @Put('forgot-password-complete')
  async forgotPasswordComplete(
    @Body('email') email: string,
    @Body('newPassword') newPassword: string,
  ) {
    return this.userService.forgotPasswordComplete(email, newPassword);
  }

  @Put(':id')
  async updateUser(@Param('id') id: string, @Body() updateUser: CreateUserDto) {
    return this.userService.updateUser(id, updateUser);
  }

  @UseGuards(AuthGuard)
  @SetMetadata('roles', ['Admin', 'User'])
  @Delete(':id')
  async deleteUser(@Param('id') targetUserId: string, @Req() req: any) {
    const requesterId = req.user['_id'];
    const requesterRole = req.user['role'];
    return this.userService.deleteUser(
      requesterId,
      targetUserId,
      requesterRole,
    );
  }
}
