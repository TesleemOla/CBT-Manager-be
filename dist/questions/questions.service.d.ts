import { Model } from 'mongoose';
import { Question, QuestionDocument } from './schemas/question.schema';
import { CreateQuestionDto } from './dto/create-question.dto';
interface ParsedQuestion {
    text: string;
    options: string[];
    correctAnswer: string;
    order: number;
}
export declare class QuestionsService {
    private questionModel;
    constructor(questionModel: Model<QuestionDocument>);
    create(dto: CreateQuestionDto): Promise<Question>;
    findByExam(examId: string): Promise<Question[]>;
    findOne(id: string): Promise<Question>;
    deleteByExam(examId: string): Promise<void>;
    countByExam(examId: string): Promise<number>;
    parseQuestionsDocx(buffer: Buffer): Promise<ParsedQuestion[]>;
    parseAnswersDocx(buffer: Buffer): Promise<Record<number, string>>;
    private parseQuestionsFromText;
    private parseAnswersFromText;
    bulkImport(examId: string, questions: ParsedQuestion[], answerKey: Record<number, string>): Promise<Question[]>;
}
export {};
