import { GoogleGenAI, Type, Chat } from "@google/genai";
import { LearnerProfile, LearningPathwayData, PathwayStep, QuizQuestion, JobOpportunity, GroundingChunk, JobSearchResponse } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    pathwayTitle: { type: Type.STRING, description: "A catchy title for the entire learning path for the user." },
    summary: { type: Type.STRING, description: "A brief, encouraging summary of the generated pathway for the learner." },
    phases: {
      type: Type.ARRAY,
      description: "The learning path broken down into distinct phases.",
      items: {
        type: Type.OBJECT,
        properties: {
          phaseTitle: { type: Type.STRING, description: "Title of the phase, e.g., 'Phase 1: Foundational Skills'." },
          phaseDescription: { type: Type.STRING, description: "A short description of the goal of this phase." },
          steps: {
            type: Type.ARRAY,
            description: "A list of steps within this phase.",
            items: {
              type: Type.OBJECT,
              properties: {
                stepType: { type: Type.STRING, description: "Type of learning activity. Must be one of: 'Course', 'Micro-credential', 'Certification', 'On-the-Job Training', 'Project', 'Assessment'." },
                title: { type: Type.STRING, description: "Title of the course, certification, or activity." },
                description: { type: Type.STRING, description: "Brief description of what the step entails and its importance." },
                nsqfLevel: { type: Type.STRING, description: "Suggested NSQF Level for this step, e.g., 'Level 4'. Use 'N/A' if not applicable." },
                duration: { type: Type.STRING, description: "Estimated duration to complete the step, e.g., '4 weeks', '3 months'." }
              }
            }
          }
        }
      }
    }
  }
};

export const generateLearningPath = async (profile: LearnerProfile): Promise<LearningPathwayData> => {
  const systemInstruction = `You are an expert AI solutions architect for India's vocational skilling ecosystem. Your role is to generate a personalized, adaptive learning path based on a learner's profile.
    - All recommendations must be relevant to the Indian context and aligned with NSQF/NCVET frameworks.
    - The pathway must be structured, multi-phased, and actionable, progressing from foundational to practical skills.
    - The final phase of the pathway MUST be titled 'Soft Skills Development'. This phase should contain one or two steps focusing on essential soft skills (like 'Effective Communication', 'Problem-Solving', or 'Team Collaboration') crucial for the learner's aspired career.
    - Mention specific NSQF levels where appropriate.
    - Recommendations should reflect current labor market demands in India.
    - You must provide the output ONLY in the specified JSON format and ensure all fields in the schema are present.`;

  const prompt = `
    Generate a personalized vocational skilling pathway for the following learner:
    - Name: ${profile.name}
    - Location (State): ${profile.location}
    - Education: ${profile.education}
    - Prior Skills: ${profile.skills}
    - Career Aspiration: ${profile.aspiration}
    - Preferred Language for Learning: ${profile.language}
    
    The pathway should be detailed, actionable, and broken down into logical phases (e.g., Foundation, Specialization, Practical Application), ending with a Soft Skills Development phase. For each step, provide a type, title, description, suggested NSQF level, and estimated duration.
  `;
  
  let rawResponseText = '';
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.7,
      },
    });

    rawResponseText = response.text;
    if (!rawResponseText) {
      throw new Error("Received an empty response from the AI service.");
    }
    
    const cleanedText = rawResponseText.trim().replace(/^`{3}(json)?|`{3}$/g, '').trim();
    
    return JSON.parse(cleanedText) as LearningPathwayData;

  } catch (error) {
    console.error("Error generating content from Gemini API:", error);
    if (error instanceof SyntaxError) {
      console.error("Failed to parse JSON. Raw response was:", rawResponseText);
    }
    throw new Error("Failed to generate learning path from AI service.");
  }
};

