import React from 'react';
import { LearnerProfile, LearningPathwayData, PathwayStep } from '../types';
import { CourseIcon, CertificationIcon, ProjectIcon, OJTIcon, AssessmentIcon, CheckIcon } from './icons/StepIcons';


const StepTypeIcon: React.FC<{ type: PathwayStep['stepType'] }> = ({ type }) => {
    const iconClass = "h-8 w-8 text-white";
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
            return <CourseIcon className={iconClass} />;
    }
};

interface Props {
  pathway: LearningPathwayData;
  profile: LearnerProfile;
  onBack: () => void;
  onSelectStep: (step: PathwayStep) => void;
  completedSteps: string[];
  onToggleStepCompletion: (stepTitle: string) => void;
  onStartQuiz: () => void;
  isGeneratingQuiz: boolean;
}

const LearningPathway: React.FC<Props> = ({ pathway, profile, onBack, onSelectStep, completedSteps, onToggleStepCompletion, onStartQuiz, isGeneratingQuiz }) => {
  const totalSteps = pathway.phases.reduce((acc, phase) => acc + phase.steps.length, 0);
  const completedCount = completedSteps.length;
  const progressPercentage = totalSteps > 0 ? (completedCount / totalSteps) * 100 : 0;
  const isCompleted = progressPercentage === 100;

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
        <div className="mb-6">
            <button 
                onClick={onBack}
                className="inline-flex items-center gap-2 text-indigo-600 font-semibold hover:text-indigo-800 transition-colors"
                aria-label="Go back to the dashboard"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
                Back to Dashboard
            </button>
        </div>
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200 mb-8 text-center">
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">{pathway.pathwayTitle}</h1>
            <p className="text-indigo-600 font-semibold mt-1">A Personalized Pathway for {profile.name}</p>
            <p className="mt-4 text-gray-600 max-w-2xl mx-auto">{pathway.summary}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 mb-12">
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
            {isCompleted && (
                 <div className="text-center mt-4 pt-4 border-t border-gray-200 animate-fade-in">
                    <p className="text-green-600 font-semibold text-lg">🎉 Congratulations! You've completed your learning path! 🎉</p>
                    <p className="text-gray-600 mt-2">Ready to test your knowledge? Take the final assessment.</p>
                </div>
            )}
        </div>

        <div className="space-y-12">
            {pathway.phases.map((phase, phaseIndex) => (
                <div key={phaseIndex}>
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-gray-800">{phase.phaseTitle}</h2>
                        <p className="text-gray-500 mt-1">{phase.phaseDescription}</p>
                    </div>
                    <div className="relative">
                        {/* Vertical line */}
                        <div className="absolute left-1/2 -ml-0.5 w-1 bg-indigo-200 h-full hidden md:block" aria-hidden="true"></div>

                        {phase.steps.map((step, stepIndex) => {
                            const isStepCompleted = completedSteps.includes(step.title);
                            return (
                                <div key={stepIndex} className={`mb-8 flex md:items-center w-full ${stepIndex % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
                                    <div className="hidden md:block w-1/2"></div>
                                    <div className="hidden md:block w-fit z-10">
                                        <div className={`flex items-center justify-center w-16 h-16 rounded-full shadow-lg transition-colors ${isStepCompleted ? 'bg-green-500' : 'bg-indigo-600'}`}>
                                            {isStepCompleted ? <CheckIcon className="w-8 h-8 text-white" /> : <StepTypeIcon type={step.stepType} />}
                                        </div>
                                    </div>
                                    <div 
                                        className={`w-full md:w-1/2 bg-white rounded-xl shadow-lg border p-6 transition-all transform hover:scale-105 hover:shadow-2xl cursor-pointer text-left ${isStepCompleted ? 'border-green-300' : 'border-gray-200'}`}
                                        onClick={() => onSelectStep(step)}
                                        role="button"
                                        tabIndex={0}
                                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelectStep(step); }}
                                        aria-label={`View details for ${step.title}`}
                                    >
                                        <div className="flex items-center gap-4 mb-3">
                                            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-indigo-600 shadow-lg md:hidden">
                                               <StepTypeIcon type={step.stepType} />
                                            </div>
                                            <div>
                                                <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-indigo-600 bg-indigo-100">
                                                    {step.stepType}
                                                </span>
                                            </div>
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                                        <p className="text-gray-600 text-sm mb-4">{step.description}</p>
                                        <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-gray-500 mb-4">
                                            <span className="font-semibold bg-gray-100 px-2 py-1 rounded">NSQF Level: {step.nsqfLevel}</span>
                                            <span className="font-semibold bg-gray-100 px-2 py-1 rounded">Duration: {step.duration}</span>
                                        </div>
                                        <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onToggleStepCompletion(step.title);
                                                }}
                                                aria-label={isStepCompleted ? `Mark '${step.title}' as incomplete` : `Mark '${step.title}' as complete`}
                                                className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-full transition-colors ${isStepCompleted ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                            >
                                                {isStepCompleted ? <><CheckIcon className="w-4 h-4" /> Completed</> : 'Mark as Complete'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            ))}
        </div>
        
        <div className="text-center mt-12">
            {isCompleted && (
                 <button
                    onClick={onStartQuiz}
                    disabled={isGeneratingQuiz}
                    className="px-8 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {isGeneratingQuiz ? 'Preparing Assessment...' : 'Start Final Assessment'}
                  </button>
            )}
        </div>
    </div>
  );
};

export default LearningPathway;