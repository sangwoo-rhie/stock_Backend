// image.model.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, ObjectId } from 'mongoose';

export type ImageDocument = Image & Document;
export
@Schema({ timestamps: { createdAt: 'createdAt' } })
class Image {
  @Prop({ type: mongoose.Schema.Types.ObjectId })
  file_id: ObjectId;

  @Prop({ required: true })
  filename: string;

  @Prop({ type: Date, required: true })
  timestamp: Date;

  @Prop({ type: Buffer, required: true })
  data: Buffer;
}

export const ImageSchema = SchemaFactory.createForClass(Image);
