import React from 'react';
import { JobOpportunity, GroundingChunk } from '../types';
import LoadingSpinner from './LoadingSpinner';
import { BriefcaseIcon } from './icons/StepIcons';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  jobs: JobOpportunity[] | null;
  sources: GroundingChunk[];
  isLoading: boolean;
  error: string | null;
  stepTitle: string;
}

const JobOpportunitiesModal: React.FC<Props> = ({ isOpen, onClose, jobs, sources, isLoading, error, stepTitle }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4 animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="job-modal-title"
    >
      <div 
        className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <header className="flex justify-between items-center p-6 border-b border-gray-200">
          <div>
            <h2 id="job-modal-title" className="text-2xl font-bold text-gray-900">Career Prospects</h2>
            <p className="text-sm text-gray-500">Based on completing "{stepTitle}"</p>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 transition"
            aria-label="Close job opportunities modal"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        <main className="p-6 overflow-y-auto">
          {isLoading && (
            <div className="text-center p-10">
              <LoadingSpinner />
              <h2 className="text-xl font-semibold text-gray-700 mt-6">Searching for Live Job Openings...</h2>
              <p className="text-gray-500 mt-2">Our AI is scanning the web for relevant entry-level and fresher roles for you.</p>
            </div>
          )}

          {error && (
            <div className="text-center p-10 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 font-semibold">{error}</p>
            </div>
          )}

          {!isLoading && !error && jobs && (
            <div className="space-y-6">
              {jobs.length > 0 ? (
                <>
                  {jobs.map((job, index) => (
                    <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-5 transition-shadow hover:shadow-md">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                            <h3 className="text-xl font-bold text-indigo-700">{job.jobTitle}</h3>
                            <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                                <BriefcaseIcon className="w-4 h-4" />
                                <span className="font-semibold">{job.companyName}</span>
                            </div>
                        </div>
                        {job.url && (
                          <a 
                              href={job.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex-shrink-0 inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors text-white bg-indigo-600 hover:bg-indigo-700"
                          >
                              View Posting
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-4.5 0V6.375c0-.621.504-1.125 1.125-1.125h4.125c.621 0 1.125.504 1.125 1.125V10.5m-4.5 0h4.5" />
                              </svg>
                          </a>
                        )}
                      </div>
                      <p className="text-gray-600 mt-3 text-sm leading-relaxed">{job.jobDescription}</p>

                      <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                        {job.minimumQualifications && (
                            <div>
                                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Qualifications</h4>
                                <p className="text-sm text-gray-800 mt-1">{job.minimumQualifications}</p>
                            </div>
                        )}
                        <div>
                            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Key Skills</h4>
                            <div className="flex flex-wrap gap-2 items-center mt-2">
                                {job.requiredSkills && Array.isArray(job.requiredSkills) && job.requiredSkills.length > 0 ? (
                                    job.requiredSkills.map((skill, skillIndex) => (
                                        <span key={skillIndex} className="bg-indigo-100 text-indigo-800 text-xs font-medium px-3 py-1 rounded-full">
                                            {skill}
                                        </span>
                                    ))
                                ) : (
                                    <span className="text-xs text-gray-500 italic">Not specified</span>
                                )}
                            </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {sources && sources.length > 0 && (
                    <div className="pt-6 mt-6 border-t border-gray-200">
                        <h4 className="text-sm font-bold text-gray-700 mb-3">Information Sources</h4>
                        <ul className="space-y-1">
                            {sources.map((source, index) => source.web && (
                                <li key={index} className="text-xs text-gray-600 flex items-start gap-2">
                                    <span className="mt-0.5">&bull;</span>
                                    <a href={source.web.uri} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline break-all">
                                        {source.web.title || source.web.uri}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                  )}
                </>
              ) : (
                 <div className="text-center p-10">
                    <p className="text-gray-600 font-semibold">No specific entry-level roles found.</p>
                    <p className="text-gray-500 mt-2 text-sm">The search didn't return any current job openings for this specific skill in your area. Try again later or complete more steps.</p>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default JobOpportunitiesModal;