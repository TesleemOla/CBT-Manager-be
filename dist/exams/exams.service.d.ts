import { Model } from 'mongoose';
import { Exam, ExamDocument } from './schemas/exam.schema';
import { CreateExamDto } from './dto/create-exam.dto';
export declare class ExamsService {
    private examModel;
    constructor(examModel: Model<ExamDocument>);
    create(createExamDto: CreateExamDto): Promise<Exam>;
    findAll(): Promise<Exam[]>;
    findOne(id: string): Promise<Exam>;
    update(id: string, updateDto: Partial<CreateExamDto>): Promise<Exam>;
    updateQuestionCount(id: string, count: number): Promise<void>;
    remove(id: string): Promise<void>;
}
