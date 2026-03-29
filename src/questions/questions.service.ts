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
    const normalizedText = text.replace(/\t/g, ' ').replace(/\r\n/g, '\n');

    const lines = normalizedText.split('\n');
    const rawBlocks: string[] = [];
    let currentBlock = '';

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine) continue;

      const isNewNumber = /^\d+[.)\s]\s*/.test(trimmedLine);
      const startWithOptionMarker = /^\(?([a-eA-E])[.)]\s+/.test(trimmedLine);
      const containsOptionMarker = /(?:\s+|^)\(?([a-eA-E])[.)]\s+/i.test(trimmedLine);
      
      // We only split if it's a new number OR a numberless question.
      // A numberless question is one that contains options but DOES NOT start with one (meaning there is text before the option).
      // Also ensure we don't split if we haven't even finished the previous question's options.
      const shouldSplit = isNewNumber || (containsOptionMarker && !startWithOptionMarker && currentBlock.length > 50);

      if (shouldSplit && currentBlock) {
        rawBlocks.push(currentBlock);
        currentBlock = line;
      } else {
        currentBlock += (currentBlock ? '\n' : '') + line;
      }
    }
    if (currentBlock) rawBlocks.push(currentBlock);

    let order = 0;
    let pendingPassage = '';

    for (let i = 0; i < rawBlocks.length; i++) {
      const block = rawBlocks[i];
      const trimmedBlock = block.trim();
      
      const qHeaderMatch = trimmedBlock.match(/^(\d+)[.)\s]\s*([\s\S]+)/);
      let fullContent = '';
      if (qHeaderMatch) {
        fullContent = qHeaderMatch[2];
      } else {
        if (!/(?:\s+|^)\(?([a-eA-E])[.)]\s+/i.test(trimmedBlock)) {
          pendingPassage += (pendingPassage ? '\n\n' : '') + trimmedBlock;
          continue;
        }
        fullContent = trimmedBlock;
      }

      if (pendingPassage) {
        fullContent = pendingPassage + '\n\n' + fullContent;
        pendingPassage = ''; 
      }

      // IMPROVED OPTION PARSING: Handle missing 'a)' markers
      const markers = Array.from(fullContent.matchAll(/(?:\s+|^)\(?([a-eA-E])[.)]\s+/gi));
      
      let finalOptions: string[] = [];
      let questionText = fullContent;
      
      if (markers.length > 0) {
        const potentialOptions: { index: number, length: number, letter: string, text: string }[] = [];
        
        // Find the first marker. If it's not 'A', we will assume everything before it was 'A'.
        const firstMarkerLetter = markers[0][1].toUpperCase();
        
        if (firstMarkerLetter !== 'A' && markers.length >= 1) {
            // Special case: Missing 'a)'. We create a virtual 'A' marker at the start of the likely option area.
            // Heuristic: Option A usually follows the last newline or a large gap.
            // For now, we take the text before the first marker and try to find where it starts.
            const textBeforeFirst = fullContent.substring(0, markers[0].index!).trim();
            const lastLineBreak = textBeforeFirst.lastIndexOf('\n');
            const splitPoint = lastLineBreak !== -1 ? lastLineBreak : 0;
            
            potentialOptions.push({ index: splitPoint, length: 0, letter: 'A', text: '' });
        }

        let expectedCharCode = potentialOptions.length > 0 ? 66 : markers[0][1].toUpperCase().charCodeAt(0);
        
        for (const m of markers) {
          const letter = m[1].toUpperCase();
          const charCode = letter.charCodeAt(0);
          
          if (charCode === expectedCharCode || (potentialOptions.length === 0 && charCode === 65)) {
            potentialOptions.push({ index: m.index || 0, length: m[0].length, letter, text: '' });
            expectedCharCode = charCode + 1;
          } else if (potentialOptions.length >= 2) {
            break;
          }
        }

        if (potentialOptions.length >= 2) {
          questionText = fullContent.substring(0, potentialOptions[0].index).trim();
          for (let j = 0; j < potentialOptions.length; j++) {
            const start = potentialOptions[j].index + potentialOptions[j].length;
            const end = potentialOptions[j+1] ? potentialOptions[j+1].index : fullContent.length;
            let content = fullContent.substring(start, end).trim();
            
            if (j === potentialOptions.length - 1) {
              const parts = content.split(/\n\s*\n|\n(?=[A-Z][a-z]+)/); 
              if (parts.length > 1) {
                finalOptions.push(parts[0].trim());
                pendingPassage = parts.slice(1).join('\n\n').trim();
              } else {
                finalOptions.push(content);
              }
            } else {
              finalOptions.push(content);
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
      throw new BadRequestException('Could not parse any questions.');
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
    const docs = questions.map((q, idx) => {
      const answerLetter = answerKey[idx + 1];
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
      };
    });

    await this.questionModel.deleteMany({ examId }).exec();
    return this.questionModel.insertMany(docs) as unknown as Question[];
  }
}
