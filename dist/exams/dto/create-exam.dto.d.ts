export declare class CreateExamDto {
    title: string;
    subject: string;
    durationMinutes: number;
    pointsPerQuestion?: number;
    shuffleQuestions?: boolean;
    shuffleOptions?: boolean;
    instructions?: string;
    passMark?: number;
}
