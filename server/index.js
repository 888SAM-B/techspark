import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from root folder
config({ path: path.join(__dirname, '..', '.env') });

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ai_skilling';

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Large limit for pathway data

// =================== GEMINI AI CLIENT ===================

// Model fallback chain: primary → alternatives if 503/429/404
const GEMINI_MODEL_PRIMARY = process.env.GEMINI_MODEL || 'gemini-3.6-flash';
const GEMINI_MODEL_FALLBACKS = ['gemini-2.0-flash', 'gemini-1.5-flash'];

let aiInstance = null;

const getAIClient = () => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    throw new Error('Gemini API key is not configured on the server. Please add GEMINI_API_KEY to your .env file.');
  }
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
};

/**
 * Resilient AI call with retry + model fallback.
 * Retries up to maxRetries times with exponential backoff.
 * On 503 / 429 / 404, automatically tries fallback models.
 */
const resilientGenerate = async (callOptions, maxRetries = 3) => {
  const ai = getAIClient();
  const modelsToTry = [GEMINI_MODEL_PRIMARY, ...GEMINI_MODEL_FALLBACKS];

  for (let modelIdx = 0; modelIdx < modelsToTry.length; modelIdx++) {
    const model = modelsToTry[modelIdx];
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const response = await ai.models.generateContent({
          ...callOptions,
          model,
        });
        if (modelIdx > 0 || attempt > 0) {
          console.log(`✅ Succeeded with model: ${model} (attempt ${attempt + 1})`);
        }
        return response;
      } catch (err) {
        const status = err?.status || err?.error?.code;
        const isRetryable = [503, 429].includes(Number(status));
        const isModelGone = [404].includes(Number(status));
        const isLastAttempt = attempt === maxRetries - 1;
        const isLastModel = modelIdx === modelsToTry.length - 1;

        console.warn(`⚠️  Model "${model}" attempt ${attempt + 1} failed (status: ${status}).`);

        if (isModelGone) {
          // This model is unavailable — skip to next model immediately
          console.warn(`   Model "${model}" is gone. Trying next fallback...`);
          break;
        }

        if (isRetryable && !isLastAttempt) {
          const delay = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s
          console.log(`   Retrying in ${delay}ms...`);
          await new Promise((r) => setTimeout(r, delay));
          continue;
        }

        if (isRetryable && isLastAttempt && !isLastModel) {
          // Exhausted retries on this model — try next model
          console.warn(`   Exhausted retries for "${model}". Trying next fallback...`);
          break;
        }

        // Non-retryable or last model — throw
        throw err;
      }
    }
  }
  throw new Error('All Gemini models are currently unavailable. Please try again in a moment.');
};

const pathwayResponseSchema = {
  type: Type.OBJECT,
  properties: {
    pathwayTitle: { type: Type.STRING, description: 'A catchy title for the entire learning path for the user.' },
    summary: { type: Type.STRING, description: 'A brief, encouraging summary of the generated pathway for the learner.' },
    phases: {
      type: Type.ARRAY,
      description: 'The learning path broken down into distinct phases.',
      items: {
        type: Type.OBJECT,
        properties: {
          phaseTitle: { type: Type.STRING, description: "Title of the phase, e.g., 'Phase 1: Foundational Skills'." },
          phaseDescription: { type: Type.STRING, description: 'A short description of the goal of this phase.' },
          steps: {
            type: Type.ARRAY,
            description: 'A list of steps within this phase.',
            items: {
              type: Type.OBJECT,
              properties: {
                stepType: {
                  type: Type.STRING,
                  description:
                    "Type of learning activity. Must be one of: 'Course', 'Micro-credential', 'Certification', 'On-the-Job Training', 'Project', 'Assessment'.",
                },
                title: { type: Type.STRING, description: 'Title of the course, certification, or activity.' },
                description: { type: Type.STRING, description: 'Brief description of what the step entails and its importance.' },
                nsqfLevel: { type: Type.STRING, description: "Suggested NSQF Level for this step, e.g., 'Level 4'. Use 'N/A' if not applicable." },
                duration: { type: Type.STRING, description: "Estimated duration to complete the step, e.g., '4 weeks', '3 months'." },
              },
            },
          },
        },
      },
    },
  },
};

const quizSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      question: { type: Type.STRING, description: 'The multiple-choice question.' },
      options: {
        type: Type.ARRAY,
        description: 'An array of exactly 4 potential answers.',
        items: { type: Type.STRING },
      },
      correctAnswer: { type: Type.STRING, description: "The correct answer, which must be one of the strings from the 'options' array." },
    },
    required: ['question', 'options', 'correctAnswer'],
  },
};

