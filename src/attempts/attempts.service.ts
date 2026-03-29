import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Attempt, AttemptDocument, AnswerEntry } from './schemas/attempt.schema';
import { SubmitAttemptDto } from './dto/submit-attempt.dto';
import { QuestionsService } from '../questions/questions.service';
import { ExamsService } from '../exams/exams.service';

@Injectable()
export class AttemptsService {
  constructor(
    @InjectModel(Attempt.name) private attemptModel: Model<AttemptDocument>,
    private questionsService: QuestionsService,
    private examsService: ExamsService,
  ) {}

  async start(examId: string, studentId: string): Promise<Attempt> {
    const existing = await this.attemptModel.findOne({
      examId,
      studentId,
      status: 'in-progress',
    });
    if (existing) return existing;

    const attempt = new this.attemptModel({
      examId,
      studentId,
      answers: {},
      startedAt: new Date(),
      status: 'in-progress',
    });
    return attempt.save();
  }

  async submit(dto: SubmitAttemptDto): Promise<Attempt> {
    const { examId, studentId, answers, startedAt } = dto;

    const exam = await this.examsService.findOne(examId);
    const questions = await this.questionsService.findByExam(examId);

    const gradedAnswers: AnswerEntry[] = [];
    let totalScore = 0;
    let totalPoints = 0;

    for (const q of questions) {
      const qId = (q as any)._id.toString();
      const selected = answers[qId] || '';
      const isCorrect = selected.trim() === (q as any).correctAnswer.trim();
      const pts = isCorrect ? ((q as any).points || 1) : 0;
      totalScore += pts;
      totalPoints += (q as any).points || 1;

      gradedAnswers.push({
        questionId: qId,
        selectedAnswer: selected,
        isCorrect,
        pointsEarned: pts,
      });
    }

    const percentage =
      totalPoints > 0 ? Math.round((totalScore / totalPoints) * 100) : 0;
    const passed = percentage >= ((exam as any).passMark || 70);

    const attempt = new this.attemptModel({
      examId,
      studentId,
      answers,
      gradedAnswers,
      score: totalScore,
      totalPoints,
      percentage,
      passed,
      submittedAt: new Date(),
      startedAt: startedAt ? new Date(startedAt) : new Date(),
      status: 'graded',
    });

    return attempt.save();
  }

  async findByStudent(studentId: string): Promise<Attempt[]> {
    return this.attemptModel
      .find({ studentId })
      .populate('examId')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findByExam(examId: string): Promise<Attempt[]> {
    return this.attemptModel
      .find({ examId })
      .populate('studentId')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(id: string): Promise<Attempt> {
    const a = await this.attemptModel
      .findById(id)
      .populate('examId')
      .populate('studentId')
      .exec();
    if (!a) throw new NotFoundException(`Attempt #${id} not found`);
    return a;
  }

  async getResults(examId: string) {
    const attempts = await this.attemptModel
      .find({ examId, status: 'graded' })
      .populate('studentId')
      .sort({ percentage: -1 })
      .exec();

    const total = attempts.length;
    const passed = attempts.filter((a) => a.passed).length;
    const avgScore =
      total > 0
        ? attempts.reduce((sum, a) => sum + a.percentage, 0) / total
        : 0;

    return {
      attempts,
      stats: {
        total,
        passed,
        failed: total - passed,
        passRate: total > 0 ? Math.round((passed / total) * 100) : 0,
        avgScore: Math.round(avgScore),
      },
    };
  }
}
