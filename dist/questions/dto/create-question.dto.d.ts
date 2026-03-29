export declare class CreateQuestionDto {
    examId: string;
    text: string;
    options: string[];
    correctAnswer: string;
    order?: number;
    points?: number;
    explanation?: string;
}
