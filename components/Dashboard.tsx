import React from 'react';
import { LearnerProfile, LearningPathwayData, PathwayStep, QuizResult } from '../types';
import { AssessmentIcon, CertificationIcon, CheckIcon, ContinueLearningIcon, CourseIcon, OJTIcon, ProjectIcon } from './icons/StepIcons';

// This new component determines which icon to show based on the step type.
const CompletedStepIcon: React.FC<{ type: PathwayStep['stepType'] }> = ({ type }) => {
    const iconClass = "w-5 h-5 text-green-600 flex-shrink-0";
    switch (type) {
        case 'Course':
        case 'Micro-credential':
            return <CourseIcon className={iconClass} />;
        case 'Certification':
            return <CertificationIcon className={iconClass} />;
        case 'Project':
            return <ProjectIcon className={iconClass} />;
        case 'On-the-Job Training':
            return <OJTIcon className={iconClass} />;
        case 'Assessment':
            return <AssessmentIcon className={iconClass} />;
        default:
            return <CheckIcon className={iconClass} />; // Fallback
    }
};

interface Props {
  profile: LearnerProfile;
  pathway: LearningPathwayData;
  completedSteps: string[];
  quizResult: QuizResult | null;
  onViewPathway: () => void;
  onContinueLearning: (step: PathwayStep) => void;
  onStartQuiz: () => void;
  onReset: () => void;
  isGeneratingQuiz: boolean;
  onViewCertificate: () => void;
}

const Dashboard: React.FC<Props> = ({
  profile,
  pathway,
  completedSteps,
  quizResult,
  onViewPathway,
  onContinueLearning,
  onStartQuiz,
  onReset,
  isGeneratingQuiz,
  onViewCertificate
}) => {
  const allSteps = pathway.phases.flatMap(phase => phase.steps);
  const totalSteps = allSteps.length;
  const completedCount = completedSteps.length;
  const progressPercentage = totalSteps > 0 ? (completedCount / totalSteps) * 100 : 0;
  const isPathwayCompleted = progressPercentage === 100;

  const nextStep = allSteps.find(step => !completedSteps.includes(step.title));

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">Welcome back, {profile.name}!</h1>
        <p className="mt-2 text-lg text-gray-600">Here's a summary of your progress on the "{pathway.pathwayTitle}" pathway.</p>
      </div>

      {/* Progress Card */}
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
        <h2 className="text-xl font-bold text-gray-800 mb-3">Your Progress</h2>
        <div className="flex items-center gap-4">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                    className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500" 
                    style={{ width: `${progressPercentage}%` }}
                ></div>
            </div>
            <span className="font-semibold text-indigo-600">{Math.round(progressPercentage)}%</span>
        </div>
        <p className="text-sm text-gray-500 mt-2">{completedCount} of {totalSteps} steps completed</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
            {/* Continue Learning Card */}
            {nextStep && (
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center">
                            <ContinueLearningIcon className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">Continue Your Journey</h2>
                            <p className="text-sm text-gray-500">Here's your next recommended step.</p>
                        </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-indigo-600 bg-indigo-100 mb-2">
                            {nextStep.stepType}
                        </span>
                        <h3 className="font-bold text-gray-900">{nextStep.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{nextStep.description}</p>
                    </div>
                    <button 
                        onClick={() => onContinueLearning(nextStep)}
                        className="mt-4 w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Start Learning
                    </button>
                </div>
            )}
            
            {/* Completed Steps Card */}
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
                <div className="flex items-center gap-4 mb-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                        <CheckIcon className="w-7 h-7 text-white" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">Completed Steps</h2>
                        <p className="text-sm text-gray-500">A log of your accomplishments.</p>
                    </div>
                </div>
                {completedSteps.length > 0 ? (
                    <ul className="space-y-3 max-h-60 overflow-y-auto pr-2">
                        {allSteps.filter(step => completedSteps.includes(step.title)).map((step, index) => (
                            <li key={index} className="flex items-center gap-3 p-2 bg-gray-50 rounded-md">
                                <CompletedStepIcon type={step.stepType} />
                                <span className="text-sm font-medium text-gray-700">{step.title}</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-center text-gray-500 py-4">You haven't completed any steps yet. Keep going!</p>
                )}
            </div>
        </div>

        {/* Assessment Card */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
            <div className="flex items-center gap-4 mb-4">
                <div className="flex-shrink-0 w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center">
                    <AssessmentIcon className="w-7 h-7 text-white" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-800">Final Assessment</h2>
                    <p className="text-sm text-gray-500">Test your skills.</p>
                </div>
            </div>
            {quizResult ? (
                <div className="text-center">
                    <p className="text-lg font-semibold text-gray-800">Your Last Score:</p>
                    <p className={`text-5xl font-bold mt-2 ${quizResult.passed ? 'text-green-600' : 'text-red-600'}`}>
                        {quizResult.score} <span className="text-3xl text-gray-500">/ {quizResult.totalQuestions}</span>
                    </p>
                    <p className={`mt-2 font-semibold ${quizResult.passed ? 'text-green-600' : 'text-red-600'}`}>
                        {quizResult.passed ? 'Status: Passed' : 'Status: Failed'}
                    </p>
                    {quizResult.passed && (
                        <button
                            onClick={onViewCertificate}
                            className="mt-4 w-full px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            View Certificate
                        </button>
                    )}
                </div>
            ) : isPathwayCompleted ? (
                <div className="text-center">
                    <p className="text-green-600 font-semibold text-md mb-3">🎉 Pathway Complete! 🎉</p>
                    <button
                        onClick={onStartQuiz}
                        disabled={isGeneratingQuiz}
                        className="w-full px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400"
                    >
                        {isGeneratingQuiz ? 'Preparing...' : 'Start Assessment'}
                    </button>
                </div>
            ) : (
                <p className="text-center text-gray-500 text-sm py-4">Complete all steps in your learning path to unlock the final assessment.</p>
            )}
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button 
              onClick={onViewPathway}
              className="w-full sm:w-auto px-6 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
              View Full Pathway
          </button>
          <button 
              onClick={onReset}
              className="w-full sm:w-auto px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
              Start a New Pathway
          </button>
      </div>

    </div>
  );
};

export default Dashboard;