import React, { useState, useEffect } from 'react';
import { User, LearningPathwayData, QuizResult } from '../types';
import { generateCertificatePraise } from '../services/geminiService';
import LoadingSpinner from './LoadingSpinner';

interface Props {
  user: User;
  pathway: LearningPathwayData;
  result: QuizResult;
  onBackToDashboard: () => void;
}

const Certificate: React.FC<Props> = ({ user, pathway, result, onBackToDashboard }) => {
  const [praise, setPraise] = useState('');
  const [isLoadingPraise, setIsLoadingPraise] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (user.profile) {
      generateCertificatePraise(user.profile, pathway)
        .then(setPraise)
        .finally(() => setIsLoadingPraise(false));
    }
  }, [user.profile, pathway]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    const certificateElement = document.getElementById('certificate-to-download');
    if (!certificateElement) return;

    setIsDownloading(true);

    const { jsPDF } = (window as any).jspdf;
    const html2canvas = (window as any).html2canvas;

    try {
      const canvas = await html2canvas(certificateElement, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      });
      const imgData = canvas.toDataURL('image/png');

      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width, canvas.height],
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);

      const fileName = `LearnMate-Certificate-${user.profile?.name || user.username}.pdf`.replace(/\s+/g, '_');
      pdf.save(fileName);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Sorry, there was an error creating the PDF. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in my-6">
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #certificate-to-download, #certificate-to-download * {
            visibility: visible;
          }
          #certificate-to-download {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            margin: 0;
            padding: 0;
            transform: scale(0.95);
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="no-print mb-6">
        <button
          onClick={onBackToDashboard}
          className="inline-flex items-center gap-2 text-[#5C6A44] font-bold text-sm hover:text-[#2C3420] transition-colors"
          aria-label="Go back to the dashboard"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Back to Dashboard
        </button>
      </div>

      <div id="certificate-to-download" className="bg-white aspect-[1.414/1] w-full shadow-2xl rounded-sm">
        <div className="certificate-container w-full h-full p-3 bg-[#ECF0E6]">
          <div className="w-full h-full p-6 sm:p-8 border-4 border-[#8B9A6E] bg-[#FFFFFF] relative flex flex-col justify-between">
            {/* Watermark Logo */}
            <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
              <img src="/lm-logo.png" alt="" className="h-3/4 w-auto object-contain" />
            </div>

            <div className="relative z-10 text-center pt-2">
              <div className="flex items-center justify-center gap-2 mb-2">
                <img src="/lm-logo.png" alt="LearnMate" className="h-8 w-auto object-contain" />
                <span className="font-extrabold text-sm tracking-wider uppercase text-[#5C6A44]">LearnMate • India</span>
              </div>
              <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#1B2615] tracking-tight">
                Certificate of Completion
              </h1>
              <p className="mt-3 text-xs sm:text-sm text-[#5C6A44] font-medium">This certificate is proudly awarded to</p>
              <p className="font-script mt-2 text-5xl sm:text-7xl text-[#8B9A6E] drop-shadow-sm">
                {user.profile?.name || user.username}
              </p>
              <div className="mt-2 w-1/3 h-0.5 bg-[#EAE2D6] mx-auto"></div>
              <p className="mt-3 text-xs sm:text-sm text-[#5C6A44]">
                for successfully completing the adaptive vocational skilling curriculum
              </p>
              <h2 className="mt-1 text-lg sm:text-2xl font-bold text-[#1B2615]">{pathway.pathwayTitle}</h2>

              {isLoadingPraise ? (
                <div className="h-8 mt-3 flex items-center justify-center">
                  <LoadingSpinner />
                </div>
              ) : (
                <p className="text-[11px] sm:text-xs text-[#758458] italic max-w-xl mx-auto mt-3 px-4">
                  "{praise}"
                </p>
              )}
            </div>

            <div className="relative z-10 flex items-end justify-between px-2 sm:px-8 pb-2">
              <div className="text-left">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-[#2C3420]" viewBox="0 0 100 100">
                  <path
                    fill="currentColor"
                    d="M10 10h25v25h-25z M45 10h10v10h-10z M65 10h25v25h-25z M10 45h10v10h-10z M25 45h10v10h-10z M40 45h10v10h-10z M55 45h10v10h-10z M70 45h10v10h-10z M10 65h25v25h-25z M45 65h10v10h-10z M65 65h25v25h-25z M45 30h10v10h-10z M30 55h10v10h-10z M45 80h10v10h-10z M60 30h10v10h-10z"
                  />
                </svg>
                <p className="text-[10px] text-[#758458] mt-1 font-semibold">Verified Digital Credential</p>
              </div>

              <div className="text-center">
                <p className="font-bold text-xs sm:text-sm text-[#1B2615] border-b border-[#DBE3CF] pb-1">
                  {result.completionDate}
                </p>
                <p className="text-[10px] text-[#758458] mt-1">Date Awarded</p>
              </div>

              {/* Official Seal */}
              <div className="w-20 h-20 sm:w-24 sm:h-24 relative">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <defs>
                    <path id="sealCircle" d="M 50, 50 m -35, 0 a 35,35 0 1,1 70,0 a 35,35 0 1,1 -70,0" />
                  </defs>
                  <circle cx="50" cy="50" r="48" fill="#ECF0E6" />
                  <circle cx="50" cy="50" r="44" fill="#ffffff" stroke="#C2D0B0" strokeWidth="1" />
                  <g>
                    <text fill="#5C6A44" className="text-[7.5px] font-bold uppercase tracking-wider">
                      <textPath href="#sealCircle" startOffset="50%" textAnchor="middle">
                        LearnMate India • Certified Graduate
                      </textPath>
                    </text>
                  </g>
                  <circle cx="50" cy="50" r="28" fill="none" stroke="#8B9A6E" strokeWidth="1.5" strokeDasharray="3 2" />
                  <svg className="text-[#8B9A6E]" x="36" y="36" width="28" height="28" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </svg>
              </div>

              <div className="text-center">
                <p className="font-script text-2xl text-[#1B2615]">LearnMate AI</p>
                <p className="font-bold text-xs sm:text-sm text-[#1B2615] border-b border-[#DBE3CF] pb-1"></p>
                <p className="text-[10px] text-[#758458] mt-1">Academic Advisor</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="no-print text-center mt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
        <button
          onClick={handlePrint}
          className="w-full sm:w-auto px-6 py-3 bg-white text-[#2C3420] border border-[#EAE2D6] font-bold text-sm rounded-xl shadow-sm hover:bg-[#F7F2EB] transition"
        >
          Print Certificate
        </button>
        <button
          onClick={handleDownloadPdf}
          disabled={isDownloading}
          className="w-full sm:w-auto px-8 py-3 bg-[#8B9A6E] hover:bg-[#758458] text-white font-bold text-sm rounded-xl shadow-md transition disabled:opacity-50"
        >
          {isDownloading ? 'Generating PDF...' : 'Download as PDF'}
        </button>
      </div>
    </div>
  );
};

export default Certificate;
