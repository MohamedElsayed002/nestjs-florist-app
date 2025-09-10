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
import { AuthGuard } from 'src/gurad/auth/auth.guard';
import { TestUserGuard } from 'src/gurad/test-user/test-user.guard';
import { UpdateUserDto } from './dto/user.dto';

@Controller('users')
export class UserController {
  constructor(private userService: UserService) { }

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
  @UseGuards(AuthGuard, TestUserGuard)
  @SetMetadata('roles', ['Admin', 'User'])
  async updateUser(@Param('id') id: string, @Body() updateUser: UpdateUserDto) {
    return this.userService.updateUser(id, updateUser);
  }

  @Get('admin-stats')
  @UseGuards(AuthGuard)
  @SetMetadata('roles', ['Admin'])
  async adminStats() {
    return this.userService.adminStats();
  }

  @Get('fetch-chart-data')
  @UseGuards(AuthGuard)
  @SetMetadata('roles', ['Admin'])
  async fetchChartDate() {
    return this.userService.fetchChartData();
  }

  @Get('revenue-analytics')
  @UseGuards(AuthGuard)
  @SetMetadata('roles', ['Admin'])
  async getRevenueAnalytics() {
    return this.userService.getRevenueAnalytics();
  }

  @Get('customer-analytics')
  @UseGuards(AuthGuard)
  @SetMetadata('roles', ['Admin'])
  async getCustomerAnalytics() {
    return this.userService.getCustomerAnalytics();
  }

  @Get('product-analytics')
  @UseGuards(AuthGuard)
  @SetMetadata('roles', ['Admin'])
  async getProductAnalytics() {
    return this.userService.getProductAnalytics();
  }

  @Get('operational-metrics')
  @UseGuards(AuthGuard)
  @SetMetadata('roles', ['Admin'])
  async getOperationalMetrics() {
    return this.userService.getOperationalMetrics();
  }

  @Get('seasonal-analytics')
  @UseGuards(AuthGuard)
  @SetMetadata('roles', ['Admin'])
  async getSeasonalAnalytics() {
    return this.userService.getSeasonalAnalytics();
  }

  @Get('business-insights')
  @UseGuards(AuthGuard)
  @SetMetadata('roles', ['Admin'])
  async getBusinessInsights() {
    return this.userService.getBusinessInsights();
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
