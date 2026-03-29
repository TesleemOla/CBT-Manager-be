"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExamsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const exam_schema_1 = require("./schemas/exam.schema");
let ExamsService = class ExamsService {
    examModel;
    constructor(examModel) {
        this.examModel = examModel;
    }
    async create(createExamDto) {
        const exam = new this.examModel(createExamDto);
        return exam.save();
    }
    async findAll() {
        return this.examModel.find({ isActive: true }).sort({ createdAt: -1 }).exec();
    }
    async findOne(id) {
        const exam = await this.examModel.findById(id).exec();
        if (!exam)
            throw new common_1.NotFoundException(`Exam #${id} not found`);
        return exam;
    }
    async update(id, updateDto) {
        const exam = await this.examModel
            .findByIdAndUpdate(id, updateDto, { new: true })
            .exec();
        if (!exam)
            throw new common_1.NotFoundException(`Exam #${id} not found`);
        return exam;
    }
    async updateQuestionCount(id, count) {
        await this.examModel.findByIdAndUpdate(id, { totalQuestions: count }).exec();
    }
    async remove(id) {
        const result = await this.examModel.findByIdAndDelete(id).exec();
        if (!result)
            throw new common_1.NotFoundException(`Exam #${id} not found`);
    }
};
exports.ExamsService = ExamsService;
exports.ExamsService = ExamsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(exam_schema_1.Exam.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], ExamsService);
//# sourceMappingURL=exams.service.js.map