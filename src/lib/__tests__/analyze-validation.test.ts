import { describe, it, expect } from 'vitest';
import { analyzeProfileSchema, parseBody } from '@/lib/validations';

const validPayload = {
  name: 'Jordan Smith',
  university: 'MIT',
  major: 'Computer Science',
  gpa: '3.9',
  question6: '$50,000 per year',
};

describe('analyzeProfileSchema', () => {
  it('accepts a valid payload with all required fields', () => {
    const result = analyzeProfileSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
  });

  it('accepts a payload with all optional fields populated', () => {
    const full = {
      ...validPayload,
      residency: 'California, USA',
      sat: '1520',
      internationalExams: 'IB 42',
      otherExams: 'TOEFL 115',
      coursework: 'AP Physics, AP Calculus BC',
      activities: 'Robotics club president',
      awards: 'National Merit Scholar',
      preferredRegions: 'USA, UK',
      question1: 'Small class sizes',
      question2: 'Built a robot',
      question3: 'Urban campus',
      question4: 'Prestige matters',
      question5: 'Software engineer',
      question7: 'Need merit aid',
      question8: 'Career services',
      question9: 'Hackathons',
    };
    const result = analyzeProfileSchema.safeParse(full);
    expect(result.success).toBe(true);
  });

  it('rejects when name is missing', () => {
    const { name, ...noName } = validPayload;
    const result = analyzeProfileSchema.safeParse(noName);
    expect(result.success).toBe(false);
  });

  it('rejects when name is empty', () => {
    const result = analyzeProfileSchema.safeParse({ ...validPayload, name: '' });
    expect(result.success).toBe(false);
  });

  it('rejects when university is missing', () => {
    const { university, ...noUni } = validPayload;
    const result = analyzeProfileSchema.safeParse(noUni);
    expect(result.success).toBe(false);
  });

  it('rejects when major is missing', () => {
    const { major, ...noMajor } = validPayload;
    const result = analyzeProfileSchema.safeParse(noMajor);
    expect(result.success).toBe(false);
  });

  it('rejects when question6 (budget) is missing', () => {
    const { question6, ...noBudget } = validPayload;
    const result = analyzeProfileSchema.safeParse(noBudget);
    expect(result.success).toBe(false);
  });

  it('rejects when no academic metric is provided', () => {
    const { gpa, ...noGpa } = validPayload;
    const result = analyzeProfileSchema.safeParse(noGpa);
    expect(result.success).toBe(false);
  });

  it('accepts when only sat is provided as an academic metric', () => {
    const { gpa, ...noGpa } = validPayload;
    const result = analyzeProfileSchema.safeParse({ ...noGpa, sat: '1500' });
    expect(result.success).toBe(true);
  });

  it('accepts when only internationalExams is provided as an academic metric', () => {
    const { gpa, ...noGpa } = validPayload;
    const result = analyzeProfileSchema.safeParse({ ...noGpa, internationalExams: 'IB 40' });
    expect(result.success).toBe(true);
  });

  it('accepts when only otherExams is provided as an academic metric', () => {
    const { gpa, ...noGpa } = validPayload;
    const result = analyzeProfileSchema.safeParse({ ...noGpa, otherExams: 'TOEFL 110' });
    expect(result.success).toBe(true);
  });

  it('rejects fields exceeding 1000 characters', () => {
    const result = analyzeProfileSchema.safeParse({
      ...validPayload,
      name: 'a'.repeat(1001),
    });
    expect(result.success).toBe(false);
  });

  it('accepts fields at exactly 1000 characters', () => {
    const result = analyzeProfileSchema.safeParse({
      ...validPayload,
      activities: 'a'.repeat(1000),
    });
    expect(result.success).toBe(true);
  });

  it('works with parseBody helper and returns error on invalid input', () => {
    const result = parseBody(analyzeProfileSchema, {});
    expect(result.error).toBeDefined();
    expect(typeof result.error).toBe('string');
  });

  it('works with parseBody helper and returns data on valid input', () => {
    const result = parseBody(analyzeProfileSchema, validPayload);
    expect(result.error).toBeUndefined();
    expect(result.data).toBeDefined();
    expect(result.data!.name).toBe('Jordan Smith');
  });
});
