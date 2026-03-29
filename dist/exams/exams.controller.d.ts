import { ExamsService } from './exams.service';
import { CreateExamDto } from './dto/create-exam.dto';
export declare class ExamsController {
    private readonly examsService;
    constructor(examsService: ExamsService);
    create(dto: CreateExamDto): Promise<import("./schemas/exam.schema").Exam>;
    findAll(): Promise<import("./schemas/exam.schema").Exam[]>;
    findOne(id: string): Promise<import("./schemas/exam.schema").Exam>;
    update(id: string, dto: Partial<CreateExamDto>): Promise<import("./schemas/exam.schema").Exam>;
    remove(id: string): Promise<void>;
}
