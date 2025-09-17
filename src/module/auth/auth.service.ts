import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Auth } from 'src/schemas/auth.schema';
import { CreateUserDto, LoginUserDto } from './dto/auth.dto';
import { AuthRepository } from './repositories/auth.repository';
import { PasswordHasherService } from './services/password-hasher.service';
import { TokenService } from './services/token.service';
import { adminAuth } from '../../../utils/firebase';

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly passwordHasher: PasswordHasherService,
    private readonly tokenService: TokenService,
  ) {}

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
      isFirebaseUser: false, // Regular user
    });
  }

  async loginUser(loginUser: LoginUserDto): Promise<{ access_token: string }> {
    const user = await this.authRepository.findByEmail(loginUser.email);
    if (!user) {
      throw new ConflictException('Email not found');
    }

    // Check if this is a Firebase user (no password required)
    if (user.isFirebaseUser) {
      throw new BadRequestException(
        'This account uses Firebase authentication. Please use Google Sign-In instead.',
      );
    }

    // Check if user has a password (regular users)
    if (!user.password) {
      throw new BadRequestException(
        'This account requires password authentication. Please contact support.',
      );
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
        isFirebaseUser: false, // Regular user
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

  async verifyFirebaseToken(firebaseToken: string): Promise<any> {
    if (!adminAuth) {
      throw new UnauthorizedException(
        'Firebase Admin SDK not initialized. Please set up FIREBASE_PRIVATE_KEY in environment variables.',
      );
    }

    try {
      // Verify the Firebase token
      const decodedToken = await adminAuth.verifyIdToken(firebaseToken);
      // Get user data from Firebase Admin
      const userRecord = await adminAuth.getUser(decodedToken.uid);
      // Check if user exists in our database (by email or Firebase UID)
      let user = await this.authRepository.findByEmail(userRecord.email);

      // If not found by email, try to find by Firebase UID
      if (!user) {
        user = await this.authRepository.findByFirebaseUid(userRecord.uid);
      }

      // If user doesn't exist, create them as Firebase user
      if (!user) {
        user = await this.authRepository.create({
          name: userRecord.displayName || 'Firebase User',
          email: userRecord.email,
          phone: userRecord.phoneNumber || '',
          gender: 'Male', // Default gender
          role: 'User',
          isFirebaseUser: true,
          firebaseUid: userRecord.uid,
          // password is optional for Firebase users
        });
      } else {
        // Update existing user to mark as Firebase user if not already
        if (!user.isFirebaseUser) {
          user = await this.authRepository.updateFirebaseInfo(
            user['_id'].toString(),
            {
              isFirebaseUser: true,
              firebaseUid: userRecord.uid,
            },
          );
        }
      }

      // Generate JWT token for our system
      const access_token = this.tokenService.signAccessToken({
        id: user['_id'],
        role: user.role,
        name: user.name,
        email: user.email,
        phone: user.phone,
      });

      return {
        access_token,
        user: {
          _id: user['_id'],
          name: user.name,
          email: user.email,
          phone: user.phone,
          gender: user.gender,
          role: user.role,
          createdAt: (user as any).createdAt,
          updatedAt: (user as any).updatedAt,
          __v: user.__v,
        },
      };
    } catch (error) {
      console.error('Firebase token verification error:', error);
      throw new UnauthorizedException('Invalid Firebase token');
    }
  }
}
