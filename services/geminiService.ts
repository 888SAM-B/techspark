import {
  LearnerProfile,
  LearningPathwayData,
  PathwayStep,
  QuizQuestion,
  JobSearchResponse,
  ChatMessage,
} from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export interface StepChatSession {
  sendMessage: (params: { message: string }) => Promise<{ text: string }>;
}

// Generate Personalized Learning Path
export const generateLearningPath = async (profile: LearnerProfile): Promise<LearningPathwayData> => {
  try {
    const res = await fetch(`${API_BASE}/api/ai/generate-path`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to generate learning path from AI service.');
    }
    return data.pathway as LearningPathwayData;
  } catch (error) {
    console.error('Error in generateLearningPath:', error);
    throw new Error('Failed to generate learning path from AI service. Please ensure the backend is running.');
  }
};

// Generate Assessment Quiz (Optimized for speed and accuracy)
export const generateQuiz = async (
  profile: LearnerProfile,
  pathway: LearningPathwayData
): Promise<QuizQuestion[]> => {
  try {
    const res = await fetch(`${API_BASE}/api/ai/generate-quiz`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile, pathway, questionCount: 15 }),
    });

    const data = await res.json();
    if (!res.ok || !data.success || !Array.isArray(data.quiz)) {
      throw new Error(data.message || 'Invalid quiz format received from AI.');
    }
    return data.quiz as QuizQuestion[];
  } catch (error) {
    console.error('Error in generateQuiz:', error);
    throw new Error('Failed to generate quiz from AI service.');
  }
};

// Generate Step Detailed A-to-Z Guide
export const generateStepDetails = async (step: PathwayStep, language: string): Promise<string> => {
  try {
    const res = await fetch(`${API_BASE}/api/ai/step-details`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ step, language }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to generate learning material.');
    }
    return data.content as string;
  } catch (error) {
    console.error('Error in generateStepDetails:', error);
    throw new Error('Failed to generate learning material from AI service.');
  }
};

// Generate Certificate Commendation
export const generateCertificatePraise = async (
  profile: LearnerProfile,
  pathway: LearningPathwayData
): Promise<string> => {
  try {
    const res = await fetch(`${API_BASE}/api/ai/certificate-praise`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile, pathway }),
    });

    const data = await res.json();
    return (
      data.praise ||
      'Congratulations on your hard work and dedication. This achievement is a significant step towards a successful future.'
    );
  } catch (error) {
    console.error('Error in generateCertificatePraise:', error);
    return 'Congratulations on your hard work and dedication. This achievement is a significant step towards a successful future.';
  }
};

// Generate Live Job Opportunities using Google Search Grounding
export const generateJobOpportunities = async (
  profile: LearnerProfile,
  step: PathwayStep,
  pathway: LearningPathwayData
): Promise<JobSearchResponse> => {
  try {
    const res = await fetch(`${API_BASE}/api/ai/job-opportunities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile, step, pathway }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      return { jobs: [], sources: [] };
    }
    return {
      jobs: data.jobs || [],
      sources: data.sources || [],
    };
  } catch (error) {
    console.error('Error in generateJobOpportunities:', error);
    return { jobs: [], sources: [] };
  }
};

// Create Step Chat Session for Tutoring
export const createChatForStep = (step: PathwayStep, language: string): StepChatSession => {
  const messageHistory: ChatMessage[] = [];

  return {
    sendMessage: async ({ message }: { message: string }) => {
      const res = await fetch(`${API_BASE}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          step,
          language,
          history: messageHistory,
          message,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to receive tutor response.');
      }

      messageHistory.push({ role: 'user', text: message });
      messageHistory.push({ role: 'model', text: data.text });

      return { text: data.text };
    },
  };
};