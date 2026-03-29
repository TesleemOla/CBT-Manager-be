import { IsString, IsNumber, IsOptional, IsBoolean, Min, Max } from 'class-validator';

export class CreateExamDto {
  @IsString()
  title: string;

  @IsString()
  subject: string;

  @IsNumber()
  @Min(1)
  durationMinutes: number;

  @IsNumber()
  @IsOptional()
  pointsPerQuestion?: number;

  @IsBoolean()
  @IsOptional()
  shuffleQuestions?: boolean;

  @IsBoolean()
  @IsOptional()
  shuffleOptions?: boolean;

  @IsString()
  @IsOptional()
  instructions?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  passMark?: number;
}
