import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { Auth } from 'src/schemas/auth.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserDto, LoginUserDto } from './dto/auth.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Auth.name) private authModel: Model<Auth>,
    private jwtService: JwtService,
  ) { }

  async registerUser(createUserDto: CreateUserDto): Promise<Auth> {
    const { email, gender, name, password, phone } = createUserDto;
    const alreadyExist = await this.authModel.findOne({ email });
    if (alreadyExist) {
      throw new BadRequestException('Email already exists');
    }

    const hashedPassword = bcrypt.hashSync(password, 8);

    const user = new this.authModel({
      name,
      email,
      password: hashedPassword,
      gender,
      phone,
    });

    return user.save();
  }

  async loginUser(loginUser: LoginUserDto): Promise<{ access_token: string }> {
    const user = await this.authModel.findOne({ email: loginUser.email });
    if (!user) {
      throw new ConflictException('Email not found');
    }

    if (!bcrypt.compareSync(loginUser.password, user.password)) {
      throw new BadRequestException('Invalid Password');
    }

    const access_token = this.jwtService.sign(
      {
        id: user['_id'],
        role: user.role,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
      { secret: process.env.JWT_SECRET, expiresIn: '1h' }, // ✅ Corrected expiration format
    );

    return { access_token };
  }

  async testLoginAdmin(): Promise<{ access_token: string }> {
    // Find or create test admin user
    const testEmail = 'test.admin@example.com';
    let user = await this.authModel.findOne({ email: testEmail });

    if (!user) {
      const hashedPassword = bcrypt.hashSync('TestAdmin123!', 8);
      user = new this.authModel({
        name: 'Test Admin',
        email: testEmail,
        password: hashedPassword,
        gender: 'Male',
        phone: '0000000000',
        role: 'Admin',
      });
      await user.save();
    }

    const access_token = this.jwtService.sign(
      {
        id: user['_id'],
        role: user.role,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
      { secret: process.env.JWT_SECRET, expiresIn: '1h' },
    );

    return { access_token };
  }

  async findAll(): Promise<Auth[]> {
    return this.authModel.find().exec();
  }

  async findById(id: string): Promise<Auth | null> {
    return await this.authModel.findById(id); // ✅ Ensure async/await is used
  }
}
