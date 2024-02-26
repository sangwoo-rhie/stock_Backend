import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { UserRole } from '../userinfo';
import { Exclude } from 'class-transformer';
// import { v4 as uuidv4 } from 'uuid';

// 유저
export type UserDocument = User & Document;
export
@Schema({
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
})
class User {
  @Prop({ type: mongoose.Schema.Types.String })
  email: string; // 이메일

  @Prop({ type: mongoose.Schema.Types.String })
  @Exclude()
  password: string; // 비밀번호

  @Prop({ type: mongoose.Schema.Types.String })
  nickname: string; // 닉네임

  @Prop({ type: mongoose.Schema.Types.String })
  organization: string; // 소속

  @Prop({
    type: String,
    enum: Object.values(UserRole),
    default: UserRole.GUEST,
  })
  role: UserRole; // 관리자여부

  @Prop()
  @Exclude()
  refreshToken: string;

  @Prop({ default: new Date(), type: mongoose.Schema.Types.Date })
  createdAt: Date; // 생성일자

  @Prop({ default: new Date(), type: mongoose.Schema.Types.Date })
  updatedAt: Date; // 수정일자

  @Prop({ type: Date, default: null })
  deletedAt: Date; // 탈퇴일자
}

export const UserSchema = SchemaFactory.createForClass(User);
