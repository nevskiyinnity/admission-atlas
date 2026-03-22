import { z } from 'zod';

export const inquirySchema = z.object({
  studentFullName: z.string().min(1, 'Student name is required').max(200),
  parentWeChatId: z.string().max(100).optional().default(''),
  parentPhone: z.string().max(50).optional().default(''),
  parentEmail: z.string().email('Valid email is required').max(200),
  studentSchool: z.string().max(200).optional().default(''),
  studentGrade: z.string().max(50).optional().default(''),
  graduationYear: z.string().max(10).optional().default(''),
  grades: z.string().max(500).optional().default(''),
  intendedMajors: z.string().max(500).optional().default(''),
  targetCountries: z.string().max(500).optional().default(''),
  budgetRange: z.string().max(100).optional().default(''),
  supportNeeded: z.string().max(100).optional().default(''),
  neuralEngineReport: z.string().max(2000).optional().default(''),
  notes: z.string().max(2000).optional().default(''),
  honeypot: z.string().max(0, 'Bot detected').optional().default(''),
});

export type InquiryInput = z.infer<typeof inquirySchema>;
