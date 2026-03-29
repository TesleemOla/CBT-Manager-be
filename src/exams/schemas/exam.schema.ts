import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ExamDocument = Exam & Document;

@Schema({ timestamps: true })
export class Exam {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  subject: string;

  @Prop({ required: true })
  durationMinutes: number;

  @Prop({ default: 0 })
  totalQuestions: number;

  @Prop({ default: 1 })
  pointsPerQuestion: number;

  @Prop({ default: false })
  shuffleQuestions: boolean;

  @Prop({ default: false })
  shuffleOptions: boolean;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  instructions: string;

  @Prop({ default: 70 })
  passMark: number;
}

export const ExamSchema = SchemaFactory.createForClass(Exam);
