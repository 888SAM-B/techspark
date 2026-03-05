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
    
    // Type assertion to access libraries from window object
    const { jsPDF } = (window as any).jspdf;
    const html2canvas = (window as any).html2canvas;

    try {
        const canvas = await html2canvas(certificateElement, { 
            scale: 2,
            useCORS: true,
            backgroundColor: '#ffffff'
        });
        const imgData = canvas.toDataURL('image/png');
        
        const pdf = new jsPDF({
            orientation: 'landscape',
            unit: 'px',
            format: [canvas.width, canvas.height]
        });

        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
        
        const fileName = `Certificate-${user.profile?.name || user.username}.pdf`.replace(/\s+/g, '_');
        pdf.save(fileName);

    } catch (error) {
        console.error("Error generating PDF:", error);
        alert("Sorry, there was an error creating the PDF. Please try again.");
    } finally {
        setIsDownloading(false);
    }
  };


  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
       <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Sacramento&display=swap');
        
        .font-serif-display { font-family: 'Playfair Display', serif; }
        .font-script { font-family: 'Sacramento', cursive; }

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
            transform: scale(0.95); /* Adjust scale for printing */
          }
          .no-print {
            display: none;
          }
        }
      `}</style>
      <div className="no-print mb-6">
        <button 
            onClick={onBackToDashboard}
            className="inline-flex items-center gap-2 text-indigo-600 font-semibold hover:text-indigo-800 transition-colors"
            aria-label="Go back to the dashboard"
        >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            Back to Dashboard
        </button>
      </div>
      
      <div id="certificate-to-download" className="bg-white aspect-[1.414/1] w-full shadow-2xl">
        <div className="certificate-container w-full h-full p-2 bg-indigo-50">
            <div className="w-full h-full p-4 border-2 border-amber-400 bg-white relative flex flex-col justify-between">
                
                {/* Watermark */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="h-2/3 w-2/3 text-gray-100" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
                    </svg>
                </div>
                
                <div className="relative z-10 text-center pt-4">
                    <h1 className="font-serif-display text-4xl sm:text-5xl font-bold text-gray-800">Certificate of Achievement</h1>
                    <p className="mt-4 text-sm sm:text-base text-gray-600">This certificate is proudly presented to</p>
                    <p className="font-script mt-2 text-5xl sm:text-7xl text-indigo-700">{user.profile?.name || user.username}</p>
                    <div className="mt-2 w-1/3 h-px bg-amber-400 mx-auto"></div>
                    <p className="mt-4 text-sm sm:text-base text-gray-600">in recognition of the successful completion of the learning pathway</p>
                    <h2 className="mt-1 text-xl sm:text-2xl font-bold text-gray-900">{pathway.pathwayTitle}</h2>
                    {isLoadingPraise ? (
                        <div className="h-10 mt-4 flex items-center justify-center"><LoadingSpinner /></div>
                    ) : (
                        <p className="text-xs sm:text-sm text-gray-500 italic max-w-xl mx-auto mt-4">"{praise}"</p>
                    )}
                </div>

                <div className="relative z-10 flex items-end justify-between px-4 sm:px-8 pb-4">
                    <div className="text-left">
                        {/* QR Code Placeholder */}
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" viewBox="0 0 100 100">
                           <path fill="#111827" d="M10 10h25v25h-25z M45 10h10v10h-10z M65 10h25v25h-25z M10 45h10v10h-10z M25 45h10v10h-10z M40 45h10v10h-10z M55 45h10v10h-10z M70 45h10v10h-10z M10 65h25v25h-25z M45 65h10v10h-10z M65 65h25v25h-25z M45 30h10v10h-10z M30 55h10v10h-10z M45 80h10v10h-10z M60 30h10v10h-10z" />
                        </svg>
                        <p className="text-xs text-gray-500 mt-1">Scan to Verify</p>
                    </div>

                    <div className="text-center">
                        <p className="font-semibold text-gray-800 border-b-2 border-gray-300 pb-1">{result.completionDate}</p>
                        <p className="text-xs text-gray-600 mt-1">Date of Completion</p>
                    </div>

                    {/* Official Seal */}
                    <div className="w-24 h-24 sm:w-28 sm:h-28 relative">
                        <svg viewBox="0 0 100 100" className="w-full h-full">
                            <defs>
                                <path id="circlePath" d="M 50, 50 m -35, 0 a 35,35 0 1,1 70,0 a 35,35 0 1,1 -70,0" />
                            </defs>
                            <circle cx="50" cy="50" r="48" fill="#e0e7ff"/>
                            <circle cx="50" cy="50" r="45" fill="#ffffff" stroke="#c7d2fe" strokeWidth="1"/>
                            <g>
                                <text fill="#4338ca" className="text-[8px] font-semibold uppercase tracking-wider">
                                    <textPath href="#circlePath" startOffset="50%" textAnchor="middle">
                                        AI Skilling Pathfinder India • Certified Learner
                                    </textPath>
                                </text>
                            </g>
                            <circle cx="50" cy="50" r="30" fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4 2"/>
                            <svg className="text-indigo-600" x="35" y="35" width="30" height="30" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </svg>
                    </div>

                    <div className="text-center">
                        <p className="font-script text-3xl text-gray-700">A.I. Pathfinder</p>
                        <p className="font-semibold text-gray-800 border-b-2 border-gray-300 pb-1"></p>
                        <p className="text-xs text-gray-600 mt-1">Program Director</p>
                    </div>
                </div>
            </div>
        </div>
      </div>
      
      <div className="no-print text-center mt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
        <button
          onClick={handlePrint}
          className="w-full sm:w-auto px-8 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
        >
          Print Certificate
        </button>
        <button
          onClick={handleDownloadPdf}
          disabled={isDownloading}
          className="w-full sm:w-auto px-8 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isDownloading ? 'Downloading...' : 'Download as PDF'}
        </button>
      </div>
    </div>
  );
};

export default Certificate;
