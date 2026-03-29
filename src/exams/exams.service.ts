import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Exam, ExamDocument } from './schemas/exam.schema';
import { CreateExamDto } from './dto/create-exam.dto';

@Injectable()
export class ExamsService {
  constructor(@InjectModel(Exam.name) private examModel: Model<ExamDocument>) {}

  async create(createExamDto: CreateExamDto): Promise<Exam> {
    const exam = new this.examModel(createExamDto);
    return exam.save();
  }

  async findAll(): Promise<Exam[]> {
    return this.examModel.find({ isActive: true }).sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string): Promise<Exam> {
    const exam = await this.examModel.findById(id).exec();
    if (!exam) throw new NotFoundException(`Exam #${id} not found`);
    return exam;
  }

  async update(id: string, updateDto: Partial<CreateExamDto>): Promise<Exam> {
    const exam = await this.examModel
      .findByIdAndUpdate(id, updateDto, { new: true })
      .exec();
    if (!exam) throw new NotFoundException(`Exam #${id} not found`);
    return exam;
  }

  async updateQuestionCount(id: string, count: number): Promise<void> {
    await this.examModel.findByIdAndUpdate(id, { totalQuestions: count }).exec();
  }

  async remove(id: string): Promise<void> {
    const result = await this.examModel.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException(`Exam #${id} not found`);
  }
}
