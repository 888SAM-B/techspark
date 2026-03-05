
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
    if (!profile.name || !profile.aspiration || !profile.skills) {
      setError('Please fill out all required fields: Name, Current Skills, and Career Aspiration.');
      return;
    }
    setError('');
    onSubmit(profile);
  };

  const indianStates = ["Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"];
  const educationLevels = ["Below 10th", "10th Pass", "12th Pass", "ITI", "Diploma", "Graduate", "Post Graduate"];
  const languages = ["English", "Hindi", "Bengali", "Marathi", "Telugu", "Tamil", "Gujarati", "Urdu", "Kannada", "Odia", "Malayalam", "Punjabi", "Assamese"];

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-lg border border-gray-200">
      <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Your Skilling Profile</h2>
      <p className="text-gray-600 mb-8">Tell us a bit about yourself to generate a personalized learning path.</p>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-6" role="alert">
        <span className="block sm:inline">{error}</span>
      </div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
          <input type="text" name="name" id="name" value={profile.name} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition" placeholder="Your Name" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">State / Union Territory</label>
            <select name="location" id="location" value={profile.location} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition bg-white">
              {indianStates.map(state => <option key={state} value={state}>{state}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="education" className="block text-sm font-medium text-gray-700 mb-1">Highest Education</label>
            <select name="education" id="education" value={profile.education} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition bg-white">
              {educationLevels.map(level => <option key={level} value={level}>{level}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="skills" className="block text-sm font-medium text-gray-700 mb-1">What are your current skills?</label>
          <textarea name="skills" id="skills" value={profile.skills} onChange={handleChange} required rows={3} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition" placeholder="e.g., Basic computer knowledge, Customer service, Spoken English"></textarea>
          <p className="text-xs text-gray-500 mt-1">List any skills you have, even if they seem small.</p>
        </div>

        <div>
          <label htmlFor="aspiration" className="block text-sm font-medium text-gray-700 mb-1">What is your career aspiration?</label>
          <input type="text" name="aspiration" id="aspiration" value={profile.aspiration} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition" placeholder="e.g., Become a certified electrician, Work as a digital marketer" />
        </div>

        <div>
          <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">Preferred Language for Learning</label>
          <select name="language" id="language" value={profile.language} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition bg-white">
            {languages.map(lang => <option key={lang} value={lang}>{lang}</option>)}
          </select>
        </div>

        <div>
          <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-transform transform hover:scale-105">
            Generate My Learning Path
          </button>
        </div>
      </form>
    </div>
  );
};

export default LearnerProfileForm;
