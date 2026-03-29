import { StudentsService } from './students.service';
import { CreateStudentDto } from './dto/create-student.dto';
export declare class StudentsController {
    private readonly studentsService;
    constructor(studentsService: StudentsService);
    create(dto: CreateStudentDto): Promise<import("./schemas/student.schema").Student>;
    findAll(): Promise<import("./schemas/student.schema").Student[]>;
    findOne(id: string): Promise<import("./schemas/student.schema").Student>;
}