// =================== MONGOOSE SCHEMA ===================

const PathwayStepSchema = new mongoose.Schema({
  stepType: String,
  title: String,
  description: String,
  nsqfLevel: String,
  duration: String,
});

const PathwayPhaseSchema = new mongoose.Schema({
  phaseTitle: String,
  phaseDescription: String,
  steps: [PathwayStepSchema],
});

const LearningPathwaySchema = new mongoose.Schema({
  pathwayTitle: String,
  summary: String,
  phases: [PathwayPhaseSchema],
});

const LearnerProfileSchema = new mongoose.Schema({
  name: String,
  location: String,
  education: String,
  skills: String,
  aspiration: String,
  language: String,
});

const QuizResultSchema = new mongoose.Schema({
  score: Number,
  totalQuestions: Number,
  passed: Boolean,
  completionDate: String,
});

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    profile: { type: LearnerProfileSchema, default: null },
    pathway: { type: LearningPathwaySchema, default: null },
    completedSteps: { type: [String], default: [] },
    quizResult: { type: QuizResultSchema, default: null },
  },
  { timestamps: true }
);

const UserModel = mongoose.model('User', UserSchema);

// =================== AUTH & USER ROUTES ===================

// Register
app.post('/api/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username and password are required.' });
    }

    const existing = await UserModel.findOne({ username: username.toLowerCase() });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Username is already taken.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new UserModel({
      username: username.toLowerCase(),
      password: hashedPassword,
      profile: null,
      pathway: null,
      completedSteps: [],
      quizResult: null,
    });

    await newUser.save();
    return res.status(201).json({ success: true, message: 'Registration successful! Please log in.' });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ success: false, message: 'Server error during registration.' });
  }
});

// Login
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username and password are required.' });
    }

    const user = await UserModel.findOne({ username: username.toLowerCase() });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid username or password.' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ success: false, message: 'Invalid username or password.' });
    }

    const userObj = {
      username: user.username,
      password: '',
      profile: user.profile || null,
      pathway: user.pathway || null,
      completedSteps: user.completedSteps || [],
      quizResult: user.quizResult || null,
    };

    return res.status(200).json({ success: true, message: 'Login successful!', user: userObj });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, message: 'Server error during login.' });
  }
});

