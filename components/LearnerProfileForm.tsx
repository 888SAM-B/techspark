import React, { useState } from 'react';
import { LearnerProfile } from '../types';

interface Props {
  onSubmit: (profile: LearnerProfile) => void;
}

const LearnerProfileForm: React.FC<Props> = ({ onSubmit }) => {
  const [profile, setProfile] = useState<LearnerProfile>({
    name: '',
    location: 'Maharashtra',
    education: '12th Pass',
    skills: '',
    aspiration: '',
    language: 'English',
  });

  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile.name.trim() || !profile.aspiration.trim() || !profile.skills.trim()) {
      setError('Please fill out all required fields: Name, Current Skills, and Career Aspiration.');
      return;
    }
    setError('');
    onSubmit(profile);
  };

  const indianStates = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana',
    'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
    'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana',
    'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Andaman and Nicobar Islands', 'Chandigarh',
    'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
  ];
  const educationLevels = ['Below 10th', '10th Pass', '12th Pass', 'ITI', 'Diploma', 'Graduate', 'Post Graduate'];
  const languages = ['English', 'Hindi', 'Bengali', 'Marathi', 'Telugu', 'Tamil', 'Gujarati', 'Urdu', 'Kannada', 'Odia', 'Malayalam', 'Punjabi', 'Assamese'];

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 sm:p-10 rounded-3xl shadow-lg border border-[#EAE2D6] animate-fade-in my-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ECF0E6] text-[#5C6A44] text-xs font-semibold mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-[#8B9A6E]"></span>
          Step 1: Career Profile
        </div>
        <h2 className="text-3xl font-extrabold text-[#1B2615] tracking-tight">Create Your Skilling Profile</h2>
        <p className="text-[#5C6A44] text-sm mt-1">Tell us your background so LearnMate AI can curate your personalized path.</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-6" role="alert">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-xs font-bold text-[#465134] uppercase tracking-wider mb-1.5">
            Full Name *
          </label>
          <input
            type="text"
            name="name"
            id="name"
            value={profile.name}
            onChange={handleChange}
            required
            className="w-full px-4 py-2.5 bg-[#F6F8F3] border border-[#DBE3CF] rounded-xl text-[#1B2615] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8B9A6E] focus:border-[#8B9A6E] transition text-sm"
            placeholder="e.g., Sam B"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label htmlFor="location" className="block text-xs font-bold text-[#465134] uppercase tracking-wider mb-1.5">
              State / Union Territory
            </label>
            <select
              name="location"
              id="location"
              value={profile.location}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-[#F6F8F3] border border-[#DBE3CF] rounded-xl text-[#1B2615] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8B9A6E] focus:border-[#8B9A6E] transition text-sm"
            >
              {indianStates.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="education" className="block text-xs font-bold text-[#465134] uppercase tracking-wider mb-1.5">
              Highest Education
            </label>
            <select
              name="education"
              id="education"
              value={profile.education}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-[#F6F8F3] border border-[#DBE3CF] rounded-xl text-[#1B2615] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8B9A6E] focus:border-[#8B9A6E] transition text-sm"
            >
              {educationLevels.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="skills" className="block text-xs font-bold text-[#465134] uppercase tracking-wider mb-1.5">
            What are your current skills? *
          </label>
          <textarea
            name="skills"
            id="skills"
            value={profile.skills}
            onChange={handleChange}
            required
            rows={3}
            className="w-full px-4 py-2.5 bg-[#F6F8F3] border border-[#DBE3CF] rounded-xl text-[#1B2615] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8B9A6E] focus:border-[#8B9A6E] transition text-sm"
            placeholder="e.g., Basic electrical wiring, MS Office, customer handling, two-wheeler repair"
          ></textarea>
          <p className="text-[11px] text-[#758458] mt-1">List any prior vocational, technical, or personal skills.</p>
        </div>

        <div>
          <label htmlFor="aspiration" className="block text-xs font-bold text-[#465134] uppercase tracking-wider mb-1.5">
            What is your career aspiration? *
          </label>
          <input
            type="text"
            name="aspiration"
            id="aspiration"
            value={profile.aspiration}
            onChange={handleChange}
            required
            className="w-full px-4 py-2.5 bg-[#F6F8F3] border border-[#DBE3CF] rounded-xl text-[#1B2615] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8B9A6E] focus:border-[#8B9A6E] transition text-sm"
            placeholder="e.g., Solar Installation Technician, CNC Operator, Digital Marketer"
          />
        </div>

        <div>
          <label htmlFor="language" className="block text-xs font-bold text-[#465134] uppercase tracking-wider mb-1.5">
            Preferred Language for Learning
          </label>
          <select
            name="language"
            id="language"
            value={profile.language}
            onChange={handleChange}
            className="w-full px-4 py-2.5 bg-[#F6F8F3] border border-[#DBE3CF] rounded-xl text-[#1B2615] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8B9A6E] focus:border-[#8B9A6E] transition text-sm"
          >
            {languages.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
          <p className="text-[11px] text-[#758458] mt-1">Your learning guides, assessment quiz, and AI tutor will speak in this language.</p>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            className="w-full py-3.5 px-4 rounded-xl text-base font-bold text-white bg-[#8B9A6E] hover:bg-[#758458] shadow-sm hover:shadow transition-all"
          >
            Generate My Personalized Pathway &rarr;
          </button>
        </div>
      </form>
    </div>
  );
};

export default LearnerProfileForm;
