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
exports.AttemptsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const attempt_schema_1 = require("./schemas/attempt.schema");
const questions_service_1 = require("../questions/questions.service");
const exams_service_1 = require("../exams/exams.service");
let AttemptsService = class AttemptsService {
    attemptModel;
    questionsService;
    examsService;
    constructor(attemptModel, questionsService, examsService) {
        this.attemptModel = attemptModel;
        this.questionsService = questionsService;
        this.examsService = examsService;
    }
    async start(examId, studentId) {
        const existing = await this.attemptModel.findOne({
            examId,
            studentId,
            status: 'in-progress',
        });
        if (existing)
            return existing;
        const attempt = new this.attemptModel({
            examId,
            studentId,
            answers: {},
            startedAt: new Date(),
            status: 'in-progress',
        });
        return attempt.save();
    }
    async submit(dto) {
        const { examId, studentId, answers, startedAt } = dto;
        const exam = await this.examsService.findOne(examId);
        const questions = await this.questionsService.findByExam(examId);
        const gradedAnswers = [];
        let totalScore = 0;
        let totalPoints = 0;
        for (const q of questions) {
            const qId = q._id.toString();
            const selected = answers[qId] || '';
            const isCorrect = selected.trim() === q.correctAnswer.trim();
            const pts = isCorrect ? (q.points || 1) : 0;
            totalScore += pts;
            totalPoints += q.points || 1;
            gradedAnswers.push({
                questionId: qId,
                selectedAnswer: selected,
                isCorrect,
                pointsEarned: pts,
            });
        }
        const percentage = totalPoints > 0 ? Math.round((totalScore / totalPoints) * 100) : 0;
        const passed = percentage >= (exam.passMark || 70);
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
    async findByStudent(studentId) {
        return this.attemptModel
            .find({ studentId })
            .populate('examId')
            .sort({ createdAt: -1 })
            .exec();
    }
    async findByExam(examId) {
        return this.attemptModel
            .find({ examId })
            .populate('studentId')
            .sort({ createdAt: -1 })
            .exec();
    }
    async findOne(id) {
        const a = await this.attemptModel
            .findById(id)
            .populate('examId')
            .populate('studentId')
            .exec();
        if (!a)
            throw new common_1.NotFoundException(`Attempt #${id} not found`);
        return a;
    }
    async getResults(examId) {
        const attempts = await this.attemptModel
            .find({ examId, status: 'graded' })
            .populate('studentId')
            .sort({ percentage: -1 })
            .exec();
        const total = attempts.length;
        const passed = attempts.filter((a) => a.passed).length;
        const avgScore = total > 0
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
};
exports.AttemptsService = AttemptsService;
exports.AttemptsService = AttemptsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(attempt_schema_1.Attempt.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        questions_service_1.QuestionsService,
        exams_service_1.ExamsService])
], AttemptsService);
//# sourceMappingURL=attempts.service.js.map