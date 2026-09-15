import React from 'react';
import { LearnerProfile, LearningPathwayData, PathwayStep, QuizResult } from '../types';
import { AssessmentIcon, CertificationIcon, CheckIcon, ContinueLearningIcon, CourseIcon, OJTIcon, ProjectIcon } from './icons/StepIcons';

const CompletedStepIcon: React.FC<{ type: PathwayStep['stepType'] }> = ({ type }) => {
  const iconClass = 'w-5 h-5 text-[#8B9A6E] flex-shrink-0';
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
      return <CheckIcon className={iconClass} />;
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
  onViewCertificate,
}) => {
  const allSteps = pathway.phases.flatMap((phase) => phase.steps);
  const totalSteps = allSteps.length;
  const completedCount = completedSteps.length;
  const progressPercentage = totalSteps > 0 ? (completedCount / totalSteps) * 100 : 0;
  const isPathwayCompleted = progressPercentage === 100;

  const nextStep = allSteps.find((step) => !completedSteps.includes(step.title));

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in my-6">
      {/* Welcome Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-[#EAE2D6]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ECF0E6] text-[#5C6A44] text-xs font-semibold mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#8B9A6E]"></span>
              Active Pathway
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-[#1B2615] tracking-tight">
              Welcome back, {profile.name}!
            </h1>
            <p className="mt-1 text-sm md:text-base text-[#5C6A44]">
              Tracking your journey for <span className="font-semibold text-[#1B2615]">"{pathway.pathwayTitle}"</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onViewPathway}
              className="px-4 py-2 text-xs md:text-sm font-bold text-white bg-[#8B9A6E] hover:bg-[#758458] rounded-xl shadow-sm transition"
            >
              Full Pathway
            </button>
            <button
              onClick={onReset}
              className="px-4 py-2 text-xs md:text-sm font-medium text-[#465134] bg-[#F7F2EB] hover:bg-[#ECF0E6] border border-[#EAE2D6] rounded-xl transition"
            >
              Change Goal
            </button>
          </div>
        </div>
      </div>

      {/* Progress Card */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-[#EAE2D6]">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-bold text-[#1B2615]">Overall Skilling Progress</h2>
          <span className="text-sm font-extrabold text-[#8B9A6E]">{Math.round(progressPercentage)}%</span>
        </div>
        <div className="w-full bg-[#EEEEEE] rounded-full h-3 overflow-hidden">
          <div
            className="bg-[#8B9A6E] h-3 rounded-full transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        <p className="text-xs text-[#5C6A44] mt-2.5 font-medium">
          {completedCount} of {totalSteps} vocational milestones completed
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Continue Learning Card */}
          {nextStep && (
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-[#EAE2D6]">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-shrink-0 w-12 h-12 bg-[#8B9A6E] rounded-2xl flex items-center justify-center text-white shadow-sm">
                  <ContinueLearningIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#1B2615]">Next Recommended Step</h2>
                  <p className="text-xs text-[#5C6A44]">Pick up right where you left off</p>
                </div>
              </div>

              <div className="bg-[#F6F8F3] p-5 rounded-2xl border border-[#DBE3CF]">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[11px] font-bold inline-block py-0.5 px-2.5 uppercase rounded-full text-[#465134] bg-[#EAE2D6]">
                    {nextStep.stepType}
                  </span>
                  {nextStep.nsqfLevel && nextStep.nsqfLevel !== 'N/A' && (
                    <span className="text-[11px] font-bold inline-block py-0.5 px-2 rounded-full text-[#5C6A44] bg-white border border-[#DBE3CF]">
                      NSQF {nextStep.nsqfLevel}
                    </span>
                  )}
                  {nextStep.duration && (
                    <span className="text-[11px] text-[#758458]">⏱ {nextStep.duration}</span>
                  )}
                </div>
                <h3 className="font-bold text-base text-[#1B2615]">{nextStep.title}</h3>
                <p className="text-xs text-[#5C6A44] mt-1.5 leading-relaxed">{nextStep.description}</p>
              </div>

              <button
                onClick={() => onContinueLearning(nextStep)}
                className="mt-4 w-full py-3 px-4 rounded-xl text-sm font-bold text-white bg-[#8B9A6E] hover:bg-[#758458] shadow-sm hover:shadow transition-all"
              >
                Start Learning This Module &rarr;
              </button>
            </div>
          )}

          {/* Completed Steps Card */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-[#EAE2D6]">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-shrink-0 w-12 h-12 bg-[#5C6A44] rounded-2xl flex items-center justify-center text-white shadow-sm">
                <CheckIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#1B2615]">Completed Milestones</h2>
                <p className="text-xs text-[#5C6A44]">Your verified accomplishments</p>
              </div>
            </div>

            {completedSteps.length > 0 ? (
              <ul className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {allSteps
                  .filter((step) => completedSteps.includes(step.title))
                  .map((step, index) => (
                    <li
                      key={index}
                      className="flex items-center gap-3 p-3 bg-[#F6F8F3] border border-[#ECF0E6] rounded-xl"
                    >
                      <CompletedStepIcon type={step.stepType} />
                      <span className="text-xs sm:text-sm font-semibold text-[#1B2615]">{step.title}</span>
                    </li>
                  ))}
              </ul>
            ) : (
              <p className="text-center text-[#758458] text-xs py-6 bg-[#F7F2EB] rounded-2xl">
                No steps completed yet. Dive into your first module!
              </p>
            )}
          </div>
        </div>

        {/* Assessment & Certification Column */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-[#EAE2D6] h-fit">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-shrink-0 w-12 h-12 bg-[#465134] rounded-2xl flex items-center justify-center text-white shadow-sm">
              <AssessmentIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#1B2615]">Final Assessment</h2>
              <p className="text-xs text-[#5C6A44]">Certify your skills</p>
            </div>
          </div>

          {quizResult ? (
            <div className="text-center p-4 bg-[#F6F8F3] rounded-2xl border border-[#DBE3CF]">
              <p className="text-xs font-semibold text-[#5C6A44]">Latest Result:</p>
              <p className={`text-4xl font-extrabold mt-1 ${quizResult.passed ? 'text-[#5C6A44]' : 'text-amber-700'}`}>
                {quizResult.score} <span className="text-lg text-[#758458]">/ {quizResult.totalQuestions}</span>
              </p>
              <p className={`mt-1 text-xs font-bold ${quizResult.passed ? 'text-[#5C6A44]' : 'text-amber-700'}`}>
                {quizResult.passed ? 'Status: Passed (Certified)' : 'Status: Needs Improvement'}
              </p>
              {quizResult.passed && (
                <button
                  onClick={onViewCertificate}
                  className="mt-4 w-full py-2.5 px-4 bg-[#8B9A6E] hover:bg-[#758458] text-white font-bold text-xs rounded-xl shadow-sm transition"
                >
                  View & Download Certificate
                </button>
              )}
            </div>
          ) : isPathwayCompleted ? (
            <div className="text-center p-4 bg-[#ECF0E6] rounded-2xl border border-[#C2D0B0]">
              <p className="text-[#2C3420] font-bold text-sm mb-2">🎉 All Steps Completed!</p>
              <p className="text-[#5C6A44] text-xs mb-4">Ready to test your knowledge and claim your certificate?</p>
              <button
                onClick={onStartQuiz}
                disabled={isGeneratingQuiz}
                className="w-full py-2.5 px-4 bg-[#8B9A6E] hover:bg-[#758458] text-white font-bold text-xs rounded-xl shadow-sm transition disabled:opacity-50"
              >
                {isGeneratingQuiz ? 'Preparing Quiz...' : 'Start Assessment'}
              </button>
            </div>
          ) : (
            <div className="p-4 bg-[#F7F2EB] rounded-2xl border border-[#EAE2D6] text-center">
              <p className="text-xs text-[#758458]">
                Finish all {totalSteps} modules in this pathway to unlock the official assessment and certificate.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;