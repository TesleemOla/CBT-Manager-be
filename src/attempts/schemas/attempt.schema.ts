import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AttemptDocument = Attempt & Document;

export interface AnswerEntry {
  questionId: string;
  selectedAnswer: string;
  isCorrect: boolean;
  pointsEarned: number;
}

@Schema({ timestamps: true })
export class Attempt {
  @Prop({ type: Types.ObjectId, ref: 'Exam', required: true })
  examId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Student', required: true })
  studentId: Types.ObjectId;

  @Prop({ type: Object })
  answers: Record<string, string>;

  @Prop({ type: [Object] })
  gradedAnswers: AnswerEntry[];

  @Prop({ default: 0 })
  score: number;

  @Prop({ default: 0 })
  totalPoints: number;

  @Prop({ default: 0 })
  percentage: number;

  @Prop({ default: false })
  passed: boolean;

  @Prop()
  submittedAt: Date;

  @Prop()
  startedAt: Date;

  @Prop({ default: 'in-progress', enum: ['in-progress', 'submitted', 'graded'] })
  status: string;
}

export const AttemptSchema = SchemaFactory.createForClass(Attempt);