export const generateQuiz = async (profile: LearnerProfile, pathway: LearningPathwayData): Promise<QuizQuestion[]> => {
    const quizSchema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                question: { type: Type.STRING, description: "The multiple-choice question." },
                options: {
                    type: Type.ARRAY,
                    description: "An array of exactly 4 potential answers.",
                    items: { type: Type.STRING }
                },
                correctAnswer: { type: Type.STRING, description: "The correct answer, which must be one of the strings from the 'options' array." }
            },
            required: ['question', 'options', 'correctAnswer']
        }
    };

    const systemInstruction = `You are an expert assessment creator for vocational skilling programs in India. Your task is to generate a multiple-choice quiz based on a provided learning path and a specified language.
    - The entire quiz (all questions, all options, and the correct answer text) MUST be in the target language: ${profile.language}.
    - Create exactly 50 multiple-choice questions.
    - Each question must have exactly 4 options.
    - The questions should cover the entire scope of the learning path, from foundational concepts to advanced topics mentioned in the pathway steps.
    - Ensure the 'correctAnswer' value is an exact match to one of the values in the 'options' array.
    - The difficulty should be appropriate for a final assessment for a learner who has just completed the path.
    - You must provide the output ONLY in the specified JSON format.`;

    const allStepTitles = pathway.phases.flatMap(phase => phase.steps.map(step => step.title)).join(', ');

    const prompt = `
    Generate a 50-question multiple-choice quiz for a learner who has completed the following learning pathway. The entire quiz must be in ${profile.language}.
    - Learner Aspiration: ${profile.aspiration}
    - Pathway Title: ${pathway.pathwayTitle}
    - Pathway Summary: ${pathway.summary}
    - Topics Covered (from pathway steps): ${allStepTitles}
    - Target Language for Quiz: ${profile.language}

    The quiz should test the learner's knowledge and understanding of the key concepts from this pathway.
  `;

    let rawResponseText = '';
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        quiz: quizSchema
                    },
                    required: ['quiz']
                },
                temperature: 0.8,
            },
        });

        rawResponseText = response.text;
        if (!rawResponseText) {
            throw new Error("Received an empty response from the AI service for quiz generation.");
        }

        const cleanedText = rawResponseText.trim().replace(/^`{3}(json)?|`{3}$/g, '').trim();
        const parsedJson = JSON.parse(cleanedText);
        
        if (!parsedJson.quiz || !Array.isArray(parsedJson.quiz)) {
            console.error("Parsed JSON does not contain a 'quiz' array:", parsedJson);
            throw new Error("Invalid quiz format received from AI.");
        }
        
        return parsedJson.quiz.slice(0, 50) as QuizQuestion[];

    } catch (error) {
        console.error("Error generating quiz from Gemini API:", error);
        if (error instanceof SyntaxError) {
            console.error("Failed to parse JSON. Raw response was:", rawResponseText);
        }
        throw new Error("Failed to generate quiz from AI service.");
    }
};

export const generateStepDetails = async (step: PathwayStep, language: string): Promise<string> => {
  const systemInstruction = `You are an expert educator and content creator. Your task is to provide a comprehensive, beginner-friendly, A-to-Z learning guide on a specific vocational topic. The guide should be structured logically, easy to understand, and written in the specified language. Use clear headings, bullet points, and simple language. Avoid any conversational preamble or sign-off, just provide the content.`;

  const prompt = `
    Topic Title: "${step.title}"
    Topic Description: "${step.description}"
    Target Language: ${language}

    Generate a detailed, A-to-Z learning guide for the topic above. The guide should cover:
    1.  **Introduction**: What is this topic and why is it important?
    2.  **Core Concepts**: Explain the fundamental principles and key terminology in simple terms.
    3.  **Step-by-Step Guide/Tutorial**: Provide a practical, hands-on guide for a beginner to get started. If applicable, include code snippets or practical examples.
    4.  **Tools and Resources**: List essential tools (if any) and recommend free online resources for further learning (like tutorials, articles, or documentation).
    5.  **Next Steps**: What should a learner do after mastering this topic to continue their growth?

    The entire response must be in ${language}. Structure the output for maximum readability using markdown-like formatting (e.g., use ## for headings, * for bullet points).
  `;
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.5,
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("Received an empty response from the AI service for step details.");
    }
    return text;

  } catch (error) {
    console.error("Error generating step details from Gemini API:", error);
    throw new Error("Failed to generate learning material from AI service.");
  }
};


export const generateCertificatePraise = async (profile: LearnerProfile, pathway: LearningPathwayData): Promise<string> => {
  const systemInstruction = `You are an encouraging and professional academic advisor. Your task is to write a short, personalized, one-paragraph statement of commendation for a certificate of completion. The tone should be inspiring and acknowledge the learner's dedication. Do not use markdown or special formatting. Just provide a single paragraph of text.`;

  const prompt = `
    Write a personalized commendation for a certificate.
    - Learner's Name: ${profile.name}
    - Career Aspiration: ${profile.aspiration}
    - Completed Pathway Title: ${pathway.pathwayTitle}
    
    The message should celebrate their achievement in completing this specific pathway and connect it to their future career goals. It should be written in ${profile.language}.
  `;
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.8,
      },
    });

    const text = response.text;
    if (!text) {
      return "Congratulations on your hard work and dedication. This achievement is a significant step towards a successful future.";
    }
    return text;

  } catch (error) {
    console.error("Error generating certificate praise:", error);
    // Return a generic but positive message in case of an error.
    return "Congratulations on your hard work and dedication. This achievement is a significant step towards a successful future.";
  }
};

