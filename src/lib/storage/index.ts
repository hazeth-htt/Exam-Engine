import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { QuestionBank, ExamSession } from '@/types';

interface ExamEngineDB extends DBSchema {
  questionBanks: {
    key: string;
    value: QuestionBank;
  };
  examSessions: {
    key: string;
    value: ExamSession;
  };
}

const DB_NAME = 'exam-engine-db';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<ExamEngineDB>> | null = null;

const getDB = () => {
  if (typeof window === 'undefined') return null; // Avoid running on SSR
  
  if (!dbPromise) {
    dbPromise = openDB<ExamEngineDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('questionBanks')) {
          db.createObjectStore('questionBanks', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('examSessions')) {
          db.createObjectStore('examSessions', { keyPath: 'id' });
        }
      },
    });
  }
  return dbPromise;
};

export const storage = {
  // Question Bank
  async getQuestionBanks(): Promise<QuestionBank[]> {
    const db = await getDB();
    if (!db) return [];
    return db.getAll('questionBanks');
  },
  
  async getQuestionBank(id: string): Promise<QuestionBank | undefined> {
    const db = await getDB();
    if (!db) return undefined;
    return db.get('questionBanks', id);
  },
  
  async saveQuestionBank(bank: QuestionBank): Promise<void> {
    const db = await getDB();
    if (!db) return;
    await db.put('questionBanks', bank);
  },
  
  async deleteQuestionBank(id: string): Promise<void> {
    const db = await getDB();
    if (!db) return;
    await db.delete('questionBanks', id);
  },

  // Exam Session
  async getExamSessions(): Promise<ExamSession[]> {
    const db = await getDB();
    if (!db) return [];
    return db.getAll('examSessions');
  },
  
  async getExamSession(id: string): Promise<ExamSession | undefined> {
    const db = await getDB();
    if (!db) return undefined;
    return db.get('examSessions', id);
  },
  
  async saveExamSession(session: ExamSession): Promise<void> {
    const db = await getDB();
    if (!db) return;
    await db.put('examSessions', session);
  },
  
  async deleteExamSession(id: string): Promise<void> {
    const db = await getDB();
    if (!db) return;
    await db.delete('examSessions', id);
  }
};
