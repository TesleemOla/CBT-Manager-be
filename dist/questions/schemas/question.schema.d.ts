import { Document, Types } from 'mongoose';
export type QuestionDocument = Question & Document;
export declare class Question {
    examId: Types.ObjectId;
    text: string;
    options: string[];
    correctAnswer: string;
    order: number;
    points: number;
    explanation: string;
}
export declare const QuestionSchema: import("mongoose").Schema<any, import("mongoose").Model<any, any, any, any, any, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, {
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
