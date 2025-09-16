import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { Auth } from 'src/schemas/auth.schema';
import { CreateUserDto, LoginUserDto } from './dto/auth.dto';
import { AuthRepository } from './repositories/auth.repository';
import { PasswordHasherService } from './services/password-hasher.service';
import { TokenService } from './services/token.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly passwordHasher: PasswordHasherService,
    private readonly tokenService: TokenService,
  ) { }

  async registerUser(createUserDto: CreateUserDto): Promise<Auth> {
    const { email, gender, name, password, phone } = createUserDto;
    const alreadyExist = await this.authRepository.findByEmail(email);
    if (alreadyExist) {
      throw new BadRequestException('Email already exists');
    }

    const hashedPassword = this.passwordHasher.hash(password);

    return this.authRepository.create({
      name,
      email,
      password: hashedPassword,
      gender,
      phone,
    });
  }

  async loginUser(loginUser: LoginUserDto): Promise<{ access_token: string }> {
    const user = await this.authRepository.findByEmail(loginUser.email);
    if (!user) {
      throw new ConflictException('Email not found');
    }

    if (!this.passwordHasher.compare(loginUser.password, user.password)) {
      throw new BadRequestException('Invalid Password');
    }

    const access_token = this.tokenService.signAccessToken({
      id: user['_id'],
      role: user.role,
      name: user.name,
      email: user.email,
      phone: user.phone,
    });

    return { access_token };
  }

  async testLoginAdmin(): Promise<{ access_token: string }> {
    // Find or create test admin user
    const testEmail = 'test.admin@example.com';
    let user = await this.authRepository.findByEmail(testEmail);

    if (!user) {
      const hashedPassword = this.passwordHasher.hash('TestAdmin123!');
      user = await this.authRepository.create({
        name: 'Test Admin',
        email: testEmail,
        password: hashedPassword,
        gender: 'Male',
        phone: '0000000000',
        role: 'Admin',
      });
    }

    const access_token = this.tokenService.signAccessToken({
      id: user['_id'],
      role: user.role,
      name: user.name,
      email: user.email,
      phone: user.phone,
    });

    return { access_token };
  }

  async findAll(): Promise<Auth[]> {
    return this.authRepository.findAll();
  }

  async findById(id: string): Promise<Auth | null> {
    return this.authRepository.findById(id);
  }
}
