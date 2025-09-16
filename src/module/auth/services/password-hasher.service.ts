import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class PasswordHasherService {
  private readonly saltRounds = 8;

  hash(plain: string): string {
    return bcrypt.hashSync(plain, this.saltRounds);
  }

  compare(plain: string, hash: string): boolean {
    return bcrypt.compareSync(plain, hash);
  }
}


