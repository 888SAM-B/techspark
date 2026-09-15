import React, { useState, useEffect, useRef } from 'react';
import { PathwayStep, ChatMessage } from '../types';
import { createChatForStep, StepChatSession } from '../services/geminiService';
import { ChatIcon } from './icons/StepIcons';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  step: PathwayStep;
  language: string;
}

const ChatbotModal: React.FC<Props> = ({ isOpen, onClose, step, language }) => {
  const [chat, setChat] = useState<StepChatSession | null>(null);
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [history, isLoading]);

  useEffect(() => {
    if (isOpen && !chat) {
      try {
        const newChat = createChatForStep(step, language);
        setChat(newChat);
        setHistory([
          {
            role: 'model',
            text: `Vanakkam/Namaste! I'm your LearnMate AI tutor for "${step.title}". Ask me anything about this topic in ${language}!`,
          },
        ]);
        setError(null);
      } catch (e) {
        console.error('Failed to initialize chat:', e);
        setError('Could not start the AI assistant. Please try again later.');
      }
    } else if (!isOpen) {
      setChat(null);
      setHistory([]);
      setUserInput('');
      setIsLoading(false);
      setError(null);
    }
  }, [isOpen, chat, step, language]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || !chat || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', text: userInput };
    setHistory((prev) => [...prev, userMessage]);
    setUserInput('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await chat.sendMessage({ message: userInput });
      const modelMessage: ChatMessage = { role: 'model', text: response.text };
      setHistory((prev) => [...prev, modelMessage]);
    } catch (err) {
      console.error('Error sending message:', err);
      const errorMessage: ChatMessage = {
        role: 'model',
        text: 'Sorry, I encountered an error. Please try asking again.',
      };
      setHistory((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex justify-center items-end sm:items-center p-0 sm:p-4 animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="chatbot-title"
    >
      <div
        className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-lg h-[85vh] sm:h-auto sm:max-h-[85vh] flex flex-col border border-[#EAE2D6] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center gap-3.5 p-4 sm:p-5 border-b border-[#EAE2D6] bg-[#F7F2EB]">
          <div className="flex-shrink-0 w-11 h-11 bg-[#8B9A6E] rounded-2xl flex items-center justify-center text-white shadow-sm">
            <ChatIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 id="chatbot-title" className="text-base font-extrabold text-[#1B2615]">
              LearnMate AI Tutor
            </h2>
            <p className="text-xs text-[#5C6A44] truncate max-w-[260px]">Topic: {step.title}</p>
          </div>
          <button
            onClick={onClose}
            className="ml-auto text-[#758458] hover:text-[#1B2615] p-1.5 rounded-xl hover:bg-white transition"
            aria-label="Close chatbot"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        <main className="flex-1 p-4 overflow-y-auto bg-[#F6F8F3]">
          <div className="space-y-3.5">
            {history.map((message, index) => (
              <div
                key={index}
                className={`flex items-end gap-2 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role === 'model' && (
                  <div className="w-7 h-7 bg-[#ECF0E6] border border-[#DBE3CF] rounded-full flex items-center justify-center flex-shrink-0 text-[#5C6A44] font-extrabold text-[10px]">
                    LM
                  </div>
                )}
                <div
                  className={`max-w-[82%] p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    message.role === 'user'
                      ? 'bg-[#8B9A6E] text-white rounded-br-none shadow-sm'
                      : 'bg-white border border-[#EAE2D6] text-[#1B2615] rounded-bl-none shadow-xs'
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-end gap-2 justify-start">
                <div className="w-7 h-7 bg-[#ECF0E6] rounded-full flex items-center justify-center flex-shrink-0 text-[#5C6A44] font-extrabold text-[10px]">
                  LM
                </div>
                <div className="max-w-[80%] p-3.5 rounded-2xl bg-white border border-[#EAE2D6] rounded-bl-none">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 bg-[#8B9A6E] rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="h-2 w-2 bg-[#8B9A6E] rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="h-2 w-2 bg-[#8B9A6E] rounded-full animate-bounce"></span>
                  </div>
                </div>
              </div>
            )}
            {error && <p className="text-red-600 text-xs text-center">{error}</p>}
            <div ref={messagesEndRef} />
          </div>
        </main>

        <footer className="p-3.5 border-t border-[#EAE2D6] bg-white">
          <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder={`Ask doubts in ${language}...`}
              className="w-full px-4 py-2.5 bg-[#F6F8F3] border border-[#DBE3CF] rounded-xl text-xs sm:text-sm text-[#1B2615] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8B9A6E] focus:border-[#8B9A6E] transition"
              disabled={isLoading || !!error}
            />
            <button
              type="submit"
              className="p-2.5 bg-[#8B9A6E] text-white rounded-xl hover:bg-[#758458] disabled:opacity-40 transition-colors shadow-sm"
              disabled={isLoading || !userInput.trim() || !!error}
              aria-label="Send message"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.949a.75.75 0 00.95.826L11.25 9.25v1.5L4.643 12.51a.75.75 0 00-.95.826l-1.414 4.949a.75.75 0 00.826.95 28.896 28.896 0 0015.293-7.577.75.75 0 000-1.212A28.897 28.897 0 003.105 2.289z" />
              </svg>
            </button>
          </form>
        </footer>
      </div>
    </div>
  );
};

export default ChatbotModal;