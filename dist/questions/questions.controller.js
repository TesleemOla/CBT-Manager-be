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
exports.QuestionsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const questions_service_1 = require("./questions.service");
const exams_service_1 = require("../exams/exams.service");
const create_question_dto_1 = require("./dto/create-question.dto");
let QuestionsController = class QuestionsController {
    questionsService;
    examsService;
    constructor(questionsService, examsService) {
        this.questionsService = questionsService;
        this.examsService = examsService;
    }
    create(dto) {
        return this.questionsService.create(dto);
    }
    findByExam(examId) {
        return this.questionsService.findByExam(examId);
    }
    async uploadDocx(examId, files) {
        if (!files?.questionsFile?.[0]) {
            throw new common_1.BadRequestException('questionsFile is required');
        }
        if (!files?.answersFile?.[0]) {
            throw new common_1.BadRequestException('answersFile is required');
        }
        const qBuffer = files.questionsFile[0].buffer;
        const aBuffer = files.answersFile[0].buffer;
        const parsed = await this.questionsService.parseQuestionsDocx(qBuffer);
        const answerKey = await this.questionsService.parseAnswersDocx(aBuffer);
        const questions = await this.questionsService.bulkImport(examId, parsed, answerKey);
        await this.examsService.updateQuestionCount(examId, questions.length);
        return {
            message: `Successfully imported ${questions.length} questions`,
            count: questions.length,
            questions,
        };
    }
};
exports.QuestionsController = QuestionsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_question_dto_1.CreateQuestionDto]),
    __metadata("design:returntype", void 0)
], QuestionsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('exam/:examId'),
    __param(0, (0, common_1.Param)('examId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], QuestionsController.prototype, "findByExam", null);
__decorate([
    (0, common_1.Post)('upload/:examId'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileFieldsInterceptor)([
        { name: 'questionsFile', maxCount: 1 },
        { name: 'answersFile', maxCount: 1 },
    ], { storage: (0, multer_1.memoryStorage)() })),
    __param(0, (0, common_1.Param)('examId')),
    __param(1, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], QuestionsController.prototype, "uploadDocx", null);
exports.QuestionsController = QuestionsController = __decorate([
    (0, common_1.Controller)('questions'),
    __metadata("design:paramtypes", [questions_service_1.QuestionsService,
        exams_service_1.ExamsService])
], QuestionsController);
//# sourceMappingURL=questions.controller.js.map