export const generateJobOpportunities = async (profile: LearnerProfile, step: PathwayStep, pathway: LearningPathwayData): Promise<JobSearchResponse> => {
    const systemInstruction = `You are a highly-efficient career search assistant for the Indian vocational skilling sector. Your task is to find real, recent, entry-level job postings from the web that match the learner's profile and completed training.
    - Use Google Search to find LIVE job postings in India.
    - Strongly prioritize jobs explicitly labeled as 'entry-level', 'fresher', or for candidates with 0-1 years of experience.
    - Focus on roles that are realistic for someone with the learner's background after completing this specific step.
    - Prioritize job listings from reputable job portals like LinkedIn, Naukri.com or company career pages.
    - Extract the required information accurately: jobTitle, companyName, a brief jobDescription, key requiredSkills, the direct url to the job posting, and the minimum required qualifications (e.g., '12th Pass', 'ITI Diploma').
    - Provide a concise list of 3-5 job roles.
    - Your entire response MUST be a single JSON object that strictly follows this structure: { "jobs": [...] }. Do not add any conversational text, markdown, or any characters outside of this JSON structure.`;

    const prompt = `
    Find real, recent job opportunities available in ${profile.location}, India, for a person with the following profile who has just completed a specific learning module.

    **Learner Profile:**
    - Career Aspiration: ${profile.aspiration}
    - Location: ${profile.location}, India
    - Existing Skills: ${profile.skills}
    - Education: ${profile.education}

    **Overall Learning Pathway:**
    - Title: ${pathway.pathwayTitle}

    **Just Completed Learning Step:**
    - Title: "${step.title}"
    - Skills gained from description: "${step.description}"

    Search for 3 to 5 actual, currently available job roles a person could apply for. Crucially, focus on 'entry-level' or 'fresher' positions. For each job, extract the key details, including the minimum educational qualifications required. Provide the direct URL for each job posting. Format the response as a single JSON object.
  `;

    let rawResponseText = '';
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                systemInstruction: systemInstruction,
                tools: [{ googleSearch: {} }],
                temperature: 0.2,
            },
        });

        rawResponseText = response.text;
        const groundingChunks = (response.candidates?.[0]?.groundingMetadata?.groundingChunks as GroundingChunk[]) || [];

        if (!rawResponseText) {
            return { jobs: [], sources: groundingChunks };
        }
        
        let cleanedText = rawResponseText.trim();
        const jsonMatch = cleanedText.match(/```(json)?\s*([\s\S]*?)\s*```/);

        if (jsonMatch && jsonMatch[2]) {
            cleanedText = jsonMatch[2];
        } else {
            const firstBrace = cleanedText.indexOf('{');
            const lastBrace = cleanedText.lastIndexOf('}');
            if (firstBrace !== -1 && lastBrace > firstBrace) {
                cleanedText = cleanedText.substring(firstBrace, lastBrace + 1);
            }
        }
        
        let parsedJson;
        try {
            parsedJson = JSON.parse(cleanedText);
        } catch (parseError) {
            console.error("Failed to parse JSON even after cleaning. Raw response was:", rawResponseText);
            return { jobs: [], sources: groundingChunks };
        }
        
        if (!parsedJson.jobs || !Array.isArray(parsedJson.jobs)) {
            console.error("Parsed JSON does not contain a 'jobs' array:", parsedJson);
            return { jobs: [], sources: groundingChunks };
        }
        
        return {
            jobs: parsedJson.jobs as JobOpportunity[],
            sources: groundingChunks
        };

    } catch (error) {
        console.error("Error generating job opportunities from Gemini API:", error);
        return { jobs: [], sources: [] };
    }
};

export const createChatForStep = (step: PathwayStep, language: string): Chat => {
  const systemInstruction = `You are an expert AI tutor for vocational skilling in India.
    - Your role is to help a learner understand the topic: "${step.title}".
    - Your knowledge is strictly limited to the following description: "${step.description}". Do not provide information beyond this scope.
    - If a user asks a question unrelated to this topic, politely decline and guide them back to the topic.
    - All your responses must be in the ${language} language.
    - Keep your answers helpful, encouraging, and easy for a beginner to understand.
    - Do not start your response with "As an AI tutor..." or any similar preamble. Just answer the question directly.`;

  const chat = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: systemInstruction,
      temperature: 0.5,
    },
  });
  return chat;
};