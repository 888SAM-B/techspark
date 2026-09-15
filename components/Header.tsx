import React from 'react';
import { User } from '../types';

interface Props {
  user: User | null;
  onLogout: () => void;
  onNavigateHome: () => void;
  onNavigateLogin: () => void;
  onNavigateRegister: () => void;
  onNavigateDashboard?: () => void;
  currentView?: string;
}

const Header: React.FC<Props> = ({
  user,
  onLogout,
  onNavigateHome,
  onNavigateLogin,
  onNavigateRegister,
  onNavigateDashboard,
  currentView,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#EAE2D6] shadow-sm transition-all">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo & Name */}
          <button
            onClick={onNavigateHome}
            className="flex items-center gap-3 group text-left focus:outline-none"
            aria-label="LearnMate Home"
          >
            <img
              src="/lm-logo.png"
              alt="LearnMate Logo"
              className="h-11 w-auto object-contain transition-transform group-hover:scale-105"
            />
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-2xl font-extrabold text-[#1B2615] tracking-tight">LearnMate</span>
                <span className="hidden sm:inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#ECF0E6] text-[#5C6A44] border border-[#DBE3CF]">
                  India
                </span>
              </div>
              <span className="text-[11px] text-[#5C6A44] font-medium tracking-normal hidden sm:block">
                Your Goal. Your Path.
              </span>
            </div>
          </button>

          {/* Navigation Actions */}
          <div className="flex items-center gap-3 sm:gap-4">
            {user ? (
              <>
                {onNavigateDashboard && currentView !== 'dashboard' && (
                  <button
                    onClick={onNavigateDashboard}
                    className="px-3.5 py-2 text-sm font-semibold text-[#2C3420] hover:text-[#1B2615] bg-[#F7F2EB] hover:bg-[#ECF0E6] border border-[#EAE2D6] rounded-xl transition"
                  >
                    Dashboard
                  </button>
                )}
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#F6F8F3] border border-[#DBE3CF] text-xs font-semibold text-[#465134]">
                  <span className="w-2 h-2 rounded-full bg-[#8B9A6E]"></span>
                  <span>{user.profile?.name || user.username}</span>
                </div>
                <button
                  onClick={onLogout}
                  className="px-4 py-2 text-sm font-semibold text-[#5C6A44] hover:text-red-700 bg-white hover:bg-red-50 border border-[#EAE2D6] hover:border-red-200 rounded-xl transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={onNavigateLogin}
                  className="px-4 py-2 text-sm font-bold text-[#2C3420] hover:text-[#1B2615] hover:bg-[#F7F2EB] rounded-xl transition"
                >
                  Sign In
                </button>
                <button
                  onClick={onNavigateRegister}
                  className="px-5 py-2.5 text-sm font-bold text-white bg-[#8B9A6E] hover:bg-[#758458] rounded-xl shadow-sm hover:shadow transition-all"
                >
                  Get Started
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
