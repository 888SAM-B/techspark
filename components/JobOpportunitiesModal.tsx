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

const JobOpportunitiesModal: React.FC<Props> = ({
  isOpen,
  onClose,
  jobs,
  sources,
  isLoading,
  error,
  stepTitle,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex justify-center items-center p-4 animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="job-modal-title"
    >
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-[#EAE2D6] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex justify-between items-center p-6 border-b border-[#EAE2D6] bg-[#F7F2EB]">
          <div>
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#ECF0E6] text-[#5C6A44] text-[10px] font-bold uppercase tracking-wider mb-1">
              Google Grounded Job Matching
            </div>
            <h2 id="job-modal-title" className="text-xl sm:text-2xl font-extrabold text-[#1B2615]">
              Live Career Prospects
            </h2>
            <p className="text-xs text-[#5C6A44] mt-0.5">Matching skills gained from "{stepTitle}"</p>
          </div>
          <button
            onClick={onClose}
            className="text-[#758458] hover:text-[#1B2615] p-2 rounded-xl hover:bg-white transition"
            aria-label="Close job opportunities modal"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        <main className="p-6 overflow-y-auto bg-[#F6F8F3]">
          {isLoading && (
            <div className="text-center p-12">
              <LoadingSpinner />
              <h2 className="text-lg font-bold text-[#1B2615] mt-6">Searching Real-Time Job Openings...</h2>
              <p className="text-xs text-[#5C6A44] mt-1.5">
                Scanning Indian portals for verified entry-level and fresher vacancies.
              </p>
            </div>
          )}

          {error && (
            <div className="text-center p-8 bg-red-50 border border-red-200 rounded-2xl">
              <p className="text-red-700 text-sm font-semibold">{error}</p>
            </div>
          )}

          {!isLoading && !error && jobs && (
            <div className="space-y-4">
              {jobs.length > 0 ? (
                <>
                  {jobs.map((job, index) => (
                    <div
                      key={index}
                      className="bg-white border border-[#EAE2D6] rounded-2xl p-5 shadow-xs hover:border-[#8B9A6E] transition-all"
                    >
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-[#1B2615]">{job.jobTitle}</h3>
                          <div className="flex items-center gap-1.5 text-xs text-[#5C6A44] mt-1">
                            <BriefcaseIcon className="w-4 h-4 text-[#8B9A6E]" />
                            <span className="font-bold text-[#465134]">{job.companyName}</span>
                          </div>
                        </div>
                        {job.url && (
                          <a
                            href={job.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl text-white bg-[#8B9A6E] hover:bg-[#758458] shadow-sm transition"
                          >
                            <span>Apply / View</span>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-4.5 0V6.375c0-.621.504-1.125 1.125-1.125h4.125c.621 0 1.125.504 1.125 1.125V10.5m-4.5 0h4.5" />
                            </svg>
                          </a>
                        )}
                      </div>

                      <p className="text-[#5C6A44] mt-3 text-xs sm:text-sm leading-relaxed">{job.jobDescription}</p>

                      <div className="mt-4 pt-3 border-t border-[#EAE2D6] space-y-2.5">
                        {job.minimumQualifications && (
                          <div>
                            <span className="text-[10px] font-bold text-[#758458] uppercase tracking-wider">
                              Qualifications:
                            </span>
                            <span className="text-xs text-[#1B2615] ml-2 font-medium">
                              {job.minimumQualifications}
                            </span>
                          </div>
                        )}
                        <div>
                          <span className="text-[10px] font-bold text-[#758458] uppercase tracking-wider">
                            Required Skills:
                          </span>
                          <div className="flex flex-wrap gap-1.5 mt-1.5">
                            {job.requiredSkills && Array.isArray(job.requiredSkills) && job.requiredSkills.length > 0 ? (
                              job.requiredSkills.map((skill, skillIndex) => (
                                <span
                                  key={skillIndex}
                                  className="bg-[#ECF0E6] text-[#465134] text-[11px] font-semibold px-2.5 py-0.5 rounded-lg border border-[#DBE3CF]"
                                >
                                  {skill}
                                </span>
                              ))
                            ) : (
                              <span className="text-xs text-[#758458] italic">General entry-level requirements</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {sources && sources.length > 0 && (
                    <div className="pt-4 border-t border-[#EAE2D6]">
                      <h4 className="text-xs font-bold text-[#465134] mb-2 uppercase tracking-wider">
                        Search Verification Sources
                      </h4>
                      <ul className="space-y-1">
                        {sources.map(
                          (source, index) =>
                            source.web && (
                              <li key={index} className="text-[11px] text-[#5C6A44] flex items-center gap-2 truncate">
                                <span className="text-[#8B9A6E]">&bull;</span>
                                <a
                                  href={source.web.uri}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="hover:underline text-[#5C6A44] truncate"
                                >
                                  {source.web.title || source.web.uri}
                                </a>
                              </li>
                            )
                        )}
                      </ul>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center p-10 bg-white rounded-2xl border border-[#EAE2D6]">
                  <p className="text-sm font-bold text-[#1B2615]">No immediate openings found</p>
                  <p className="text-xs text-[#5C6A44] mt-1">
                    No active fresher vacancies were found for this specific module right now. Check back as new jobs are posted!
                  </p>
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