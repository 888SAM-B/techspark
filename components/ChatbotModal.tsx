import React, { useState, useEffect, useRef } from 'react';
import { Chat } from '@google/genai';
import { PathwayStep, ChatMessage } from '../types';
import { createChatForStep } from '../services/geminiService';
import { ChatIcon } from './icons/StepIcons';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  step: PathwayStep;
  language: string;
}

const ChatbotModal: React.FC<Props> = ({ isOpen, onClose, step, language }) => {
  const [chat, setChat] = useState<Chat | null>(null);
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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
          { role: 'model', text: `Hello! I'm your AI assistant. Ask me anything about "${step.title}". How can I help you?` }
        ]);
        setError(null);
      } catch (e) {
          console.error("Failed to initialize chat:", e);
          setError("Could not start the AI assistant. Please try again later.");
      }
    } else if (!isOpen) {
      // Optional: Reset chat when closed to start fresh next time
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
    setHistory(prev => [...prev, userMessage]);
    setUserInput('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await chat.sendMessage({ message: userInput });
      const modelMessage: ChatMessage = { role: 'model', text: response.text };
      setHistory(prev => [...prev, modelMessage]);
    } catch (err) {
      console.error("Error sending message:", err);
      const errorMessage: ChatMessage = { role: 'model', text: "Sorry, I encountered an error. Please try asking again." };
      setHistory(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-30 z-50 flex justify-center items-end sm:items-center p-0 sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="chatbot-title"
    >
      <div
        className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full max-w-lg h-[85vh] sm:h-auto sm:max-h-[85vh] flex flex-col transition-transform transform-gpu animate-fade-in"
        onClick={e => e.stopPropagation()}
      >
        <header className="flex items-center gap-4 p-4 border-b border-gray-200">
          <div className="flex-shrink-0 w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center">
             <ChatIcon className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 id="chatbot-title" className="text-lg font-bold text-gray-900">Learning Assistant</h2>
            <p className="text-sm text-gray-500">Topic: {step.title}</p>
          </div>
          <button
            onClick={onClose}
            className="ml-auto text-gray-400 hover:text-gray-600 transition"
            aria-label="Close chatbot"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        <main className="flex-1 p-4 overflow-y-auto bg-gray-50">
          <div className="space-y-4">
            {history.map((message, index) => (
              <div key={index} className={`flex items-end gap-2 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {message.role === 'model' && <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0 text-indigo-600 font-bold text-sm">AI</div>}
                <div
                  className={`max-w-[80%] p-3 rounded-2xl text-sm ${message.role === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none'}`}
                >
                  {message.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-end gap-2 justify-start">
                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0 text-indigo-600 font-bold text-sm">AI</div>
                <div className="max-w-[80%] p-3 rounded-2xl bg-white border border-gray-200 text-gray-800 rounded-bl-none">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="h-2 w-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="h-2 w-2 bg-indigo-400 rounded-full animate-bounce"></span>
                  </div>
                </div>
              </div>
            )}
             {error && <p className="text-red-500 text-xs text-center">{error}</p>}
            <div ref={messagesEndRef} />
          </div>
        </main>

        <footer className="p-4 border-t border-gray-200 bg-white">
          <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            <input
              type="text"
              value={userInput}
              onChange={e => setUserInput(e.target.value)}
              placeholder="Ask a question..."
              className="w-full px-4 py-2 border border-gray-300 rounded-full focus:ring-indigo-500 focus:border-indigo-500 transition"
              disabled={isLoading || !!error}
            />
            <button
              type="submit"
              className="p-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:bg-indigo-300 transition-colors"
              disabled={isLoading || !userInput.trim() || !!error}
              aria-label="Send message"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
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