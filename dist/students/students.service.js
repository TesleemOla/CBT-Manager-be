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
exports.StudentsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const student_schema_1 = require("./schemas/student.schema");
let StudentsService = class StudentsService {
    studentModel;
    constructor(studentModel) {
        this.studentModel = studentModel;
    }
    async findOrCreate(dto) {
        const existing = await this.studentModel
            .findOne({ email: dto.email })
            .exec();
        if (existing)
            return existing;
        const student = new this.studentModel(dto);
        return student.save();
    }
    async create(dto) {
        const student = new this.studentModel(dto);
        return student.save();
    }
    async findAll() {
        return this.studentModel.find().sort({ createdAt: -1 }).exec();
    }
    async findOne(id) {
        const s = await this.studentModel.findById(id).exec();
        if (!s)
            throw new common_1.NotFoundException(`Student #${id} not found`);
        return s;
    }
    async findByEmail(email) {
        return this.studentModel.findOne({ email }).exec();
    }
};
exports.StudentsService = StudentsService;
exports.StudentsService = StudentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(student_schema_1.Student.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], StudentsService);
//# sourceMappingURL=students.service.js.map