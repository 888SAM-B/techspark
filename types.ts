export interface LearnerProfile {
  name: string;
  location: string;
  education: string;
  skills: string;
  aspiration: string;
  language: string;
}

export interface PathwayStep {
  stepType: 'Course' | 'Micro-credential' | 'Certification' | 'On-the-Job Training' | 'Project' | 'Assessment';
  title: string;
  description: string;
  nsqfLevel: string;
  duration: string;
}

export interface PathwayPhase {
  phaseTitle: string;
  phaseDescription: string;
  steps: PathwayStep[];
}

export interface LearningPathwayData {
  pathwayTitle: string;
  summary: string;
  phases: PathwayPhase[];
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
}

export interface QuizResult {
  score: number;
  totalQuestions: number;
  passed: boolean;
  completionDate: string;
}

export interface User {
  username: string;
  password: string; // In a real app, this would be hashed.
  profile: LearnerProfile | null;
  pathway: LearningPathwayData | null;
  completedSteps: string[];
  quizResult: QuizResult | null;
}

export interface JobOpportunity {
  jobTitle: string;
  companyName: string;
  jobDescription: string;
  requiredSkills: string[];
  url: string;
  minimumQualifications?: string;
}

export interface GroundingChunk {
  web: {
      uri: string;
      title: string;
  }
}

export interface JobSearchResponse {
  jobs: JobOpportunity[];
  sources: GroundingChunk[];
}


export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}