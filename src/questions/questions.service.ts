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
    
    // Normalize line endings and tabs
    const normalizedText = text.replace(/\t/g, ' ').replace(/\r\n/g, '\n');

    // Split text into potential question blocks.
    // A block starts with a number followed by . or ) and a space at the beginning of a line.
    // We use a positive lookahead to keep the separator.
    const rawBlocks = normalizedText.split(/(?=\n\d+[.)]\s)|(?=^\d+[.)]\s)/m).filter(b => b.trim().length > 0);

    let order = 0;
    let pendingPassage = '';

    for (let i = 0; i < rawBlocks.length; i++) {
      const block = rawBlocks[i];
      const trimmedBlock = block.trim();
      
      // Check if this block actually starts with a question marker
      const qHeaderMatch = trimmedBlock.match(/^(\d+)[.)]\s+([\s\S]+)/);
      
      if (!qHeaderMatch) {
        // This is likely a passage, title, or instruction block before questions
        pendingPassage += (pendingPassage ? '\n\n' : '') + trimmedBlock;
        continue;
      }

      const qNum = qHeaderMatch[1];
      let fullContent = qHeaderMatch[2];
      
      // If we have a pending passage, check if it's the start of a new section
      // Often passages end with "Read the following..."
      // We prepend it to the current question.
      if (pendingPassage) {
        fullContent = pendingPassage + '\n\n' + fullContent;
        // We only clear it if we're reasonably sure it was just for this or the coming group.
        // For now, we clear it after the first question of a group.
        pendingPassage = ''; 
      }

      // SEQUENCE-AWARE OPTION PARSING
      // We look for a series of markers: A, B, C, D...
      const markers = Array.from(fullContent.matchAll(/(?:\s+|^)([a-eA-E])[.)]\s+/g));
      
      let finalOptions: string[] = [];
      let questionText = fullContent;
      
      if (markers.length >= 2) {
        const potentialOptions: { index: number, length: number, letter: string, text: string }[] = [];
        let expectedCharCode = 65; // 'A'
        
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
          } else if (potentialOptions.length >= 2) {
            // Sequence broke, but we already have enough options. Stop here.
            break;
          } else {
            // Sequence never really started or restarted.
            potentialOptions.length = 0;
            if (charCode === 65) {
              potentialOptions.push({ 
                index: m.index || 0, 
                length: m[0].length, 
                letter, 
                text: '' 
              });
              expectedCharCode = 66;
            } else {
              expectedCharCode = 65;
            }
          }
        }

        if (potentialOptions.length >= 2) {
          const firstOpt = potentialOptions[0];
          questionText = fullContent.substring(0, firstOpt.index).trim();
          
          for (let j = 0; j < potentialOptions.length; j++) {
            const start = potentialOptions[j].index + potentialOptions[j].length;
            const end = potentialOptions[j+1] ? potentialOptions[j+1].index : fullContent.length;
            
            let optionContent = fullContent.substring(start, end).trim();
            
            // If it's the LAST option, check if there's a trailing passage (next section header)
            if (j === potentialOptions.length - 1) {
              // We look for a double newline or a single newline followed by significant text.
              // This is a common pattern for "Read the following..." appearing at the end of a question block.
              const parts = optionContent.split(/\n\s*\n|\n(?=[A-Z][a-z]+)/); 
              if (parts.length > 1) {
                finalOptions.push(parts[0].trim());
                // Forward the rest as a passage for the next question
                pendingPassage = parts.slice(1).join('\n\n').trim();
              } else {
                finalOptions.push(optionContent);
              }
            } else {
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
      throw new BadRequestException('Could not parse any questions. Please check your DOCX formatting.');
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
