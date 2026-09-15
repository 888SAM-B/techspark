import React from 'react';
import { LearnerProfile, LearningPathwayData, PathwayStep } from '../types';
import { CourseIcon, CertificationIcon, ProjectIcon, OJTIcon, AssessmentIcon, CheckIcon } from './icons/StepIcons';

const StepTypeIcon: React.FC<{ type: PathwayStep['stepType'] }> = ({ type }) => {
  const iconClass = 'h-7 w-7 text-white';
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

const LearningPathway: React.FC<Props> = ({
  pathway,
  profile,
  onBack,
  onSelectStep,
  completedSteps,
  onToggleStepCompletion,
  onStartQuiz,
  isGeneratingQuiz,
}) => {
  const totalSteps = pathway.phases.reduce((acc, phase) => acc + phase.steps.length, 0);
  const completedCount = completedSteps.length;
  const progressPercentage = totalSteps > 0 ? (completedCount / totalSteps) * 100 : 0;
  const isCompleted = progressPercentage === 100;

  return (
    <div className="max-w-4xl mx-auto animate-fade-in my-6">
      <div className="mb-6">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-[#5C6A44] font-bold text-sm hover:text-[#2C3420] transition-colors"
          aria-label="Go back to the dashboard"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Back to Dashboard
        </button>
      </div>

      {/* Header Card */}
      <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-sm border border-[#EAE2D6] mb-8 text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ECF0E6] text-[#5C6A44] text-xs font-semibold mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-[#8B9A6E]"></span>
          Personalized Curriculum
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-[#1B2615] tracking-tight">{pathway.pathwayTitle}</h1>
        <p className="text-[#8B9A6E] font-bold text-sm mt-1">Curated for {profile.name} • {profile.location}</p>
        <p className="mt-4 text-[#5C6A44] text-sm md:text-base max-w-2xl mx-auto leading-relaxed">{pathway.summary}</p>
      </div>

      {/* Progress Bar */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-[#EAE2D6] mb-12">
        <div className="flex justify-between items-center mb-2.5">
          <h2 className="text-base font-bold text-[#1B2615]">Milestone Progress</h2>
          <span className="font-extrabold text-sm text-[#8B9A6E]">{Math.round(progressPercentage)}%</span>
        </div>
        <div className="w-full bg-[#EEEEEE] rounded-full h-3 overflow-hidden">
          <div
            className="bg-[#8B9A6E] h-3 rounded-full transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        <p className="text-xs text-[#5C6A44] mt-2.5">
          {completedCount} of {totalSteps} milestones finished
        </p>

        {isCompleted && (
          <div className="text-center mt-4 pt-4 border-t border-[#EAE2D6] animate-fade-in">
            <p className="text-[#5C6A44] font-bold text-base">🎉 Congratulations! You have completed all phases! 🎉</p>
            <p className="text-xs text-[#758458] mt-1">Take the final assessment to claim your official completion certificate.</p>
          </div>
        )}
      </div>

      {/* Phases Timeline */}
      <div className="space-y-12">
        {pathway.phases.map((phase, phaseIndex) => (
          <div key={phaseIndex}>
            <div className="text-center mb-8">
              <span className="text-xs font-bold uppercase tracking-wider text-[#8B9A6E] bg-[#ECF0E6] px-3 py-1 rounded-full">
                Phase {phaseIndex + 1}
              </span>
              <h2 className="text-2xl font-extrabold text-[#1B2615] mt-2">{phase.phaseTitle}</h2>
              <p className="text-xs sm:text-sm text-[#5C6A44] mt-1">{phase.phaseDescription}</p>
            </div>

            <div className="relative">
              {/* Vertical connector line */}
              <div className="absolute left-1/2 -ml-0.5 w-0.5 bg-[#DBE3CF] h-full hidden md:block" aria-hidden="true"></div>

              {phase.steps.map((step, stepIndex) => {
                const isStepCompleted = completedSteps.includes(step.title);
                return (
                  <div
                    key={stepIndex}
                    className={`mb-8 flex md:items-center w-full ${stepIndex % 2 === 0 ? 'md:flex-row-reverse' : ''}`}
                  >
                    <div className="hidden md:block w-1/2"></div>
                    <div className="hidden md:block w-fit z-10 px-4">
                      <div
                        className={`flex items-center justify-center w-14 h-14 rounded-2xl shadow-sm transition-colors ${
                          isStepCompleted ? 'bg-[#5C6A44]' : 'bg-[#8B9A6E]'
                        }`}
                      >
                        {isStepCompleted ? <CheckIcon className="w-7 h-7 text-white" /> : <StepTypeIcon type={step.stepType} />}
                      </div>
                    </div>

                    <div
                      className={`w-full md:w-1/2 bg-white rounded-3xl shadow-sm border p-6 transition-all transform hover:-translate-y-1 hover:shadow-md cursor-pointer text-left ${
                        isStepCompleted ? 'border-[#C2D0B0] bg-[#FDFEFD]' : 'border-[#EAE2D6]'
                      }`}
                      onClick={() => onSelectStep(step)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') onSelectStep(step);
                      }}
                      aria-label={`View details for ${step.title}`}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div
                          className={`flex items-center justify-center w-10 h-10 rounded-xl shadow-sm md:hidden ${
                            isStepCompleted ? 'bg-[#5C6A44]' : 'bg-[#8B9A6E]'
                          }`}
                        >
                          <StepTypeIcon type={step.stepType} />
                        </div>
                        <span className="text-[11px] font-bold inline-block py-0.5 px-2.5 uppercase rounded-full text-[#465134] bg-[#EAE2D6]">
                          {step.stepType}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-[#1B2615] mb-1.5">{step.title}</h3>
                      <p className="text-[#5C6A44] text-xs sm:text-sm mb-4 leading-relaxed">{step.description}</p>

                      <div className="flex flex-wrap gap-2 text-xs mb-4">
                        {step.nsqfLevel && step.nsqfLevel !== 'N/A' && (
                          <span className="font-semibold bg-[#F6F8F3] text-[#465134] border border-[#DBE3CF] px-2.5 py-1 rounded-lg">
                            NSQF: {step.nsqfLevel}
                          </span>
                        )}
                        {step.duration && (
                          <span className="font-medium bg-[#F6F8F3] text-[#5C6A44] border border-[#DBE3CF] px-2.5 py-1 rounded-lg">
                            ⏱ {step.duration}
                          </span>
                        )}
                      </div>

                      <div className="pt-3 border-t border-[#EAE2D6] flex items-center justify-between">
                        <span className="text-xs font-bold text-[#8B9A6E] hover:underline">Open Study Guide &rarr;</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleStepCompletion(step.title);
                          }}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition ${
                            isStepCompleted
                              ? 'bg-[#ECF0E6] text-[#2C3420] border border-[#C2D0B0]'
                              : 'bg-[#F7F2EB] text-[#465134] border border-[#EAE2D6] hover:bg-[#ECF0E6]'
                          }`}
                        >
                          {isStepCompleted ? (
                            <>
                              <CheckIcon className="w-3.5 h-3.5 text-[#8B9A6E]" /> Completed
                            </>
                          ) : (
                            'Mark Done'
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
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
            className="px-8 py-4 bg-[#8B9A6E] hover:bg-[#758458] text-white font-bold text-base rounded-2xl shadow-md hover:shadow-lg transition-all disabled:opacity-50"
          >
            {isGeneratingQuiz ? 'Preparing Assessment...' : 'Start Final Assessment &rarr;'}
          </button>
        )}
      </div>
    </div>
  );
};

export default LearningPathway;