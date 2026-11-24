import rawResume from '../data/resume.json';
import { ResumeSchema, type ResumeData } from '../data/resume.schema';

let cachedResume: ResumeData | null = null;

export function getResumeData(): ResumeData {
  if (!cachedResume) {
    cachedResume = ResumeSchema.parse(rawResume);
  }
  return cachedResume;
}
