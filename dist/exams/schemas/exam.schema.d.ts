import { Document } from 'mongoose';
export type ExamDocument = Exam & Document;
export declare class Exam {
    title: string;
    subject: string;
    durationMinutes: number;
    totalQuestions: number;
    pointsPerQuestion: number;
    shuffleQuestions: boolean;
    shuffleOptions: boolean;
    isActive: boolean;
    instructions: string;
    passMark: number;
}
export declare const ExamSchema: import("mongoose").Schema<any, import("mongoose").Model<any, any, any, any, any, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, {
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
