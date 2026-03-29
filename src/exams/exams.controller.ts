import {
  Controller, Get, Post, Body, Param, Delete, Patch,
} from '@nestjs/common';
import { ExamsService } from './exams.service';
import { CreateExamDto } from './dto/create-exam.dto';

@Controller('exams')
export class ExamsController {
  constructor(private readonly examsService: ExamsService) {}

  @Post()
  create(@Body() dto: CreateExamDto) {
    return this.examsService.create(dto);
  }

  @Get()
  findAll() {
    return this.examsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.examsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: Partial<CreateExamDto>) {
    return this.examsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.examsService.remove(id);
  }
}
