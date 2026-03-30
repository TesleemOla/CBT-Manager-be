import {
  Controller, Get, Post, Body, Param, UseInterceptors,
  UploadedFiles, BadRequestException,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { QuestionsService } from './questions.service';
import { ExamsService } from '../exams/exams.service';
import { CreateQuestionDto } from './dto/create-question.dto';

@Controller('questions')
export class QuestionsController {
  constructor(
    private readonly questionsService: QuestionsService,
    private readonly examsService: ExamsService,
  ) {}

  @Post()
  create(@Body() dto: CreateQuestionDto) {
    return this.questionsService.create(dto);
  }

  @Get('exam/:examId')
  findByExam(@Param('examId') examId: string) {
    return this.questionsService.findByExam(examId);
  }

  /**
   * POST /api/questions/upload/:examId
   * Accepts two files:
   *   - questionsFile: DOCX with question blocks
   *   - answersFile:   DOCX with answer key
   */
  @Post('upload/:examId')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'questionsFile', maxCount: 1 },
        { name: 'answersFile', maxCount: 1 },
      ],
      { storage: memoryStorage() },
    ),
  )
  async uploadDocx(
    @Param('examId') examId: string,
    @UploadedFiles()
    files: {
      questionsFile?: Express.Multer.File[];
      answersFile?: Express.Multer.File[];
    },
  ) {
    if (!files?.questionsFile?.[0]) {
      throw new BadRequestException('questionsFile is required');
    }
    if (!files?.answersFile?.[0]) {
      throw new BadRequestException('answersFile is required');
    }

    const qBuffer = files.questionsFile[0].buffer;
    const aBuffer = files.answersFile[0].buffer;

    const parsed = await this.questionsService.parseQuestionsDocx(qBuffer);
    const answerKey = await this.questionsService.parseAnswersDocx(aBuffer);
    
    const questionsCount = parsed.length;
    const answersCount = Object.keys(answerKey).length;

    if (questionsCount !== answersCount) {
      throw new BadRequestException(
        `Critical Discrepancy Found: Found ${questionsCount} questions in the question document, but ${answersCount} items in the answer key. ` +
        `This mismatch must be solved before importing to ensure student scores are accurate.`
      );
    }

    const questions = await this.questionsService.bulkImport(examId, parsed, answerKey);
    await this.examsService.updateQuestionCount(examId, questions.length);

    return {
      message: `Successfully imported ${questions.length} questions`,
      count: questions.length,
      questions,
    };
  }
}
