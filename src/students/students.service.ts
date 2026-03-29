import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Student, StudentDocument } from './schemas/student.schema';
import { CreateStudentDto } from './dto/create-student.dto';

@Injectable()
export class StudentsService {
  constructor(
    @InjectModel(Student.name) private studentModel: Model<StudentDocument>,
  ) {}

  async findOrCreate(dto: CreateStudentDto): Promise<Student> {
    const existing = await this.studentModel
      .findOne({ email: dto.email })
      .exec();
    if (existing) return existing;
    const student = new this.studentModel(dto);
    return student.save();
  }

  async create(dto: CreateStudentDto): Promise<Student> {
    const student = new this.studentModel(dto);
    return student.save();
  }

  async findAll(): Promise<Student[]> {
    return this.studentModel.find().sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string): Promise<Student> {
    const s = await this.studentModel.findById(id).exec();
    if (!s) throw new NotFoundException(`Student #${id} not found`);
    return s;
  }

  async findByEmail(email: string): Promise<Student | null> {
    return this.studentModel.findOne({ email }).exec();
  }
}
