import { Document } from 'mongoose';
export type StudentDocument = Student & Document;
export declare class Student {
    name: string;
    email: string;
    matricNumber: string;
}
export declare const StudentSchema: import("mongoose").Schema<any, import("mongoose").Model<any, any, any, any, any, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, {
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
