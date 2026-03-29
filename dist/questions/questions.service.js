"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuestionsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const question_schema_1 = require("./schemas/question.schema");
const mammoth = __importStar(require("mammoth"));
let QuestionsService = class QuestionsService {
    questionModel;
    constructor(questionModel) {
        this.questionModel = questionModel;
    }
    async create(dto) {
        const q = new this.questionModel(dto);
        return q.save();
    }
    async findByExam(examId) {
        return this.questionModel.find({ examId }).sort({ order: 1 }).exec();
    }
    async findOne(id) {
        const q = await this.questionModel.findById(id).exec();
        if (!q)
            throw new common_1.NotFoundException(`Question #${id} not found`);
        return q;
    }
    async deleteByExam(examId) {
        await this.questionModel.deleteMany({ examId }).exec();
    }
    async countByExam(examId) {
        return this.questionModel.countDocuments({ examId }).exec();
    }
    async parseQuestionsDocx(buffer) {
        const result = await mammoth.extractRawText({ buffer });
        const text = result.value;
        return this.parseQuestionsFromText(text);
    }
    async parseAnswersDocx(buffer) {
        const result = await mammoth.extractRawText({ buffer });
        const text = result.value;
        return this.parseAnswersFromText(text);
    }
    parseQuestionsFromText(text) {
        const questions = [];
        const normalizedText = text.replace(/\t/g, ' ').replace(/\r\n/g, '\n');
        const rawBlocks = normalizedText.split(/(?=\n\d+[.)]\s)|(?=^\d+[.)]\s)/m).filter(b => b.trim().length > 0);
        let order = 0;
        let pendingPassage = '';
        for (let i = 0; i < rawBlocks.length; i++) {
            const block = rawBlocks[i];
            const trimmedBlock = block.trim();
            const qHeaderMatch = trimmedBlock.match(/^(\d+)[.)]\s+([\s\S]+)/);
            if (!qHeaderMatch) {
                pendingPassage += (pendingPassage ? '\n\n' : '') + trimmedBlock;
                continue;
            }
            const qNum = qHeaderMatch[1];
            let fullContent = qHeaderMatch[2];
            if (pendingPassage) {
                fullContent = pendingPassage + '\n\n' + fullContent;
                pendingPassage = '';
            }
            const markers = Array.from(fullContent.matchAll(/(?:\s+|^)([a-eA-E])[.)]\s+/g));
            let finalOptions = [];
            let questionText = fullContent;
            if (markers.length >= 2) {
                const potentialOptions = [];
                let expectedCharCode = 65;
                for (const m of markers) {
                    const letter = m[1].toUpperCase();
                    const charCode = letter.charCodeAt(0);
                    if (charCode === expectedCharCode) {
                        potentialOptions.push({
                            index: m.index || 0,
                            length: m[0].length,
                            letter,
                            text: ''
                        });
                        expectedCharCode++;
                    }
                    else if (potentialOptions.length >= 2) {
                        break;
                    }
                    else {
                        potentialOptions.length = 0;
                        if (charCode === 65) {
                            potentialOptions.push({
                                index: m.index || 0,
                                length: m[0].length,
                                letter,
                                text: ''
                            });
                            expectedCharCode = 66;
                        }
                        else {
                            expectedCharCode = 65;
                        }
                    }
                }
                if (potentialOptions.length >= 2) {
                    const firstOpt = potentialOptions[0];
                    questionText = fullContent.substring(0, firstOpt.index).trim();
                    for (let j = 0; j < potentialOptions.length; j++) {
                        const start = potentialOptions[j].index + potentialOptions[j].length;
                        const end = potentialOptions[j + 1] ? potentialOptions[j + 1].index : fullContent.length;
                        let optionContent = fullContent.substring(start, end).trim();
                        if (j === potentialOptions.length - 1) {
                            const parts = optionContent.split(/\n\s*\n|\n(?=[A-Z][a-z]+)/);
                            if (parts.length > 1) {
                                finalOptions.push(parts[0].trim());
                                pendingPassage = parts.slice(1).join('\n\n').trim();
                            }
                            else {
                                finalOptions.push(optionContent);
                            }
                        }
                        else {
                            finalOptions.push(optionContent);
                        }
                    }
                }
            }
            if (questionText && (finalOptions.length > 0 || i === rawBlocks.length - 1)) {
                questions.push({
                    text: questionText,
                    options: finalOptions.length > 0 ? finalOptions : ['No Options Provided'],
                    correctAnswer: finalOptions.length > 0 ? finalOptions[0] : 'None',
                    order: order++,
                });
            }
        }
        if (questions.length === 0) {
            throw new common_1.BadRequestException('Could not parse any questions. Please check your DOCX formatting.');
        }
        return questions;
    }
    parseAnswersFromText(text) {
        const answers = {};
        const normalizedText = text.replace(/\t/g, ' ').replace(/\r\n/g, '\n');
        const answerRegex = /(?:^|\s)(\d+)[.)]?\s+([A-Ea-e])(?:\s|$)/g;
        let match;
        while ((match = answerRegex.exec(normalizedText)) !== null) {
            const qNum = parseInt(match[1]);
            const answer = match[2].toUpperCase();
            answers[qNum] = answer;
        }
        return answers;
    }
    async bulkImport(examId, questions, answerKey) {
        const docs = questions.map((q, idx) => {
            const answerLetter = answerKey[idx + 1];
            const optionLetters = ['A', 'B', 'C', 'D', 'E'];
            const correctIndex = optionLetters.indexOf(answerLetter);
            const correctAnswer = correctIndex >= 0 && correctIndex < q.options.length
                ? q.options[correctIndex]
                : q.options[0];
            return {
                examId,
                text: q.text,
                options: q.options,
                correctAnswer,
                order: q.order,
            };
        });
        await this.questionModel.deleteMany({ examId }).exec();
        return this.questionModel.insertMany(docs);
    }
};
exports.QuestionsService = QuestionsService;
exports.QuestionsService = QuestionsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(question_schema_1.Question.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], QuestionsService);
//# sourceMappingURL=questions.service.js.map