// Get user by username
app.get('/api/user/:username', async (req, res) => {
  try {
    const user = await UserModel.findOne({ username: req.params.username.toLowerCase() });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    const userObj = {
      username: user.username,
      password: '',
      profile: user.profile || null,
      pathway: user.pathway || null,
      completedSteps: user.completedSteps || [],
      quizResult: user.quizResult || null,
    };
    return res.status(200).json({ success: true, user: userObj });
  } catch (err) {
    console.error('Get user error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// Update user (profile, pathway, completedSteps, quizResult)
app.put('/api/user/:username', async (req, res) => {
  try {
    const { profile, pathway, completedSteps, quizResult } = req.body;
    const username = req.params.username.toLowerCase();

    const updatedUser = await UserModel.findOneAndUpdate(
      { username },
      { $set: { profile, pathway, completedSteps, quizResult } },
      { returnDocument: 'after', runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    return res.status(200).json({ success: true, message: 'User updated successfully.' });
  } catch (err) {
    console.error('Update user error:', err);
    return res.status(500).json({ success: false, message: 'Server error during update.' });
  }
});

// =================== AI ENDPOINTS (BACKEND PROXY) ===================

// Generate Learning Pathway
app.post('/api/ai/generate-path', async (req, res) => {
  try {
    const { profile } = req.body;
    if (!profile || !profile.name || !profile.aspiration) {
      return res.status(400).json({ success: false, message: 'Valid learner profile is required.' });
    }


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

    const response = await resilientGenerate({
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: pathwayResponseSchema,
        temperature: 0.7,
      },
    });

    const rawResponseText = response.text;
    if (!rawResponseText) {
      throw new Error('Received an empty response from Gemini.');
    }
    const cleanedText = rawResponseText.trim().replace(/^`{3}(json)?|`{3}$/g, '').trim();
    const pathwayData = JSON.parse(cleanedText);

    return res.status(200).json({ success: true, pathway: pathwayData });
  } catch (err) {
    console.error('generate-path error:', err);
    return res.status(500).json({ success: false, message: err.message || 'Failed to generate learning path.' });
  }
});

// Generate Step Details
app.post('/api/ai/step-details', async (req, res) => {
  try {
    const { step, language } = req.body;
    if (!step || !step.title) {
      return res.status(400).json({ success: false, message: 'Step information is required.' });
    }

    const targetLang = language || 'English';
    const systemInstruction = `You are an expert educator and content creator. Your task is to provide a comprehensive, beginner-friendly, A-to-Z learning guide on a specific vocational topic. The guide should be structured logically, easy to understand, and written in the specified language. Use clear headings, bullet points, and simple language. Avoid any conversational preamble or sign-off, just provide the content.`;

    const prompt = `
      Topic Title: "${step.title}"
      Topic Description: "${step.description}"
      Target Language: ${targetLang}

      Generate a detailed, A-to-Z learning guide for the topic above. The guide should cover:
      1.  **Introduction**: What is this topic and why is it important?
      2.  **Core Concepts**: Explain the fundamental principles and key terminology in simple terms.
      3.  **Step-by-Step Guide/Tutorial**: Provide a practical, hands-on guide for a beginner to get started. If applicable, include code snippets or practical examples.
      4.  **Tools and Resources**: List essential tools (if any) and recommend free online resources for further learning (like tutorials, articles, or documentation).
      5.  **Next Steps**: What should a learner do after mastering this topic to continue their growth?

      The entire response must be in ${targetLang}. Structure the output for maximum readability using markdown-like formatting (e.g., use ## for headings, * for bullet points).
    `;

    const response = await resilientGenerate({
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.5,
      },
    });

    return res.status(200).json({ success: true, content: response.text });
  } catch (err) {
    console.error('step-details error:', err);
    return res.status(500).json({ success: false, message: err.message || 'Failed to generate step details.' });
  }
});

// Step Tutor Chat
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { step, language, history, message } = req.body;
    if (!step || !message) {
      return res.status(400).json({ success: false, message: 'Step and user message are required.' });
    }

    const targetLang = language || 'English';
    const systemInstruction = `You are an expert AI tutor for vocational skilling in India.
    - Your role is to help a learner understand the topic: "${step.title}".
    - Your knowledge is strictly limited to the following description: "${step.description}". Do not provide information beyond this scope.
    - If a user asks a question unrelated to this topic, politely decline and guide them back to the topic.
    - All your responses must be in the ${targetLang} language.
    - Keep your answers helpful, encouraging, and easy for a beginner to understand.
    - Do not start your response with "As an AI tutor..." or any similar preamble. Just answer the question directly.`;

    const contents = [
      ...(history || []).map((h) => ({
        role: h.role === 'model' ? 'model' : 'user',
        parts: [{ text: h.text }],
      })),
      {
        role: 'user',
        parts: [{ text: message }],
      },
    ];

    const response = await resilientGenerate({
      contents,
      config: {
        systemInstruction,
        temperature: 0.5,
      },
    });

    return res.status(200).json({ success: true, text: response.text });
  } catch (err) {
    console.error('chat error:', err);
    return res.status(500).json({ success: false, message: err.message || 'Failed to get chat response.' });
  }
});

// Live Job Opportunities (with Google Search Grounding)
app.post('/api/ai/job-opportunities', async (req, res) => {
  try {
    const { profile, step, pathway } = req.body;
    if (!profile || !step) {
      return res.status(400).json({ success: false, message: 'Profile and step details are required.' });
    }

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
      - Title: ${pathway?.pathwayTitle || profile.aspiration}

      **Just Completed Learning Step:**
      - Title: "${step.title}"
      - Skills gained from description: "${step.description}"

      Search for 3 to 5 actual, currently available job roles a person could apply for. Crucially, focus on 'entry-level' or 'fresher' positions. For each job, extract the key details, including the minimum educational qualifications required. Provide the direct URL for each job posting. Format the response as a single JSON object.
    `;

    const response = await resilientGenerate({
      contents: prompt,
      config: {
        systemInstruction,
        tools: [{ googleSearch: {} }],
        temperature: 0.2,
      },
    });

    const rawResponseText = response.text || '';
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    if (!rawResponseText) {
      return res.status(200).json({ success: true, jobs: [], sources: groundingChunks });
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

    let parsedJson = { jobs: [] };
    try {
      parsedJson = JSON.parse(cleanedText);
    } catch {
      console.warn('Failed to parse jobs JSON, returning empty list');
    }

    return res.status(200).json({
      success: true,
      jobs: Array.isArray(parsedJson.jobs) ? parsedJson.jobs : [],
      sources: groundingChunks,
    });
  } catch (err) {
    console.error('job-opportunities error:', err);
    return res.status(500).json({ success: false, message: err.message || 'Failed to fetch job opportunities.' });
  }
});

// Generate Assessment Quiz
app.post('/api/ai/generate-quiz', async (req, res) => {
  try {
    const { profile, pathway, questionCount = 15 } = req.body;
    if (!profile || !pathway) {
      return res.status(400).json({ success: false, message: 'Profile and pathway are required.' });
    }

    const targetLang = profile.language || 'English';
    const allStepTitles = (pathway.phases || []).flatMap((phase) => phase.steps.map((step) => step.title)).join(', ');

    const systemInstruction = `You are an expert assessment creator for vocational skilling programs in India. Your task is to generate a multiple-choice quiz based on a provided learning path and a specified language.
    - The entire quiz (all questions, all options, and the correct answer text) MUST be in the target language: ${targetLang}.
    - Create exactly ${questionCount} multiple-choice questions.
    - Each question must have exactly 4 options.
    - The questions should cover the key concepts from foundational to advanced topics in the pathway.
    - Ensure the 'correctAnswer' value is an exact match to one of the values in the 'options' array.
    - The difficulty should be appropriate for a final assessment for a learner who has just completed the path.
    - You must provide the output ONLY in the specified JSON format.`;

    const prompt = `
      Generate a ${questionCount}-question multiple-choice quiz for a learner who has completed the following learning pathway. The entire quiz must be in ${targetLang}.
      - Learner Aspiration: ${profile.aspiration}
      - Pathway Title: ${pathway.pathwayTitle}
      - Pathway Summary: ${pathway.summary}
      - Topics Covered: ${allStepTitles}
      - Target Language for Quiz: ${targetLang}

      The quiz should test the learner's knowledge and understanding of the key concepts from this pathway.
    `;

    const response = await resilientGenerate({
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            quiz: quizSchema,
          },
          required: ['quiz'],
        },
        temperature: 0.7,
      },
    });

    const rawResponseText = response.text;
    if (!rawResponseText) {
      throw new Error('Received an empty response from Gemini for quiz generation.');
    }

    const cleanedText = rawResponseText.trim().replace(/^`{3}(json)?|`{3}$/g, '').trim();
    const parsedJson = JSON.parse(cleanedText);

    if (!parsedJson.quiz || !Array.isArray(parsedJson.quiz)) {
      throw new Error('Invalid quiz format received from AI.');
    }

    return res.status(200).json({ success: true, quiz: parsedJson.quiz });
  } catch (err) {
    console.error('generate-quiz error:', err);
    return res.status(500).json({ success: false, message: err.message || 'Failed to generate quiz.' });
  }
});

// Certificate Praise Commendation
app.post('/api/ai/certificate-praise', async (req, res) => {
  try {
    const { profile, pathway } = req.body;
    if (!profile || !pathway) {
      return res.status(200).json({
        success: true,
        praise: 'Congratulations on your hard work and dedication. This achievement is a significant step towards a successful future.',
      });
    }

    const targetLang = profile.language || 'English';
    const systemInstruction = `You are an encouraging and professional academic advisor. Your task is to write a short, personalized, one-paragraph statement of commendation for a certificate of completion. The tone should be inspiring and acknowledge the learner's dedication. Do not use markdown or special formatting. Just provide a single paragraph of text.`;

    const prompt = `
      Write a personalized commendation for a certificate.
      - Learner's Name: ${profile.name}
      - Career Aspiration: ${profile.aspiration}
      - Completed Pathway Title: ${pathway.pathwayTitle}
      
      The message should celebrate their achievement in completing this specific pathway and connect it to their future career goals. It should be written in ${targetLang}.
    `;

    const response = await resilientGenerate({
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.8,
      },
    });

    const text = response.text || 'Congratulations on your hard work and dedication. This achievement is a significant step towards a successful future.';
    return res.status(200).json({ success: true, praise: text });
  } catch (err) {
    console.error('certificate-praise error:', err);
    return res.status(200).json({
      success: true,
      praise: 'Congratulations on your hard work and dedication. This achievement is a significant step towards a successful future.',
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'AI Skilling Backend is running!' });
});

// =================== START SERVER ===================

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB:', MONGO_URI);
    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });
