import { AttemptsService } from './attempts.service';
import { SubmitAttemptDto } from './dto/submit-attempt.dto';
export declare class AttemptsController {
    private readonly attemptsService;
    constructor(attemptsService: AttemptsService);
    start(body: {
        examId: string;
        studentId: string;
    }): Promise<import("./schemas/attempt.schema").Attempt>;
    submit(dto: SubmitAttemptDto): Promise<import("./schemas/attempt.schema").Attempt>;
    findByStudent(studentId: string): Promise<import("./schemas/attempt.schema").Attempt[]>;
    findByExam(examId: string): Promise<import("./schemas/attempt.schema").Attempt[]>;
    getResults(examId: string): Promise<{
        attempts: (import("mongoose").Document<unknown, {}, import("./schemas/attempt.schema").AttemptDocument, {}, {}> & import("./schemas/attempt.schema").Attempt & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
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
    findOne(id: string): Promise<import("./schemas/attempt.schema").Attempt>;
}
