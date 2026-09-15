import React from 'react';
import { BriefcaseIcon, CourseIcon, CertificationIcon, ChatIcon, CheckIcon } from './icons/StepIcons';

interface LandingPageProps {
  onGetStarted: () => void;
  onSignIn: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onSignIn }) => {
  return (
    <div className="space-y-20 md:space-y-28 pb-16 animate-fade-in">
      {/* HERO SECTION */}
      <section className="relative pt-6 md:pt-12 text-center max-w-5xl mx-auto px-4">
        {/* Decorative Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#ECF0E6] border border-[#EAE2D6] text-[#465134] text-xs md:text-sm font-semibold mb-6 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-[#8B9A6E] animate-pulse"></span>
          Aligned with India’s NSQF & NCVET Skilling Frameworks
        </div>

        {/* Hero Title with LearnMate Brand Tagline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-[#1B2615] tracking-tight leading-[1.15] mb-6">
          Your Goal. Your Path. <br />
          <span className="text-[#8B9A6E]">AI-Powered</span> Vocational Skilling for India.
        </h1>

        <p className="text-lg md:text-xl text-[#465134] max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
          Whether you're a 10th/12th graduate, ITI student, or career switcher—LearnMate crafts an adaptive,
          multilingual learning pathway tailored to your aspirations, complete with an AI tutor and live job openings.
        </p>

        {/* Call to Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
          <button
            onClick={onGetStarted}
            className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-bold text-white bg-[#8B9A6E] hover:bg-[#758458] shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0"
          >
            Create Your Free Pathway
          </button>
          <button
            onClick={onSignIn}
            className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-bold text-[#2C3420] bg-white hover:bg-[#ECF0E6] border border-[#EAE2D6] shadow-sm transition-all"
          >
            Sign In to Existing Account
          </button>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 rounded-2xl bg-white border border-[#EAE2D6] shadow-sm max-w-4xl mx-auto">
          <div className="p-2 border-r border-[#EAE2D6] last:border-r-0">
            <div className="text-2xl md:text-3xl font-extrabold text-[#8B9A6E]">10+</div>
            <div className="text-xs md:text-sm text-[#5C6A44] font-medium mt-1">NSQF Levels Aligned</div>
          </div>
          <div className="p-2 md:border-r border-[#EAE2D6]">
            <div className="text-2xl md:text-3xl font-extrabold text-[#8B9A6E]">12+</div>
            <div className="text-xs md:text-sm text-[#5C6A44] font-medium mt-1">Indian Languages</div>
          </div>
          <div className="p-2 border-r border-[#EAE2D6] last:border-r-0">
            <div className="text-2xl md:text-3xl font-extrabold text-[#8B9A6E]">100%</div>
            <div className="text-xs md:text-sm text-[#5C6A44] font-medium mt-1">Free AI Personal Tutor</div>
          </div>
          <div className="p-2">
            <div className="text-2xl md:text-3xl font-extrabold text-[#8B9A6E]">Live</div>
            <div className="text-xs md:text-sm text-[#5C6A44] font-medium mt-1">Google Job Grounding</div>
          </div>
        </div>
      </section>

      {/* INTERACTIVE PREVIEW MOCKUP */}
      <section className="max-w-4xl mx-auto px-4">
        <div className="p-6 md:p-8 rounded-3xl bg-white border border-[#EAE2D6] shadow-lg relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#EAE2D6]">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#8B9A6E] bg-[#ECF0E6] px-3 py-1 rounded-full">
                Interactive Sample Pathway
              </span>
              <h3 className="text-2xl font-bold text-[#1B2615] mt-2">Solar PV Installation & Maintenance Technician</h3>
              <p className="text-sm text-[#5C6A44]">Tailored for ITI / 12th Pass • Language: Tamil / English • Duration: 12 Weeks</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-3 py-1 rounded-lg bg-[#F7F2EB] text-[#465134] border border-[#EAE2D6]">
                NSQF Level 4
              </span>
              <span className="text-xs font-semibold px-3 py-1 rounded-lg bg-[#8B9A6E] text-white">
                Active Simulation
              </span>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div className="p-4 rounded-xl bg-[#F6F8F3] border border-[#DBE3CF] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#8B9A6E] text-white flex items-center justify-center font-bold text-sm">
                  ✓
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#1B2615]">Phase 1: Electrical Fundamentals & Safety</h4>
                  <p className="text-xs text-[#5C6A44]">Basic AC/DC circuits, grounding, safety gear and tool handling</p>
                </div>
              </div>
              <span className="text-xs font-medium text-[#758458] hidden sm:inline">Completed</span>
            </div>

            <div className="p-4 rounded-xl bg-white border-2 border-[#8B9A6E] flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#758458] text-white flex items-center justify-center font-bold text-sm animate-pulse">
                  2
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#1B2615]">Phase 2: Solar Panel Mounting & Inverter Setup</h4>
                  <p className="text-xs text-[#5C6A44]">Rooftop alignment, MPPT inverters, battery banks and wiring</p>
                </div>
              </div>
              <span className="text-xs font-bold text-[#8B9A6E] bg-[#ECF0E6] px-2.5 py-1 rounded-md">In Progress</span>
            </div>

            <div className="p-4 rounded-xl bg-[#F7F2EB] border border-[#EAE2D6] opacity-75 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#EAE2D6] text-[#465134] flex items-center justify-center font-bold text-sm">
                  3
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#1B2615]">Phase 3: Soft Skills & Field Customer Communication</h4>
                  <p className="text-xs text-[#5C6A44]">Client handover, on-site troubleshooting communication</p>
                </div>
              </div>
              <span className="text-xs text-[#758458]">Next Up</span>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#EAE2D6] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#5C6A44]">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
              Live job matching searches top Indian recruitment portals automatically
            </div>
            <button
              onClick={onGetStarted}
              className="text-[#5C6A44] font-bold hover:text-[#2C3420] underline transition"
            >
              Generate your own pathway now &rarr;
            </button>
          </div>
        </div>
      </section>

      {/* CORE PILLARS / FEATURES */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-xs font-bold tracking-widest uppercase text-[#8B9A6E] mb-2">Designed For India’s Skilling Ecosystem</h2>
          <h3 className="text-3xl md:text-4xl font-extrabold text-[#1B2615]">
            Everything You Need To Build A Real Career
          </h3>
          <p className="text-[#5C6A44] mt-3">
            LearnMate bridges the gap between traditional vocational qualifications and high-demand industry employment.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 */}
          <div className="p-6 rounded-2xl bg-white border border-[#EAE2D6] hover:border-[#8B9A6E] transition-all hover:shadow-md group">
            <div className="w-12 h-12 rounded-xl bg-[#ECF0E6] text-[#8B9A6E] flex items-center justify-center mb-5 group-hover:bg-[#8B9A6E] group-hover:text-white transition-colors">
              <CourseIcon className="w-6 h-6" />
            </div>
            <h4 className="text-xl font-bold text-[#1B2615] mb-2">Adaptive Roadmaps</h4>
            <p className="text-sm text-[#5C6A44] leading-relaxed">
              Generates customized, multi-phase vocational pathways strictly aligned with NSQF standards and local industry requirements.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-6 rounded-2xl bg-white border border-[#EAE2D6] hover:border-[#8B9A6E] transition-all hover:shadow-md group">
            <div className="w-12 h-12 rounded-xl bg-[#ECF0E6] text-[#8B9A6E] flex items-center justify-center mb-5 group-hover:bg-[#8B9A6E] group-hover:text-white transition-colors">
              <ChatIcon className="w-6 h-6" />
            </div>
            <h4 className="text-xl font-bold text-[#1B2615] mb-2">Multilingual AI Tutor</h4>
            <p className="text-sm text-[#5C6A44] leading-relaxed">
              Ask questions and learn complex technical concepts in your preferred language—Tamil, Hindi, Telugu, Marathi, or English.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-6 rounded-2xl bg-white border border-[#EAE2D6] hover:border-[#8B9A6E] transition-all hover:shadow-md group">
            <div className="w-12 h-12 rounded-xl bg-[#ECF0E6] text-[#8B9A6E] flex items-center justify-center mb-5 group-hover:bg-[#8B9A6E] group-hover:text-white transition-colors">
              <BriefcaseIcon className="w-6 h-6" />
            </div>
            <h4 className="text-xl font-bold text-[#1B2615] mb-2">Live Job Grounding</h4>
            <p className="text-sm text-[#5C6A44] leading-relaxed">
              Directly scours verified live Indian job openings matching your newly gained skills using real-time Google Search grounding.
            </p>
          </div>

          {/* Card 4 */}
          <div className="p-6 rounded-2xl bg-white border border-[#EAE2D6] hover:border-[#8B9A6E] transition-all hover:shadow-md group">
            <div className="w-12 h-12 rounded-xl bg-[#ECF0E6] text-[#8B9A6E] flex items-center justify-center mb-5 group-hover:bg-[#8B9A6E] group-hover:text-white transition-colors">
              <CertificationIcon className="w-6 h-6" />
            </div>
            <h4 className="text-xl font-bold text-[#1B2615] mb-2">Official Certification</h4>
            <p className="text-sm text-[#5C6A44] leading-relaxed">
              Complete the comprehensive final assessment and earn an AI-endorsed certificate of completion ready for print and PDF export.
            </p>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="max-w-5xl mx-auto px-4 py-8">
        <div className="text-center max-w-xl mx-auto mb-14">
          <h2 className="text-xs font-bold tracking-widest uppercase text-[#8B9A6E] mb-2">Simple & Intuitive</h2>
          <h3 className="text-3xl md:text-4xl font-extrabold text-[#1B2615]">How LearnMate Works</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
          <div className="p-6 rounded-2xl bg-white border border-[#EAE2D6] relative">
            <div className="w-10 h-10 rounded-full bg-[#8B9A6E] text-white flex items-center justify-center font-bold mb-4">
              1
            </div>
            <h4 className="font-bold text-base text-[#1B2615] mb-1">Create Profile</h4>
            <p className="text-xs text-[#5C6A44] leading-relaxed">
              Enter your education (10th/12th/ITI), home state, current skills, and career aspiration.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-[#EAE2D6] relative">
            <div className="w-10 h-10 rounded-full bg-[#8B9A6E] text-white flex items-center justify-center font-bold mb-4">
              2
            </div>
            <h4 className="font-bold text-base text-[#1B2615] mb-1">AI Builds Roadmap</h4>
            <p className="text-xs text-[#5C6A44] leading-relaxed">
              Receive a phased syllabus covering foundational concepts, hands-on modules, and soft skills.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-[#EAE2D6] relative">
            <div className="w-10 h-10 rounded-full bg-[#8B9A6E] text-white flex items-center justify-center font-bold mb-4">
              3
            </div>
            <h4 className="font-bold text-base text-[#1B2615] mb-1">Master with AI Tutor</h4>
            <p className="text-xs text-[#5C6A44] leading-relaxed">
              Study step-by-step guides, ask doubts to your contextual AI tutor, and download topic PDFs.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-[#EAE2D6] relative">
            <div className="w-10 h-10 rounded-full bg-[#8B9A6E] text-white flex items-center justify-center font-bold mb-4">
              4
            </div>
            <h4 className="font-bold text-base text-[#1B2615] mb-1">Certify & Get Hired</h4>
            <p className="text-xs text-[#5C6A44] leading-relaxed">
              Pass the assessment quiz, download your certificate, and apply directly to live entry-level roles.
            </p>
          </div>
        </div>
      </section>

      {/* SUPPORTED CAREER STREAMS */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="p-8 md:p-12 rounded-3xl bg-[#F6F8F3] border border-[#DBE3CF] text-center">
          <h3 className="text-2xl md:text-3xl font-extrabold text-[#1B2615] mb-4">
            Pathways Available For Diverse Indian Sectors
          </h3>
          <p className="text-sm md:text-base text-[#5C6A44] max-w-2xl mx-auto mb-8">
            From industrial engineering trades to digital front-office opportunities, LearnMate supports paths for every ambition.
          </p>

          <div className="flex flex-wrap justify-center gap-3">
            {[
              'Solar PV Technician',
              'Electrician & Power Systems',
              'Digital Marketing Associate',
              'Hospital Patient Care Assistant',
              'CNC Operator & Turner',
              'Logistics & Warehouse Operations',
              'Automotive Service Specialist',
              'Data Entry & Office Operations',
              'HVAC & Refrigeration Tech',
              'Junior Web & Python Programmer',
            ].map((tag, idx) => (
              <span
                key={idx}
                className="px-4 py-2 rounded-full bg-white border border-[#EAE2D6] text-xs md:text-sm font-semibold text-[#2C3420] shadow-sm hover:border-[#8B9A6E] transition"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CALL TO ACTION */}
      <section className="max-w-4xl mx-auto px-4 text-center">
        <div className="p-10 md:p-14 rounded-3xl bg-[#8B9A6E] text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">
              Ready To Start Your Skilling Journey?
            </h3>
            <p className="text-base md:text-lg text-[#F7F2EB] max-w-xl mx-auto mb-8 opacity-95">
              Take charge of your career today. It only takes 2 minutes to generate your tailored vocational learning path.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button
                onClick={onGetStarted}
                className="px-8 py-4 rounded-xl text-base font-bold bg-[#F7F2EB] text-[#2C3420] hover:bg-white shadow-md transition-all"
              >
                Get Started for Free
              </button>
              <button
                onClick={onSignIn}
                className="px-8 py-4 rounded-xl text-base font-bold text-white border border-white/40 hover:bg-white/10 transition-all"
              >
                I Already Have An Account
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="max-w-5xl mx-auto px-4 pt-12 border-t border-[#EAE2D6] text-center text-xs text-[#758458]">
        <div className="flex items-center justify-center gap-3 mb-4">
          <img src="/lm-logo.png" alt="LearnMate" className="h-8 w-auto object-contain" />
          <span className="font-bold text-[#1B2615] text-sm">LearnMate</span>
        </div>
        <p className="mb-2">Your Goal. Your Path. Empowering Indian Vocational Talent with Artificial Intelligence.</p>
        <p>&copy; {new Date().getFullYear()} LearnMate. Made with dedication for Skilling India.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
