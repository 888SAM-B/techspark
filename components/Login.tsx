import React, { useState } from 'react';
import { loginUser } from '../services/userService';
import { User } from '../types';

interface Props {
  onLogin: (user: User) => void;
  onNavigateToRegister: () => void;
}

const Login: React.FC<Props> = ({ onLogin, onNavigateToRegister }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Please enter both username and password.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await loginUser(username, password);
      if (result.success && result.user) {
        onLogin(result.user);
      } else {
        setError(result.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 sm:p-10 rounded-3xl shadow-lg border border-[#EAE2D6] animate-fade-in my-8">
      {/* Brand Icon Header */}
      <div className="text-center mb-8">
        <img
          src="/lm-logo.png"
          alt="LearnMate"
          className="h-16 w-auto mx-auto mb-4 object-contain"
        />
        <h2 className="text-3xl font-extrabold text-[#1B2615] tracking-tight">Welcome Back</h2>
        <p className="text-[#5C6A44] text-sm mt-1">Log in to resume your skilling pathway</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-6 flex items-center gap-2" role="alert">
          <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="username" className="block text-xs font-bold text-[#465134] uppercase tracking-wider mb-1.5">
            Username
          </label>
          <input
            type="text"
            name="username"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="w-full px-4 py-2.5 bg-[#F6F8F3] border border-[#DBE3CF] rounded-xl text-[#1B2615] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8B9A6E] focus:border-[#8B9A6E] transition text-sm"
            placeholder="e.g. rahul_kumar"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-xs font-bold text-[#465134] uppercase tracking-wider mb-1.5">
            Password
          </label>
          <input
            type="password"
            name="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-2.5 bg-[#F6F8F3] border border-[#DBE3CF] rounded-xl text-[#1B2615] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8B9A6E] focus:border-[#8B9A6E] transition text-sm"
            placeholder="••••••••"
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-xl text-sm font-bold text-white bg-[#8B9A6E] hover:bg-[#758458] shadow-sm hover:shadow transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </div>
      </form>

      <div className="mt-8 pt-6 border-t border-[#EAE2D6] text-center text-sm text-[#5C6A44]">
        Don't have an account?{' '}
        <button
          onClick={onNavigateToRegister}
          className="font-bold text-[#8B9A6E] hover:text-[#5C6A44] transition underline"
        >
          Create an account
        </button>
      </div>
    </div>
  );
};

export default Login;
