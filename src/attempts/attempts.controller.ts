import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { AttemptsService } from './attempts.service';
import { SubmitAttemptDto } from './dto/submit-attempt.dto';

@Controller('attempts')
export class AttemptsController {
  constructor(private readonly attemptsService: AttemptsService) {}

  @Post('start')
  start(@Body() body: { examId: string; studentId: string }) {
    return this.attemptsService.start(body.examId, body.studentId);
  }

  @Post('submit')
  submit(@Body() dto: SubmitAttemptDto) {
    return this.attemptsService.submit(dto);
  }

  @Get('student/:studentId')
  findByStudent(@Param('studentId') studentId: string) {
    return this.attemptsService.findByStudent(studentId);
  }

  @Get('exam/:examId')
  findByExam(@Param('examId') examId: string) {
    return this.attemptsService.findByExam(examId);
  }

  @Get('results/:examId')
  getResults(@Param('examId') examId: string) {
    return this.attemptsService.getResults(examId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.attemptsService.findOne(id);
  }
}
