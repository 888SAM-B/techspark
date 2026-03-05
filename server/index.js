import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

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

// =================== ROUTES ===================

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

    // Return user object (without password)
    const userObj = {
      username: user.username,
      password: '', // Don't send actual password to frontend
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
      { new: true, runValidators: true }
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
