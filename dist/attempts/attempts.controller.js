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
exports.AttemptsController = void 0;
const common_1 = require("@nestjs/common");
const attempts_service_1 = require("./attempts.service");
const submit_attempt_dto_1 = require("./dto/submit-attempt.dto");
let AttemptsController = class AttemptsController {
    attemptsService;
    constructor(attemptsService) {
        this.attemptsService = attemptsService;
    }
    start(body) {
        return this.attemptsService.start(body.examId, body.studentId);
    }
    submit(dto) {
        return this.attemptsService.submit(dto);
    }
    findByStudent(studentId) {
        return this.attemptsService.findByStudent(studentId);
    }
    findByExam(examId) {
        return this.attemptsService.findByExam(examId);
    }
    getResults(examId) {
        return this.attemptsService.getResults(examId);
    }
    findOne(id) {
        return this.attemptsService.findOne(id);
    }
};
exports.AttemptsController = AttemptsController;
__decorate([
    (0, common_1.Post)('start'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AttemptsController.prototype, "start", null);
__decorate([
    (0, common_1.Post)('submit'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [submit_attempt_dto_1.SubmitAttemptDto]),
    __metadata("design:returntype", void 0)
], AttemptsController.prototype, "submit", null);
__decorate([
    (0, common_1.Get)('student/:studentId'),
    __param(0, (0, common_1.Param)('studentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AttemptsController.prototype, "findByStudent", null);
__decorate([
    (0, common_1.Get)('exam/:examId'),
    __param(0, (0, common_1.Param)('examId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AttemptsController.prototype, "findByExam", null);
__decorate([
    (0, common_1.Get)('results/:examId'),
    __param(0, (0, common_1.Param)('examId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AttemptsController.prototype, "getResults", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AttemptsController.prototype, "findOne", null);
exports.AttemptsController = AttemptsController = __decorate([
    (0, common_1.Controller)('attempts'),
    __metadata("design:paramtypes", [attempts_service_1.AttemptsService])
], AttemptsController);
//# sourceMappingURL=attempts.controller.js.map