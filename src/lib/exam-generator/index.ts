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
    let matchingQuestions = bank.questions.filter((q) => q.type === rule.type || rule.type === 'all');
    if (rule.chapter) {
      matchingQuestions = matchingQuestions.filter(q => q.chapter === rule.chapter);
    }
    const availableQuestions = matchingQuestions.filter((q) => !usedQuestionIds.has(q.id));

    const actualCount = Math.min(rule.count, availableQuestions.length);

    let picked: Question[];
    if (template.shuffleQuestions) {
      picked = shuffleArray(availableQuestions).slice(0, actualCount);
    } else {
      picked = availableQuestions.slice(0, actualCount);
    }

    for (const q of picked) {
      usedQuestionIds.add(q.id);
      selectedQuestions.push(q);
    }
  }

  if (selectedQuestions.length === 0) {
    throw new ExamGenerationError("Ngân hàng này chưa có câu hỏi nào phù hợp với chế độ luyện tập.");
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
