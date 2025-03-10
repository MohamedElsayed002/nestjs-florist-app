import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { Reflector } from '@nestjs/core';
import { AuthService } from 'src/module/auth/auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
    private authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Missing authentication token.');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });

      const user = await this.authService.findById(payload.id);
      if (!user) {
        throw new UnauthorizedException('User not found or invalid.');
      }

      const roles = this.reflector.getAllAndOverride<string[]>('roles', [
        context.getHandler(),
      ]);

      if (!roles || roles.length === 0) {
        request['user'] = user; 
        return true;
      }

      // Check if user role is allowed
      if (!roles.includes(user.role)) {
        throw new ForbiddenException(
          'You do not have permission to access this resource.',
        );
      }

      request['user'] = user; // Attach user to request
      return true;
    } catch (error) {
      console.error('AuthGuard Error:', error.message); 
      throw new UnauthorizedException('Invalid or expired token.');
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
