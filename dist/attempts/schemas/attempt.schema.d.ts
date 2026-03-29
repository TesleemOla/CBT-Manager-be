import { Document, Types } from 'mongoose';
export type AttemptDocument = Attempt & Document;
export interface AnswerEntry {
    questionId: string;
    selectedAnswer: string;
    isCorrect: boolean;
    pointsEarned: number;
}
export declare class Attempt {
    examId: Types.ObjectId;
    studentId: Types.ObjectId;
    answers: Record<string, string>;
    gradedAnswers: AnswerEntry[];
    score: number;
    totalPoints: number;
    percentage: number;
    passed: boolean;
    submittedAt: Date;
    startedAt: Date;
    status: string;
}
export declare const AttemptSchema: import("mongoose").Schema<any, import("mongoose").Model<any, any, any, any, any, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, {
    [x: number]: unknown;
    [x: symbol]: unknown;
    [x: string]: unknown;
}, Document<unknown, {}, import("mongoose").FlatRecord<{
    [x: number]: unknown;
    [x: symbol]: unknown;
    [x: string]: unknown;
}>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<{
    [x: number]: unknown;
    [x: symbol]: unknown;
    [x: string]: unknown;
}> & Required<{
    _id: unknown;
}> & {
    __v: number;
}>;
