import { IsString, IsArray, IsOptional, IsNumber } from 'class-validator';

export class CreateQuestionDto {
  @IsString()
  examId: string;

  @IsString()
  text: string;

  @IsArray()
  @IsString({ each: true })
  options: string[];

  @IsString()
  correctAnswer: string;

  @IsNumber()
  @IsOptional()
  order?: number;

  @IsNumber()
  @IsOptional()
  points?: number;

  @IsString()
  @IsOptional()
  explanation?: string;
}
