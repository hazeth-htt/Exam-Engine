import { z } from 'zod';

export const QuestionSchema = z.object({
  id: z.union([z.string(), z.number()]).transform(String),
  type: z.string(),
  difficulty: z.union([z.string(), z.number()]),
  chapter: z.string().optional(),
  question: z.string(),
  choices: z.array(z.string()).optional(),
  answer: z.union([z.string(), z.array(z.string()), z.number()]).transform((val) => 
    Array.isArray(val) ? val.map(String) : String(val)
  ),
  explanation: z.string().optional(),
});

export const ExamRuleSchema = z.object({
  type: z.string(),
  count: z.number().positive(),
  chapter: z.string().optional(),
});

export const ExamTemplateSchema = z.object({
  id: z.union([z.string(), z.number()]).transform(String),
  name: z.string(),
  description: z.string().optional(),
  shuffleQuestions: z.boolean().default(false),
  shuffleAnswers: z.boolean().default(false),
  rules: z.array(ExamRuleSchema).default([]),
});

export const QuestionBankMetadataSchema = z.object({
  subject: z.string(),
  version: z.union([z.string(), z.number()]).transform(String),
  author: z.string().optional(),
  createdAt: z.string().optional(),
});

export const QuestionBankSchema = z.object({
  metadata: QuestionBankMetadataSchema,
  examTemplates: z.array(ExamTemplateSchema).default([]),
  questions: z.array(QuestionSchema),
});
