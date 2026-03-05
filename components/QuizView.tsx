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
    const unansweredQuestions = answers.filter(a => a === null).length;
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
    <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-lg border border-gray-200 animate-fade-in">
      <h2 className="text-3xl font-bold text-gray-900 mb-2">Final Assessment</h2>
      <p className="text-gray-600 mb-6">Test your knowledge to complete the pathway.</p>
      
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium text-indigo-700">Question {currentQuestionIndex + 1} of {questions.length}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${progressPercentage}%` }}></div>
        </div>
      </div>

      {/* Question */}
      <div>
        <h3 className="text-xl font-semibold text-gray-800 mb-6 min-h-[3em]">{currentQuestion.question}</h3>
        <div className="space-y-4">
          {currentQuestion.options.map((option, index) => (
            <label 
              key={index} 
              htmlFor={`option-${index}`} 
              className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all duration-200 ${answers[currentQuestionIndex] === option ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-500' : 'border-gray-300 hover:bg-gray-50'}`}
            >
              <input
                type="radio"
                id={`option-${index}`}
                name={`question-${currentQuestionIndex}`}
                value={option}
                checked={answers[currentQuestionIndex] === option}
                onChange={() => handleAnswerSelect(option)}
                className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300"
              />
              <span className="ml-4 text-gray-700">{option}</span>
            </label>
          ))}
        </div>
      </div>
      
      {/* Navigation */}
      <div className="mt-8 pt-6 border-t border-gray-200 flex justify-between items-center">
        <button 
          onClick={handlePrev} 
          disabled={currentQuestionIndex === 0}
          className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        {currentQuestionIndex === questions.length - 1 ? (
          <button 
            onClick={handleSubmit}
            className="px-6 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Submit & View Results
          </button>
        ) : (
          <button 
            onClick={handleNext}
            className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Next
          </button>
        )}
      </div>

      {showWarning && (
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-300 text-yellow-800 rounded-lg text-center">
            <p>You have unanswered questions. Please review them before submitting.</p>
            <button onClick={() => setShowWarning(false)} className="mt-2 text-sm font-semibold underline">Dismiss</button>
        </div>
      )}
    </div>
  );
};

export default QuizView;
