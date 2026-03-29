import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type QuestionDocument = Question & Document;

@Schema({ timestamps: true })
export class Question {
  @Prop({ type: Types.ObjectId, ref: 'Exam', required: true })
  examId: Types.ObjectId;

  @Prop({ required: true })
  text: string;

  @Prop({ type: [String], required: true })
  options: string[];

  @Prop({ required: true })
  correctAnswer: string;

  @Prop({ default: 0 })
  order: number;

  @Prop({ default: 1 })
  points: number;

  @Prop()
  explanation: string;
}

export const QuestionSchema = SchemaFactory.createForClass(Question);
