import { Model } from 'mongoose';
import { Attempt, AttemptDocument } from './schemas/attempt.schema';
import { SubmitAttemptDto } from './dto/submit-attempt.dto';
import { QuestionsService } from '../questions/questions.service';
import { ExamsService } from '../exams/exams.service';
export declare class AttemptsService {
    private attemptModel;
    private questionsService;
    private examsService;
    constructor(attemptModel: Model<AttemptDocument>, questionsService: QuestionsService, examsService: ExamsService);
    start(examId: string, studentId: string): Promise<Attempt>;
    submit(dto: SubmitAttemptDto): Promise<Attempt>;
    findByStudent(studentId: string): Promise<Attempt[]>;
    findByExam(examId: string): Promise<Attempt[]>;
    findOne(id: string): Promise<Attempt>;
    getResults(examId: string): Promise<{
        attempts: (import("mongoose").Document<unknown, {}, AttemptDocument, {}, {}> & Attempt & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        })[];
        stats: {
            total: number;
            passed: number;
            failed: number;
            passRate: number;
            avgScore: number;
        };
    }>;
}
