import React, { useState, useEffect } from 'react';
import { PathwayStep, LearnerProfile, JobOpportunity, LearningPathwayData, JobSearchResponse, GroundingChunk } from '../types';
import { generateStepDetails, generateJobOpportunities } from '../services/geminiService';
import LoadingSpinner from './LoadingSpinner';
import { CheckIcon, BriefcaseIcon, ChatIcon, DownloadIcon } from './icons/StepIcons';
import JobOpportunitiesModal from './JobOpportunitiesModal';
import ChatbotModal from './ChatbotModal';


interface Props {
  step: PathwayStep;
  profile: LearnerProfile;
  pathway: LearningPathwayData;
  onBack: () => void;
  isCompleted: boolean;
  onToggleCompletion: () => void;
}

const StepDetailView: React.FC<Props> = ({ step, profile, pathway, onBack, isCompleted, onToggleCompletion }) => {
  const [content, setContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [isJobModalOpen, setIsJobModalOpen] = useState<boolean>(false);
  const [jobOpportunities, setJobOpportunities] = useState<JobOpportunity[] | null>(null);
  const [jobSources, setJobSources] = useState<GroundingChunk[]>([]);
  const [isFetchingJobs, setIsFetchingJobs] = useState<boolean>(false);
  const [jobError, setJobError] = useState<string | null>(null);
  
  const [isChatbotOpen, setIsChatbotOpen] = useState<boolean>(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState<boolean>(false);

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
    
    const fetchDetails = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const details = await generateStepDetails(step, profile.language);
        setContent(details);
      } catch (err) {
        console.error(err);
        setError("An error occurred while generating the learning material. Please go back and try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetails();
  }, [step, profile.language]);

  const handleExploreJobs = async () => {
    setIsJobModalOpen(true);
    setIsFetchingJobs(true);
    setJobError(null);
    setJobOpportunities(null); // Clear previous results
    setJobSources([]); // Clear previous sources
    try {
        const result: JobSearchResponse = await generateJobOpportunities(profile, step, pathway);
        setJobOpportunities(result.jobs);
        setJobSources(result.sources);
    } catch (err) {
        console.error(err);
        setJobError("An error occurred while fetching job opportunities. Please try again later.");
    } finally {
        setIsFetchingJobs(false);
    }
  };

  const handleSaveAsPdf = async () => {
    const contentElement = document.getElementById('learning-content');
    if (!contentElement) {
        console.error("Learning content element not found!");
        return;
    }

    setIsDownloadingPdf(true);

    const { jsPDF } = (window as any).jspdf;
    const html2canvas = (window as any).html2canvas;

    try {
        const canvas = await html2canvas(contentElement, { 
            scale: 2, // Higher scale for better quality
            useCORS: true,
            backgroundColor: '#ffffff',
            // These two are important to capture the full element, even if it's scrollable
            windowWidth: contentElement.scrollWidth,
            windowHeight: contentElement.scrollHeight,
        });

        const imgData = canvas.toDataURL('image/png', 1.0); // Use full quality PNG
        
        // A4 page size in points (jsPDF default unit)
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'pt',
            format: 'a4'
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();

        // Calculate the image dimensions to fit the PDF width
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const ratio = canvasWidth / pdfWidth;
        const scaledCanvasHeight = canvasHeight / ratio;

        let heightLeft = scaledCanvasHeight;
        let position = 0;

        // Add the first page
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, scaledCanvasHeight);
        heightLeft -= pdfHeight;

        // Add new pages if content overflows
        while (heightLeft > 0) {
            position -= pdfHeight; // Move the image "up" on the next page
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, scaledCanvasHeight);
            heightLeft -= pdfHeight;
        }
        
        const fileName = `${step.title.replace(/[\s/]/g, '_')}.pdf`;
        pdf.save(fileName);

    } catch (error) {
        console.error("Error generating PDF:", error);
        alert("Sorry, there was an error creating the PDF. Please try again.");
    } finally {
        setIsDownloadingPdf(false);
    }
  };


  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
        <div className="mb-6">
            <button 
                onClick={onBack}
                className="inline-flex items-center gap-2 text-indigo-600 font-semibold hover:text-indigo-800 transition-colors"
                aria-label="Go back to the dashboard"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
                Back to Dashboard
            </button>
        </div>
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg border border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-3">
                <div>
                    <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-indigo-600 bg-indigo-100">
                        {step.stepType}
                    </span>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight mt-2">{step.title}</h1>
                </div>
                <div className="flex-shrink-0 w-full sm:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <button
                        onClick={handleExploreJobs}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors text-indigo-700 bg-white border border-indigo-300 hover:bg-indigo-50"
                        aria-label={`Explore job opportunities for ${step.title}`}
                    >
                        <BriefcaseIcon className="w-5 h-5" />
                        <span>Explore Jobs</span>
                    </button>
                     <button
                        onClick={handleSaveAsPdf}
                        disabled={isDownloadingPdf || !content}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors text-indigo-700 bg-white border border-indigo-300 hover:bg-indigo-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label={`Save learning material for ${step.title} as PDF`}
                    >
                        <DownloadIcon className="w-5 h-5" />
                        <span>{isDownloadingPdf ? 'Saving...' : 'Save as PDF'}</span>
                    </button>
                    <button
                        onClick={onToggleCompletion}
                        aria-label={isCompleted ? `Mark '${step.title}' as incomplete` : `Mark '${step.title}' as complete`}
                        className={`inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${isCompleted ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
                    >
                        {isCompleted ? <CheckIcon className="w-5 h-5" /> : null}
                        <span>{isCompleted ? 'Completed' : 'Mark as Complete'}</span>
                    </button>
                </div>
            </div>
            <p className="text-gray-600 mb-6">{step.description}</p>
            <hr className="my-6 border-gray-200" />
            
            {isLoading && (
                <div className="text-center p-10">
                    <LoadingSpinner />
                    <h2 className="text-2xl font-semibold text-gray-700 mt-6">Generating Your Learning Material...</h2>
                    <p className="text-gray-500 mt-2">Our AI is crafting a detailed, A-to-Z guide for you in {profile.language}.</p>
                </div>
            )}

            {error && (
                <div className="text-center p-10 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600 font-semibold">{error}</p>
                </div>
            )}

            {!isLoading && content && (
                <div id="learning-content" className="prose prose-indigo max-w-none text-gray-800 whitespace-pre-wrap leading-relaxed space-y-4"
                     dangerouslySetInnerHTML={{ __html: content.replace(/## (.*?)\n/g, '<h2 class="text-2xl font-bold mt-6 mb-3">$1</h2>').replace(/\* (.*?)\n/g, '<li class="ml-5 list-disc">$1</li>') }}
                >
                </div>
            )}
        </div>
        <JobOpportunitiesModal 
            isOpen={isJobModalOpen}
            onClose={() => setIsJobModalOpen(false)}
            jobs={jobOpportunities}
            sources={jobSources}
            isLoading={isFetchingJobs}
            error={jobError}
            stepTitle={step.title}
        />
         <button
          onClick={() => setIsChatbotOpen(true)}
          className="fixed bottom-8 right-8 bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700 transition-transform transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 z-40"
          aria-label="Open learning assistant chatbot"
        >
          <ChatIcon className="w-8 h-8" />
        </button>

        <ChatbotModal
            isOpen={isChatbotOpen}
            onClose={() => setIsChatbotOpen(false)}
            step={step}
            language={profile.language}
        />
    </div>
  );
};

export default StepDetailView;