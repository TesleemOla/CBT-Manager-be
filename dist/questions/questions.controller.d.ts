import { QuestionsService } from './questions.service';
import { ExamsService } from '../exams/exams.service';
import { CreateQuestionDto } from './dto/create-question.dto';
export declare class QuestionsController {
    private readonly questionsService;
    private readonly examsService;
    constructor(questionsService: QuestionsService, examsService: ExamsService);
    create(dto: CreateQuestionDto): Promise<import("./schemas/question.schema").Question>;
    findByExam(examId: string): Promise<import("./schemas/question.schema").Question[]>;
    uploadDocx(examId: string, files: {
        questionsFile?: Express.Multer.File[];
        answersFile?: Express.Multer.File[];
    }): Promise<{
        message: string;
        count: number;
        questions: import("./schemas/question.schema").Question[];
    }>;
}
