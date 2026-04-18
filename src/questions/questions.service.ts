import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Question, QuestionDocument } from './schemas/question.schema';
import { CreateQuestionDto } from './dto/create-question.dto';
import * as mammoth from 'mammoth';

interface ParsedQuestion {
  text: string;
  options: string[];
  correctAnswer: string;
  order: number;
  isPassage?: boolean;
}

@Injectable()
export class QuestionsService {
  constructor(
    @InjectModel(Question.name) private questionModel: Model<QuestionDocument>,
  ) {}

  async create(dto: CreateQuestionDto): Promise<Question> {
    const q = new this.questionModel(dto);
    return q.save();
  }

  async findByExam(examId: string): Promise<Question[]> {
    return this.questionModel.find({ examId }).sort({ order: 1 }).exec();
  }

  async findOne(id: string): Promise<Question> {
    const q = await this.questionModel.findById(id).exec();
    if (!q) throw new NotFoundException(`Question #${id} not found`);
    return q;
  }

  async deleteByExam(examId: string): Promise<void> {
    await this.questionModel.deleteMany({ examId }).exec();
  }

  async countByExam(examId: string): Promise<number> {
    return this.questionModel.countDocuments({ examId }).exec();
  }

  /**
   * Parses a DOCX buffer containing exam questions.
   * Expected format per question:
   *   Q1. Question text here
   *   A) Option A text
   *   B) Option B text
   *   C) Option C text
   *   D) Option D text
   *
   * Supports numbered questions, blank-line separated blocks.
   */
  async parseQuestionsDocx(buffer: Buffer): Promise<ParsedQuestion[]> {
    const result = await mammoth.extractRawText({ buffer });
    const text = result.value;
    return this.parseQuestionsFromText(text);
  }

  /**
   * Parses a DOCX buffer containing answers.
   * Expected format:
   *   1. A
   *   2. C
   *   3. B
   * or
   *   1) A
   *   2) B
   */
  async parseAnswersDocx(buffer: Buffer): Promise<Record<number, string>> {
    const result = await mammoth.extractRawText({ buffer });
    const text = result.value;
    return this.parseAnswersFromText(text);
  }

  private parseQuestionsFromText(text: string): ParsedQuestion[] {
    const questions: ParsedQuestion[] = [];
    const normalizedText = text.replace(/\t/g, ' ').replace(/\r\n/g, '\n').replace(/ {2,}/g, ' ');

    // STEP 1: Smart Block Collection
    // We iterate line-by-line to build valid question blocks.
    const lines = normalizedText.split('\n');
    const rawBlocks: string[] = [];
    let currentBlock = '';

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine) continue;

