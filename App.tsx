import React, { useState, useEffect } from 'react';
import { LearnerProfile, LearningPathwayData, PathwayStep, QuizQuestion, QuizResult, User } from './types';
import Header from './components/Header';
import LandingPage from './components/LandingPage';
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
import { getUserByUsername, updateUser } from './services/userService';

type View = 'landing' | 'login' | 'register' | 'form' | 'dashboard' | 'pathway' | 'step' | 'quiz' | 'certificate';

const SESSION_KEY = 'techspark_active_user';

const App: React.FC = () => {
  const [view, setView] = useState<View>('landing');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isRestoringSession, setIsRestoringSession] = useState<boolean>(true);

  const [learnerProfile, setLearnerProfile] = useState<LearnerProfile | null>(null);
  const [learningPath, setLearningPath] = useState<LearningPathwayData | null>(null);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedStep, setSelectedStep] = useState<PathwayStep | null>(null);

  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[] | null>(null);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState<boolean>(false);

  // Restore authenticated session from localStorage on mount
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const savedUsername = localStorage.getItem(SESSION_KEY);
        if (savedUsername) {
          const user = await getUserByUsername(savedUsername);
          if (user) {
            loadUserData(user);
            if (user.pathway) {
              setView('dashboard');
            } else {
              setView('form');
            }
          } else {
            localStorage.removeItem(SESSION_KEY);
            setView('landing');
          }
        } else {
          setView('landing');
        }
      } catch (err) {
        console.error('Failed to restore session:', err);
        setView('landing');
      } finally {
        setIsRestoringSession(false);
      }
    };

    restoreSession();
  }, []);

  // Sync user state back to MongoDB
  useEffect(() => {
    if (currentUser && !isRestoringSession) {
      const updatedUser: User = {
        ...currentUser,
        profile: learnerProfile,
        pathway: learningPath,
        completedSteps: completedSteps,
        quizResult: quizResult,
      };
      if (JSON.stringify(updatedUser) !== JSON.stringify(currentUser)) {
        setCurrentUser(updatedUser);
        updateUser(updatedUser);
      }
    }
  }, [learnerProfile, learningPath, completedSteps, quizResult, isRestoringSession]);

  const loadUserData = (user: User) => {
    setCurrentUser(user);
    setLearnerProfile(user.profile);
    setLearningPath(user.pathway);
    setCompletedSteps(user.completedSteps || []);
    setQuizResult(user.quizResult || null);
  };

  const handleLogin = async (user: User) => {
    localStorage.setItem(SESSION_KEY, user.username);
    loadUserData(user);
    if (user.pathway) {
      setView('dashboard');
    } else {
      setView('form');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(SESSION_KEY);
    setCurrentUser(null);
    setLearnerProfile(null);
    setLearningPath(null);
    setCompletedSteps([]);
    setQuizResult(null);
    setSelectedStep(null);
    setQuizQuestions(null);
    setError(null);
    setView('landing');
  };

  const handleToggleStepCompletion = (stepTitle: string) => {
    setCompletedSteps((prev) =>
      prev.includes(stepTitle) ? prev.filter((title) => title !== stepTitle) : [...prev, stepTitle]
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
        throw new Error('Failed to generate quiz questions.');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred while preparing the quiz. Please try again later.');
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  const handleSubmitQuiz = (score: number, totalQuestions: number) => {
    const passed = totalQuestions > 0 ? score / totalQuestions >= 0.6 : false;
    const result: QuizResult = {
      score,
      totalQuestions,
      passed,
      completionDate: new Date().toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
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
  };

  const renderContent = () => {
    if (isRestoringSession) {
      return (
        <div className="text-center p-20 animate-fade-in flex flex-col items-center justify-center min-h-[50vh]">
          <LoadingSpinner />
          <p className="text-[#5C6A44] mt-4 text-sm font-semibold">Loading LearnMate...</p>
        </div>
      );
    }

    if (isLoading || isGeneratingQuiz) {
      return (
        <div className="text-center p-12 animate-fade-in max-w-xl mx-auto my-12 bg-white rounded-3xl border border-[#EAE2D6] shadow-sm">
          <LoadingSpinner />
          <h2 className="text-2xl font-extrabold text-[#1B2615] mt-6">
            {isGeneratingQuiz ? 'Preparing Your Final Assessment...' : 'Crafting Your Personalized Pathway...'}
          </h2>
          <p className="text-[#5C6A44] text-xs sm:text-sm mt-2 leading-relaxed">
            {isGeneratingQuiz
              ? 'Our AI is compiling customized assessment questions aligned with your completed curriculum.'
              : 'Our AI is analyzing your background against vocational skilling frameworks to generate your tailored journey.'}
          </p>
        </div>
      );
    }

    if (error && !['login', 'register', 'landing'].includes(view)) {
      return (
        <div className="text-center p-10 bg-red-50 border border-red-200 rounded-3xl max-w-2xl mx-auto animate-fade-in my-8">
          <p className="text-red-700 font-bold">{error}</p>
          <button
            onClick={handleResetPathway}
            className="mt-4 px-6 py-2.5 bg-[#8B9A6E] hover:bg-[#758458] text-white font-bold text-xs rounded-xl shadow-sm transition"
          >
            Start Over
          </button>
        </div>
      );
    }

    switch (view) {
      case 'landing':
        return (
          <LandingPage
            onGetStarted={() => {
              if (currentUser) {
                setView(learningPath ? 'dashboard' : 'form');
              } else {
                setView('register');
              }
            }}
            onSignIn={() => setView('login')}
          />
        );
      case 'login':
        return <Login onLogin={handleLogin} onNavigateToRegister={() => setView('register')} />;
      case 'register':
        return <Register onRegisterSuccess={() => setView('login')} onNavigateToLogin={() => setView('login')} />;
      case 'form':
        return <LearnerProfileForm onSubmit={handleProfileSubmit} />;
      case 'dashboard':
        if (learnerProfile && learningPath) {
          return (
            <Dashboard
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
            />
          );
        }
        return <LearnerProfileForm onSubmit={handleProfileSubmit} />;
      case 'pathway':
        if (learnerProfile && learningPath) {
          return (
            <LearningPathway
              pathway={learningPath}
              profile={learnerProfile}
              onBack={handleBackToDashboard}
              onSelectStep={handleSelectStep}
              completedSteps={completedSteps}
              onToggleStepCompletion={handleToggleStepCompletion}
              onStartQuiz={handleStartQuiz}
              isGeneratingQuiz={isGeneratingQuiz}
            />
          );
        }
        return null;
      case 'step':
        if (selectedStep && learnerProfile && learningPath) {
          return (
            <StepDetailView
              step={selectedStep}
              profile={learnerProfile}
              pathway={learningPath}
              onBack={handleBackToDashboard}
              isCompleted={completedSteps.includes(selectedStep.title)}
              onToggleCompletion={() => handleToggleStepCompletion(selectedStep.title)}
            />
          );
        }
        return null;
      case 'quiz':
        if (quizQuestions) {
          return <QuizView questions={quizQuestions} onSubmitQuiz={handleSubmitQuiz} />;
        }
        return null;
      case 'certificate':
        if (currentUser && learnerProfile && learningPath && quizResult?.passed) {
          return (
            <Certificate
              user={currentUser}
              pathway={learningPath}
              result={quizResult}
              onBackToDashboard={handleBackToDashboard}
            />
          );
        }
        setView('dashboard');
        return null;
      default:
        return (
          <LandingPage
            onGetStarted={() => setView('register')}
            onSignIn={() => setView('login')}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F2EB] text-[#1B2615] flex flex-col font-sans selection:bg-[#8B9A6E] selection:text-white">
      <Header
        user={currentUser}
        onLogout={handleLogout}
        onNavigateHome={() => {
          if (currentUser) {
            setView(learningPath ? 'dashboard' : 'form');
          } else {
            setView('landing');
          }
        }}
        onNavigateLogin={() => setView('login')}
        onNavigateRegister={() => setView('register')}
        onNavigateDashboard={() => setView('dashboard')}
        currentView={view}
      />
      <main className={view === 'landing' ? 'w-full' : 'container mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1'}>
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
