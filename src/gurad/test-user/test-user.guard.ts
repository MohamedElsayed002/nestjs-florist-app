import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class TestUserGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const user = request['user'];

    // Check if this is the test admin user
    if (user && user.email === 'test.admin@example.com') {
      throw new ForbiddenException(
        'Test admin user is not allowed to perform this operation. This is a read-only account for demonstration purposes.',
      );
    }

    return true;
  }
}
