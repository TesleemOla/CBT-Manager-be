import { IsString, IsObject, IsOptional } from 'class-validator';

export class SubmitAttemptDto {
  @IsString()
  examId: string;

  @IsString()
  studentId: string;

  @IsObject()
  answers: Record<string, string>;

  @IsString()
  @IsOptional()
  startedAt?: string;
}
