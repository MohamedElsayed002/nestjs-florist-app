import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class Auth {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  phone: string;

  @Prop()
  verificationCode: string;

  @Prop()
  codeExpiresAt: Date;

  @Prop({ default: 'Male', enum: ['Male', 'Female'] })
  gender: string;

  @Prop({ default: 'User', enum: ['User', 'Admin'] })
  role: string;
}

export const authSchema = SchemaFactory.createForClass(Auth);