      // Question Start Criteria:
      // 1. Explicit Number: Starts with digit(s) + [.) ]
      const isExplicitNumber = /^\d+[.)\s]/.test(trimmedLine);
      
      // 2. Implicit Start (e.g. Q1-55 format): Contains "a) " or "(a) " after text, AND current block already has its own options.
      const containsAMarker = /(?:\s+|^)\(?a[.)]\s+/i.test(trimmedLine);
      const startsWithAMarker = /^\(?a[.)]\s+/i.test(trimmedLine);
      const isImplicitNumberlessStart = containsAMarker && !startsWithAMarker && (currentBlock.toLowerCase().includes(' a)') || currentBlock.toLowerCase().includes(' (a)'));

      // 3. Explicit Header: Section markers or Comprehensive text
      const isHeader = /^(ENGLISH LANGUAGE|GENERAL PAPER|COMPREHENSION|Section)/i.test(trimmedLine);

      if ((isExplicitNumber || isImplicitNumberlessStart || isHeader) && currentBlock) {
        rawBlocks.push(currentBlock);
        currentBlock = line;
      } else {
        currentBlock = currentBlock ? currentBlock + '\n' + line : line;
      }
    }
    if (currentBlock) rawBlocks.push(currentBlock);

    let order = 0;
    let pendingPassage = '';

    for (let i = 0; i < rawBlocks.length; i++) {
        const block = rawBlocks[i].trim();
        
        // Inner-block split check for merged questions (Mammoth merges some lines)
        const subBlocks = block.split(/\n(?=\d+[.)]\s)/).filter(b => b.trim());
        
        for (const subBlock of subBlocks) {
            const content = subBlock.trim();
            const headerMatch = content.match(/^(\d+)[.)\s]\s*([\s\S]+)/);
            
            let qTextAndOptions = '';
            if (headerMatch) {
              qTextAndOptions = headerMatch[2];
            } else {
              const hasOptions = /(?:\s+|^)\(?([a-eA-E])[.)]\s+/i.test(content);
              if (!hasOptions) {
                  pendingPassage += (pendingPassage ? '\n\n' : '') + content;
                  continue;
              }
              qTextAndOptions = content;
            }

            if (pendingPassage) {
              const cleanedPassage = pendingPassage.trim();
              const isRealPassage = cleanedPassage.length > 300 || /passage|comprehension|extract/i.test(cleanedPassage);

              if (isRealPassage) {
                questions.push({
                  text: cleanedPassage,
                  options: [],
                  correctAnswer: '',
                  order: order++,
                  isPassage: true,
                });
              } else {
                // Prepend to the next thing (question or passage)
                qTextAndOptions = cleanedPassage + '\n\n' + qTextAndOptions;
              }
              pendingPassage = '';
            }

            const markers = Array.from(qTextAndOptions.matchAll(/(?:\s+|^)\(?([a-eA-E])[.)]\s+/gi));
            let finalOptions: string[] = [];
            let questionText = qTextAndOptions;
            
            if (markers.length > 0) {
              const potentialOptions: { index: number, length: number, letter: string, text: string }[] = [];
              const firstLetter = markers[0][1].toUpperCase();

              // Correct for missing "A" marker
              if (firstLetter !== 'A' && markers.length >= 1) {
                const textBeforeFirst = qTextAndOptions.substring(0, markers[0].index!).trim();
                const likelyOptAStart = textBeforeFirst.lastIndexOf('\n') + 1;
                potentialOptions.push({ index: likelyOptAStart, length: 0, letter: 'A', text: '' });
              }

              let expectedCharCode = potentialOptions.length > 0 ? 66 : markers[0][1].toUpperCase().charCodeAt(0);
              for (const m of markers) {
                const letter = m[1].toUpperCase();
                const charCode = letter.charCodeAt(0);
                if (charCode === expectedCharCode || (potentialOptions.length === 0 && charCode === 65)) {
                  potentialOptions.push({ index: m.index || 0, length: m[0].length, letter, text: '' });
                  expectedCharCode = charCode + 1;
                } else if (potentialOptions.length >= 2) break;
              }

              if (potentialOptions.length >= 2) {
                questionText = qTextAndOptions.substring(0, potentialOptions[0].index).trim();
                for (let j = 0; j < potentialOptions.length; j++) {
                  const start = potentialOptions[j].index + potentialOptions[j].length;
                  const end = potentialOptions[j+1] ? potentialOptions[j+1].index : qTextAndOptions.length;
                  let optBody = qTextAndOptions.substring(start, end).trim();
                  
                  if (j === potentialOptions.length - 1) {
                    const breakPoint = optBody.match(/\n\s*\n|\n(?=[A-Z][A-Za-z ]{5,})/);
                    if (breakPoint) {
                        finalOptions.push(optBody.substring(0, breakPoint.index!).trim());
                        pendingPassage = optBody.substring(breakPoint.index!).trim();
                    } else {
                        finalOptions.push(optBody);
                    }
                  } else finalOptions.push(optBody);
                }
              }
            }

            if (questionText && (finalOptions.length > 0 || i === rawBlocks.length - 1)) {
              const isActualQuestion = finalOptions.length > 0 && finalOptions[0] !== 'No Options Provided';
              questions.push({
                text: questionText,
                options: finalOptions.length > 0 ? finalOptions : ['No Options Provided'],
                correctAnswer: finalOptions.length > 0 ? finalOptions[0] : 'None',
                order: order++,
                isPassage: !isActualQuestion,
              });
            }
        }
    }

    if (pendingPassage) {
      const cleanedPassage = pendingPassage.trim();
      const isRealPassage = cleanedPassage.length > 300 || /passage|comprehension|extract/i.test(cleanedPassage);
      
      questions.push({
        text: cleanedPassage,
        options: [],
        correctAnswer: '',
        order: order++,
        isPassage: isRealPassage, // Only mark as passage if it meets criteria
      });
    }

    return questions;
  }

  private parseAnswersFromText(text: string): Record<number, string> {
    const answers: Record<number, string> = {};
    // Normalize: replace tabs with single spaces for easier regex, but leave enough for word boundaries
    const normalizedText = text.replace(/\t/g, ' ').replace(/\r\n/g, '\n');
    
    // Improved Regex to find number-answer pairs.
    // Handles: "1. A", "1) B", "1 A", "26 D", etc.
    // Uses lookahead/behind or simple boundaries to ensure we match "1 A" but not "N2000 A"
    const answerRegex = /(?:^|\s)(\d+)[.)]?\s+([A-Ea-e])(?:\s|$)/g;

    let match;
    while ((match = answerRegex.exec(normalizedText)) !== null) {
      const qNum = parseInt(match[1]);
      const answer = match[2].toUpperCase();
      answers[qNum] = answer;
    }

    return answers;
  }

  /**
   * Bulk-imports questions from parsed data, merging with answer key.
   * The answer key maps question number (1-based) to option letter (A/B/C/D).
   */
  async bulkImport(
    examId: string,
    questions: ParsedQuestion[],
    answerKey: Record<number, string>,
  ): Promise<Question[]> {
    let questionCounter = 1;
    const docs = questions.map((q) => {
      if (q.isPassage) {
        return {
          examId,
          text: q.text,
          options: [],
          correctAnswer: 'None',
          order: q.order,
          isPassage: true,
        };
      }

      const answerLetter = answerKey[questionCounter++];
      const optionLetters = ['A', 'B', 'C', 'D', 'E'];
      const correctIndex = optionLetters.indexOf(answerLetter);
      const correctAnswer =
        correctIndex >= 0 && correctIndex < q.options.length
          ? q.options[correctIndex]
          : q.options[0];

      return {
        examId,
        text: q.text,
        options: q.options,
        correctAnswer,
        order: q.order,
        isPassage: false,
      };
    });

    await this.questionModel.deleteMany({ examId }).exec();
    return this.questionModel.insertMany(docs) as unknown as Question[];
  }
}
