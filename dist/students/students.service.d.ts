import { Model } from 'mongoose';
import { Student, StudentDocument } from './schemas/student.schema';
import { CreateStudentDto } from './dto/create-student.dto';
export declare class StudentsService {
    private studentModel;
    constructor(studentModel: Model<StudentDocument>);
    findOrCreate(dto: CreateStudentDto): Promise<Student>;
    create(dto: CreateStudentDto): Promise<Student>;
    findAll(): Promise<Student[]>;
    findOne(id: string): Promise<Student>;
    findByEmail(email: string): Promise<Student | null>;
}
