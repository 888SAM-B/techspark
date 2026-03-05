import React, { useState, useEffect } from 'react';
import { LearnerProfile, LearningPathwayData, PathwayStep, QuizQuestion, QuizResult, User } from './types';
import Header from './components/Header';
import LearnerProfileForm from './components/LearnerProfileForm';
import LearningPathway from './components/LearningPathway';
import StepDetailView from './components/StepDetailView';
import { generateLearningPath, generateQuiz } from './services/geminiService';
import LoadingSpinner from './components/LoadingSpinner';
import QuizView from './components/QuizView';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import Register from './components/Register';
import Certificate from './components/Certificate';
import { getUserByUsername, updateUser, registerUser as registerUserService } from './services/userService';

type View = 'login' | 'register' | 'form' | 'dashboard' | 'pathway' | 'step' | 'quiz' | 'certificate';

const App: React.FC = () => {
  const [view, setView] = useState<View>('login');
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const [learnerProfile, setLearnerProfile] = useState<LearnerProfile | null>(null);
  const [learningPath, setLearningPath] = useState<LearningPathwayData | null>(null);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedStep, setSelectedStep] = useState<PathwayStep | null>(null);

  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[] | null>(null);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState<boolean>(false);

  // Effect to sync state changes back to MongoDB
  useEffect(() => {
    if (currentUser) {
      const updatedUser: User = {
        ...currentUser,
        profile: learnerProfile,
        pathway: learningPath,
        completedSteps: completedSteps,
        quizResult: quizResult,
      };
      // Avoid re-setting the same user object if nothing has changed.
      if (JSON.stringify(updatedUser) !== JSON.stringify(currentUser)) {
        setCurrentUser(updatedUser);
        updateUser(updatedUser); // async, fire-and-forget is fine here
      }
    }
  }, [learnerProfile, learningPath, completedSteps, quizResult]);

  const loadUserData = (user: User) => {
    setCurrentUser(user);
    setLearnerProfile(user.profile);
    setLearningPath(user.pathway);
    setCompletedSteps(user.completedSteps);
    setQuizResult(user.quizResult);
  };

  const handleLogin = async (user: User) => {
    loadUserData(user);
    if (user.pathway) {
      setView('dashboard');
    } else {
      setView('form');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setLearnerProfile(null);
    setLearningPath(null);
    setCompletedSteps([]);
    setQuizResult(null);
    setSelectedStep(null);
    setQuizQuestions(null);
    setError(null);
    setView('login');
  };

  const handleToggleStepCompletion = (stepTitle: string) => {
    setCompletedSteps(prev =>
      prev.includes(stepTitle)
        ? prev.filter(title => title !== stepTitle)
        : [...prev, stepTitle]
    );
  };

  const handleProfileSubmit = async (profile: LearnerProfile) => {
    setLearnerProfile(profile);
    setIsLoading(true);
    setError(null);
    setLearningPath(null);
    setCompletedSteps([]);
    setQuizResult(null);

    try {
      const path = await generateLearningPath(profile);
      setLearningPath(path);
      setView('dashboard');
    } catch (err) {
      console.error(err);
      setError('An error occurred while generating the learning path. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPathway = () => {
    setLearningPath(null);
    setError(null);
    setIsLoading(false);
    setSelectedStep(null);
    setCompletedSteps([]);
    setQuizQuestions(null);
    setQuizResult(null);
    setIsGeneratingQuiz(false);
    setView('form');
  };

  const handleSelectStep = (step: PathwayStep) => {
    setSelectedStep(step);
    setView('step');
  };

  const handleBackToDashboard = () => {
    setSelectedStep(null);
    setView('dashboard');
  };

  const handleStartQuiz = async () => {
    if (!learnerProfile || !learningPath) return;

    setIsGeneratingQuiz(true);
    setError(null);

    try {
      const questions = await generateQuiz(learnerProfile, learningPath);
      if (questions && questions.length > 0) {
        setQuizQuestions(questions);
        setView('quiz');
      } else {
        throw new Error("Failed to generate quiz questions.");
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred while preparing the quiz. Please try again later.');
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  const handleSubmitQuiz = (score: number, totalQuestions: number) => {
    const passed = score >= 30;
    const result: QuizResult = {
      score,
      totalQuestions,
      passed,
      completionDate: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }),
    };
    setQuizResult(result);
    setQuizQuestions(null);

    if (passed) {
      setView('certificate');
    } else {
      setView('dashboard');
    }
  };

  const handleViewCertificate = () => {
    setView('certificate');
  }

  const renderContent = () => {
    if (isLoading || isGeneratingQuiz) {
      return (
        <div className="text-center p-10">
          <LoadingSpinner />
          <h2 className="text-2xl font-semibold text-gray-700 mt-6">
            {isGeneratingQuiz ? 'Preparing Your Final Assessment...' : 'Crafting Your Personalized Pathway...'}
          </h2>
          <p className="text-gray-500 mt-2 max-w-xl mx-auto">
            {isGeneratingQuiz ? 'This may take a moment. The AI is generating 50 unique questions based on your learning path.' : 'Our AI is analyzing your profile against millions of data points to create the perfect skilling journey for you.'}
          </p>
        </div>
      );
    }

    if (error && !['login', 'register'].includes(view)) {
      return (
        <div className="text-center p-10 bg-red-50 border border-red-200 rounded-lg max-w-2xl mx-auto">
          <p className="text-red-600 font-semibold">{error}</p>
          <button
            onClick={handleResetPathway}
            className="mt-4 px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            Start Over
          </button>
        </div>
      );
    }

    switch (view) {
      case 'login':
        return <Login onLogin={handleLogin} onNavigateToRegister={() => setView('register')} />;
      case 'register':
        return <Register onRegisterSuccess={() => setView('login')} onNavigateToLogin={() => setView('login')} />;
      case 'form':
        return <LearnerProfileForm onSubmit={handleProfileSubmit} />;
      case 'dashboard':
        if (learnerProfile && learningPath) {
          return <Dashboard
            profile={learnerProfile}
            pathway={learningPath}
            completedSteps={completedSteps}
            quizResult={quizResult}
            onViewPathway={() => setView('pathway')}
            onContinueLearning={handleSelectStep}
            onStartQuiz={handleStartQuiz}
            onReset={handleResetPathway}
            isGeneratingQuiz={isGeneratingQuiz}
            onViewCertificate={handleViewCertificate}
          />;
        }
        // If user is logged in but has no path, send to form
        return <LearnerProfileForm onSubmit={handleProfileSubmit} />;
      case 'pathway':
        if (learnerProfile && learningPath) {
          return <LearningPathway
            pathway={learningPath}
            profile={learnerProfile}
            onBack={handleBackToDashboard}
            onSelectStep={handleSelectStep}
            completedSteps={completedSteps}
            onToggleStepCompletion={handleToggleStepCompletion}
            onStartQuiz={handleStartQuiz}
            isGeneratingQuiz={isGeneratingQuiz}
          />;
        }
        return null;
      case 'step':
        if (selectedStep && learnerProfile && learningPath) {
          return <StepDetailView
            step={selectedStep}
            profile={learnerProfile}
            pathway={learningPath}
            onBack={handleBackToDashboard}
            isCompleted={completedSteps.includes(selectedStep.title)}
            onToggleCompletion={() => handleToggleStepCompletion(selectedStep.title)}
          />;
        }
        return null;
      case 'quiz':
        if (quizQuestions) {
          return <QuizView questions={quizQuestions} onSubmitQuiz={handleSubmitQuiz} />;
        }
        return null;
      case 'certificate':
        if (currentUser && learnerProfile && learningPath && quizResult?.passed) {
          return <Certificate
            user={currentUser}
            pathway={learningPath}
            result={quizResult}
            onBackToDashboard={handleBackToDashboard}
          />;
        }
        // Fallback to dashboard if certificate data is missing
        setView('dashboard');
        return null;
      default:
        return <Login onLogin={handleLogin} onNavigateToRegister={() => setView('register')} />;
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <Header user={currentUser} onLogout={handleLogout} />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
