import React, { useState, useMemo } from 'react';
import { QuizQuestion } from '../types';

interface Props {
  questions: QuizQuestion[];
  onSubmitQuiz: (score: number, totalQuestions: number) => void;
}

const QuizView: React.FC<Props> = ({ questions, onSubmitQuiz }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<(string | null)[]>(Array(questions.length).fill(null));
  const [showWarning, setShowWarning] = useState(false);

  const currentQuestion = useMemo(() => questions[currentQuestionIndex], [questions, currentQuestionIndex]);

  const handleAnswerSelect = (option: string) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = option;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = () => {
    const unansweredQuestions = answers.filter((a) => a === null).length;
    if (unansweredQuestions > 0) {
      setShowWarning(true);
      return;
    }
    const score = questions.reduce((acc, question, index) => {
      return answers[index] === question.correctAnswer ? acc + 1 : acc;
    }, 0);
    onSubmitQuiz(score, questions.length);
  };

  const progressPercentage = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 sm:p-10 rounded-3xl shadow-sm border border-[#EAE2D6] animate-fade-in my-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ECF0E6] text-[#5C6A44] text-xs font-semibold mb-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#8B9A6E]"></span>
          Official Certification Exam
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1B2615] tracking-tight">Final Assessment</h2>
        <p className="text-[#5C6A44] text-xs sm:text-sm mt-1">Demonstrate your knowledge to complete the curriculum.</p>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-bold text-[#465134]">
            Question {currentQuestionIndex + 1} of {questions.length}
          </span>
          <span className="text-xs font-bold text-[#8B9A6E]">{Math.round(progressPercentage)}%</span>
        </div>
        <div className="w-full bg-[#EEEEEE] rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-[#8B9A6E] h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Question Card */}
      <div>
        <h3 className="text-base sm:text-lg font-bold text-[#1B2615] mb-5 min-h-[3em] leading-relaxed">
          {currentQuestion.question}
        </h3>
        <div className="space-y-3">
          {currentQuestion.options.map((option, index) => {
            const isSelected = answers[currentQuestionIndex] === option;
            return (
              <label
                key={index}
                htmlFor={`option-${index}`}
                className={`flex items-center p-4 border rounded-2xl cursor-pointer transition-all ${
                  isSelected
                    ? 'border-[#8B9A6E] bg-[#F6F8F3] ring-2 ring-[#8B9A6E]'
                    : 'border-[#EAE2D6] hover:bg-[#F7F2EB]'
                }`}
              >
                <input
                  type="radio"
                  id={`option-${index}`}
                  name={`question-${currentQuestionIndex}`}
                  value={option}
                  checked={isSelected}
                  onChange={() => handleAnswerSelect(option)}
                  className="h-4 w-4 text-[#8B9A6E] focus:ring-[#8B9A6E] border-[#C2D0B0]"
                />
                <span className="ml-3.5 text-xs sm:text-sm font-medium text-[#1B2615]">{option}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="mt-8 pt-6 border-t border-[#EAE2D6] flex justify-between items-center">
        <button
          onClick={handlePrev}
          disabled={currentQuestionIndex === 0}
          className="px-5 py-2.5 text-xs sm:text-sm font-bold text-[#465134] bg-[#F7F2EB] border border-[#EAE2D6] rounded-xl hover:bg-[#ECF0E6] disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          Previous
        </button>

        {currentQuestionIndex === questions.length - 1 ? (
          <button
            onClick={handleSubmit}
            className="px-6 py-2.5 text-xs sm:text-sm font-bold text-white bg-[#5C6A44] hover:bg-[#465134] rounded-xl shadow-sm transition"
          >
            Submit & View Results
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="px-6 py-2.5 text-xs sm:text-sm font-bold text-white bg-[#8B9A6E] hover:bg-[#758458] rounded-xl shadow-sm transition"
          >
            Next Question &rarr;
          </button>
        )}
      </div>

      {showWarning && (
        <div className="mt-6 p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl text-center text-xs">
          <p className="font-semibold">You have unanswered questions. Please review all items before submitting.</p>
          <button onClick={() => setShowWarning(false)} className="mt-1.5 font-bold underline">
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
};

export default QuizView;
