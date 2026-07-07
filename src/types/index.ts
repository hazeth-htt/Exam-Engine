export interface Question {
  id: string;
  type: string;
  difficulty: string | number;
  chapter?: string;
  question: string;
  choices?: string[];
  answer: string | string[]; 
  explanation?: string;
}

export interface ExamRule {
  type: string;
  count: number;
  chapter?: string;
}

export interface ExamTemplate {
  id: string;
  name: string;
  description?: string;
  shuffleQuestions: boolean;
  shuffleAnswers: boolean;
  rules: ExamRule[];
}

export interface QuestionBankMetadata {
  subject: string;
  version: string;
  author?: string;
  createdAt?: string;
}

export interface QuestionBank {
  id: string; // generated on import
  metadata: QuestionBankMetadata;
  examTemplates: ExamTemplate[];
  questions: Question[];
}

export interface ExamSession {
  id: string;
  bankId: string;
  templateId: string;
  startTime: number;
  endTime?: number;
  questions: Question[];
  userAnswers: Record<string, string | string[]>;
  status: 'in-progress' | 'completed';
}

// Flashcard types
export interface Flashcard {
  id: string;
  front: {
    kanji: string;
    hiragana?: string;
  };
  back: {
    meaning: string;
  };
}

export interface FlashcardDeck {
  id: string;
  metadata: {
    title: string;
    description: string;
    version: string;
    createdAt: number;
  };
  cards: Flashcard[];
}
