import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { User } from 'src/user/entities/user.entity';

// 주식
export type StockDocument = Stock & Document;
export
@Schema({ timestamps: { createdAt: 'createdAt' } })
class Stock {
  @Prop({ type: mongoose.Schema.Types.Date })
  timestamp: Date;

  @Prop({ type: String })
  data: string;

  @Prop({ default: new Date(), type: mongoose.Schema.Types.Date })
  createdAt: Date;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  user: User;
}

export const StockSchema = SchemaFactory.createForClass(Stock);

// @Prop({ type: mongoose.Schema.Types.Date })
// Date: Date; // 주식 날짜
// @Prop()
// Open: number; // 장 시작 가격
// @Prop()
// High: number; // 최고가
// @Prop()
// Low: number; // 최저가
// @Prop()
// Close: number; // 마감가
// @Prop()
// Volume: number; // 볼륨
// @Prop({ default: new Date(), type: mongoose.Schema.Types.Date })
// createdAt: Date;
