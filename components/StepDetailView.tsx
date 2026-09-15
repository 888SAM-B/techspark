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

/** Converts markdown text to safe HTML with full formatting support */
const renderMarkdown = (md: string): string => {
  if (!md) return '';

  // Escape raw HTML to prevent XSS, but we'll reintroduce allowed tags below
  const escape = (str: string) =>
    str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  // Process inline formatting on a line of text (bold, italic, inline code)
  const inlineFormat = (line: string): string => {
    return escape(line)
      // Bold+Italic: ***text***
      .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
      // Bold: **text** or __text__
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/__(.*?)__/g, '<strong>$1</strong>')
      // Italic: *text* or _text_
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/_(.*?)_/g, '<em>$1</em>')
      // Inline code: `code`
      .replace(/`([^`]+)`/g, '<code class="bg-[#F0EDE8] text-[#2C3420] px-1.5 py-0.5 rounded text-sm font-mono">$1</code>');
  };

  const lines = md.split('\n');
  const html: string[] = [];
  let inCodeBlock = false;
  let codeLines: string[] = [];
  let inList = false;
  let listType: 'ul' | 'ol' | null = null;

  const closeList = () => {
    if (inList && listType) {
      html.push(listType === 'ul' ? '</ul>' : '</ol>');
      inList = false;
      listType = null;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const trimmed = raw.trim();

    // ---- Code block fence ----
    if (trimmed.startsWith('```')) {
      if (!inCodeBlock) {
        closeList();
        inCodeBlock = true;
        codeLines = [];
      } else {
        html.push(
          `<pre class="bg-[#1B2615] text-[#ECF0E6] rounded-xl p-4 overflow-x-auto text-sm font-mono my-4 leading-relaxed"><code>${escape(codeLines.join('\n'))}</code></pre>`
        );
        inCodeBlock = false;
        codeLines = [];
      }
      continue;
    }

    if (inCodeBlock) {
      codeLines.push(raw);
      continue;
    }

    // ---- Horizontal rule ----
    if (/^---+$/.test(trimmed) || /^\*\*\*+$/.test(trimmed)) {
      closeList();
      html.push('<hr class="my-6 border-[#EAE2D6]" />');
      continue;
    }

    // ---- Headings ----
    if (trimmed.startsWith('### ')) {
      closeList();
      html.push(`<h3 class="text-base sm:text-lg font-bold text-[#1B2615] mt-6 mb-2">${inlineFormat(trimmed.slice(4))}</h3>`);
      continue;
    }
    if (trimmed.startsWith('## ')) {
      closeList();
      html.push(`<h2 class="text-xl sm:text-2xl font-extrabold text-[#1B2615] mt-8 mb-3 pb-2 border-b border-[#EAE2D6]">${inlineFormat(trimmed.slice(3))}</h2>`);
      continue;
    }
    if (trimmed.startsWith('# ')) {
      closeList();
      html.push(`<h1 class="text-2xl sm:text-3xl font-extrabold text-[#1B2615] mt-8 mb-4 pb-2 border-b-2 border-[#8B9A6E]">${inlineFormat(trimmed.slice(2))}</h1>`);
      continue;
    }

    // ---- Numbered list: "1. item" ----
    const numberedMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
    if (numberedMatch) {
      if (!inList || listType !== 'ol') {
        closeList();
        html.push('<ol class="list-decimal list-outside ml-6 space-y-2 my-3 text-[#2C3420]">');
        inList = true;
        listType = 'ol';
      }
      html.push(`<li class="leading-relaxed">${inlineFormat(numberedMatch[2])}</li>`);
      continue;
    }

    // ---- Bullet list: "- item" or "* item" ----
    const bulletMatch = trimmed.match(/^[-*+]\s+(.*)/);
    if (bulletMatch) {
      if (!inList || listType !== 'ul') {
        closeList();
        html.push('<ul class="list-disc list-outside ml-6 space-y-2 my-3 text-[#2C3420]">');
        inList = true;
        listType = 'ul';
      }
      html.push(`<li class="leading-relaxed">${inlineFormat(bulletMatch[1])}</li>`);
      continue;
    }

    // ---- Empty line ----
    if (trimmed === '') {
      closeList();
      html.push('');
      continue;
    }

    // ---- Regular paragraph ----
    closeList();
    html.push(`<p class="leading-relaxed text-[#2C3420] my-2">${inlineFormat(trimmed)}</p>`);
  }

  closeList();
  return html.join('\n');
};

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
    window.scrollTo(0, 0);

    const fetchDetails = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const details = await generateStepDetails(step, profile.language);
        setContent(details);
      } catch (err) {
        console.error(err);
        setError('An error occurred while generating the learning material. Please go back and try again.');
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
    setJobOpportunities(null);
    setJobSources([]);
    try {
      const result: JobSearchResponse = await generateJobOpportunities(profile, step, pathway);
      setJobOpportunities(result.jobs);
      setJobSources(result.sources);
    } catch (err) {
      console.error(err);
      setJobError('An error occurred while fetching job opportunities. Please try again later.');
    } finally {
      setIsFetchingJobs(false);
    }
  };

  const handleSaveAsPdf = async () => {
    const contentElement = document.getElementById('learning-content');
    if (!contentElement) {
      console.error('Learning content element not found!');
      return;
    }

    setIsDownloadingPdf(true);

    const { jsPDF } = (window as any).jspdf;
    const html2canvas = (window as any).html2canvas;

    try {
      const canvas = await html2canvas(contentElement, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        windowWidth: contentElement.scrollWidth,
        windowHeight: contentElement.scrollHeight,
      });

      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const ratio = canvasWidth / pdfWidth;
      const scaledCanvasHeight = canvasHeight / ratio;

      let heightLeft = scaledCanvasHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, scaledCanvasHeight);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position -= pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, scaledCanvasHeight);
        heightLeft -= pdfHeight;
      }

      const fileName = `${step.title.replace(/[\s/]/g, '_')}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Sorry, there was an error creating the PDF. Please try again.');
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  return (
    <>
    <div className="max-w-4xl mx-auto animate-fade-in my-6">
      <div className="mb-6">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-[#5C6A44] font-bold text-sm hover:text-[#2C3420] transition-colors"
          aria-label="Go back to the dashboard"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Back to Dashboard
        </button>
      </div>

      <div className="bg-white p-6 sm:p-10 rounded-3xl shadow-sm border border-[#EAE2D6]">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-3">
          <div>
            <span className="text-[11px] font-bold inline-block py-0.5 px-3 uppercase rounded-full text-[#465134] bg-[#EAE2D6]">
              {step.stepType}
            </span>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#1B2615] tracking-tight mt-2">
              {step.title}
            </h1>
          </div>
          <div className="flex-shrink-0 w-full sm:w-auto flex flex-wrap sm:flex-nowrap items-stretch sm:items-center gap-2.5">
            <button
              onClick={handleExploreJobs}
              className="inline-flex items-center justify-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl transition-all text-[#2C3420] bg-[#F7F2EB] border border-[#EAE2D6] hover:bg-[#ECF0E6]"
            >
              <BriefcaseIcon className="w-4 h-4 text-[#8B9A6E]" />
              <span>Explore Jobs</span>
            </button>
            <button
              onClick={handleSaveAsPdf}
              disabled={isDownloadingPdf || !content}
              className="inline-flex items-center justify-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl transition-all text-[#2C3420] bg-[#F7F2EB] border border-[#EAE2D6] hover:bg-[#ECF0E6] disabled:opacity-50"
            >
              <DownloadIcon className="w-4 h-4 text-[#8B9A6E]" />
              <span>{isDownloadingPdf ? 'Saving...' : 'PDF Guide'}</span>
            </button>
            <button
              onClick={onToggleCompletion}
              className={`inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                isCompleted
                  ? 'bg-[#ECF0E6] text-[#2C3420] border border-[#C2D0B0]'
                  : 'bg-[#8B9A6E] text-white hover:bg-[#758458]'
              }`}
            >
              {isCompleted ? <CheckIcon className="w-4 h-4 text-[#8B9A6E]" /> : null}
              <span>{isCompleted ? 'Completed' : 'Mark Done'}</span>
            </button>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-[#5C6A44] mb-6 leading-relaxed">{step.description}</p>
        <hr className="my-6 border-[#EAE2D6]" />

        {isLoading && (
          <div className="text-center p-12">
            <LoadingSpinner />
            <h2 className="text-xl font-bold text-[#1B2615] mt-6">Generating Your Learning Material...</h2>
            <p className="text-xs text-[#5C6A44] mt-2">
              LearnMate AI is crafting a comprehensive beginner guide in {profile.language}.
            </p>
          </div>
        )}

        {error && (
          <div className="text-center p-8 bg-red-50 border border-red-200 rounded-2xl">
            <p className="text-red-700 text-sm font-semibold">{error}</p>
          </div>
        )}

        {!isLoading && content && (
          <div
            id="learning-content"
            className="max-w-none text-[#1B2615] leading-relaxed text-sm sm:text-base"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
          ></div>
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

    </div>

    {/* AI Bot FAB — bottom right */}
    <button
      onClick={() => setIsChatbotOpen(true)}
      aria-label="Open AI Tutor"
      title="Ask AI Tutor"
      className="fixed bottom-6 right-6 z-50 group
        w-14 h-14 rounded-full
        bg-[#8B9A6E] hover:bg-[#5C6A44]
        shadow-lg hover:shadow-xl
        flex items-center justify-center
        transition-all duration-200 hover:scale-110 active:scale-95
        focus:outline-none"
    >
      {/* Pulse ring */}
      <span className="absolute inset-0 rounded-full bg-[#8B9A6E] opacity-30 animate-ping" />
      {/* Bot face SVG */}
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 text-white relative z-10">
        <rect x="3" y="7" width="18" height="13" rx="3" />
        <path d="M8 7V5a2 2 0 0 1 4 0v2" />
        <circle cx="9" cy="13" r="1.2" fill="currentColor" stroke="none" />
        <circle cx="15" cy="13" r="1.2" fill="currentColor" stroke="none" />
        <path d="M9.5 17h5" strokeWidth={2} />
        <path d="M12 2v3" strokeWidth={2} />
      </svg>
      {/* Tooltip label on hover */}
      <span className="absolute right-16 bottom-3 bg-[#1B2615] text-white text-xs font-semibold px-3 py-1.5 rounded-lg
        opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none
        shadow-md">
        Ask AI Tutor
      </span>
    </button>

    <ChatbotModal
      isOpen={isChatbotOpen}
      onClose={() => setIsChatbotOpen(false)}
      step={step}
      language={profile.language}
    />
    </>
  );
};

export default StepDetailView;