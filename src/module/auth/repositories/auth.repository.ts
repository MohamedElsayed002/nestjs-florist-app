import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Auth } from 'src/schemas/auth.schema';

@Injectable()
export class AuthRepository {
  constructor(
    @InjectModel(Auth.name)
    private readonly authModel: Model<Auth>,
  ) {}

  findAll() {
    return this.authModel.find().exec();
  }

  findById(id: string) {
    return this.authModel.findById(id);
  }

  findByEmail(email: string) {
    return this.authModel.findOne({ email });
  }

  create(data: Partial<Auth>) {
    const user = new this.authModel(data);
    return user.save();
  }
}


