import { QuestionBank, ExamSession, Question } from '@/types';

export class ExamGenerationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ExamGenerationError';
  }
}

const shuffleArray = <T>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export const generateExamSession = (
  bank: QuestionBank,
  templateId: string
): ExamSession => {
  const template = bank.examTemplates.find((t) => t.id === templateId);
  
  if (!template) {
    throw new ExamGenerationError(`Template with ID ${templateId} not found.`);
  }

  const selectedQuestions: Question[] = [];
  const usedQuestionIds = new Set<string>();

  for (const rule of template.rules) {
    const matchingQuestions = bank.questions.filter((q) => q.type === rule.type);
    const availableQuestions = matchingQuestions.filter((q) => !usedQuestionIds.has(q.id));

    if (availableQuestions.length < rule.count) {
      throw new ExamGenerationError(
        `Not enough questions for rule '${rule.type}'. Required: ${rule.count}, Available: ${availableQuestions.length}.`
      );
    }

    let picked: Question[];
    if (template.shuffleQuestions) {
      picked = shuffleArray(availableQuestions).slice(0, rule.count);
    } else {
      picked = availableQuestions.slice(0, rule.count);
    }

    for (const q of picked) {
      usedQuestionIds.add(q.id);
      selectedQuestions.push(q);
    }
  }

  let finalQuestions = selectedQuestions;
  if (template.shuffleQuestions) {
    finalQuestions = shuffleArray(finalQuestions);
  }

  if (template.shuffleAnswers) {
    finalQuestions = finalQuestions.map((q) => {
      if (q.choices && q.choices.length > 0) {
        return { ...q, choices: shuffleArray(q.choices) };
      }
      return q;
    });
  }

  return {
    id: crypto.randomUUID(),
    bankId: bank.id,
    templateId: template.id,
    startTime: Date.now(),
    questions: finalQuestions,
    userAnswers: {},
    status: 'in-progress',
  };
};
