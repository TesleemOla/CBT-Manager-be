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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExamSchema = exports.Exam = void 0;
const mongoose_1 = require("@nestjs/mongoose");
let Exam = class Exam {
    title;
    subject;
    durationMinutes;
    totalQuestions;
    pointsPerQuestion;
    shuffleQuestions;
    shuffleOptions;
    isActive;
    instructions;
    passMark;
};
exports.Exam = Exam;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Exam.prototype, "title", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Exam.prototype, "subject", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], Exam.prototype, "durationMinutes", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], Exam.prototype, "totalQuestions", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 1 }),
    __metadata("design:type", Number)
], Exam.prototype, "pointsPerQuestion", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], Exam.prototype, "shuffleQuestions", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], Exam.prototype, "shuffleOptions", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: true }),
    __metadata("design:type", Boolean)
], Exam.prototype, "isActive", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Exam.prototype, "instructions", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 70 }),
    __metadata("design:type", Number)
], Exam.prototype, "passMark", void 0);
exports.Exam = Exam = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Exam);
exports.ExamSchema = mongoose_1.SchemaFactory.createForClass(Exam);
//# sourceMappingURL=exam.schema.js.map