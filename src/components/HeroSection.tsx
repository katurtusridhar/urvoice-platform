import { motion } from 'framer-motion';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { useRef, useState, useEffect } from 'react';

export default function HeroSection() {
  const revealImgRef = useRef<HTMLImageElement>(null);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    // Only show the background image on screens larger than 1024px (Desktop)
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  const scrollToForm = () => {
    document.getElementById('report-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToStory = () => {
    document.getElementById('story-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDesktop) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const el = revealImgRef.current;
    if (el) {
      el.style.setProperty('--mx', `${x}px`);
      el.style.setProperty('--my', `${y + rect.height * 0.1}px`);
      el.style.transformOrigin = `${x}px ${y + rect.height * 0.1}px`;
      el.style.transform = 'scale(1.15)';
    }
  };

  const handleMouseLeave = () => {
    if (!isDesktop) return;
    const el = revealImgRef.current;
    if (el) {
      el.style.setProperty('--mx', '-9999px');
      el.style.setProperty('--my', '-9999px');
      el.style.transform = 'scale(1)';
    }
  };

  return (
    <section 
      className="relative min-h-[100svh] flex flex-col justify-center items-center overflow-hidden bg-[#120F17] text-white pt-16 md:pt-20"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {isDesktop && (
        <img
          ref={revealImgRef}
          src="/campus-bg.jpg"
          alt="Reveal effect"
          style={{
          display: isDesktop ? 'block' : 'none',
          position: 'absolute',
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          top: '0',
          left: '0',
          zIndex: 5,
          mixBlendMode: 'lighten',
          opacity: 0.85,
          pointerEvents: 'none',
          transition: 'transform 0.1s ease-out',
          transform: 'scale(1)',
          '--mx': '-9999px',
          '--my': '-9999px',
          WebkitMaskImage: 'radial-gradient(circle at var(--mx) var(--my), rgba(255,255,255,1) 0px, rgba(255,255,255,0.95) 80px, rgba(255,255,255,0.6) 180px, rgba(255,255,255,0.25) 280px, rgba(255,255,255,0) 380px)',
          maskImage: 'radial-gradient(circle at var(--mx) var(--my), rgba(255,255,255,1) 0px, rgba(255,255,255,0.95) 80px, rgba(255,255,255,0.6) 180px, rgba(255,255,255,0.25) 280px, rgba(255,255,255,0) 380px)',
          WebkitMaskRepeat: 'no-repeat',
          maskRepeat: 'no-repeat'
        } as any}
      />
      )}

      <motion.div 
        className="relative z-10 w-full max-w-3xl lg:max-w-4xl mx-auto px-4 sm:px-6 pointer-events-auto"
      >

        <motion.div 
          className="relative bg-[#1c1825]/60 backdrop-blur-xl rounded-[2rem] sm:rounded-3xl shadow-[0_0_40px_rgba(207,158,255,0.2)] md:shadow-[0_0_60px_rgba(207,158,255,0.25)] transition-all duration-700 hover:shadow-[0_0_60px_rgba(207,158,255,0.3)] md:hover:shadow-[0_0_80px_rgba(207,158,255,0.35)] w-full"
        >
          {/* Animated Border Glow Layer */}
          <div 
            className="absolute inset-0 rounded-[2rem] sm:rounded-3xl pointer-events-none"
            style={{
              border: '2px solid transparent',
              WebkitMask: 'linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)',
              WebkitMaskComposite: 'xor',
              maskComposite: 'exclude'
            }}
          >
            <div className="absolute inset-[-150%] animate-spin-slow bg-[conic-gradient(from_0deg_at_50%_50%,transparent_0%,#CF9EFF_15%,transparent_30%,transparent_50%,#CF9EFF_65%,transparent_80%)]" />
          </div>

          {/* Static Border Fallback */}
          <div className="absolute inset-0 rounded-[2rem] sm:rounded-3xl border border-[#CF9EFF]/30 pointer-events-none" />

          {/* Inner Content Layer */}
          <div className="relative z-10 py-8 px-4 sm:px-6 md:py-12 md:px-12 text-center flex flex-col items-center w-full">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="w-full"
            >
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-4 md:mb-6">
                Your campus.<br />
                <span className="text-[#CF9EFF]">Your voice.</span>
              </h1>
            </motion.div>

            <motion.p
              className="text-sm sm:text-base md:text-lg text-slate-300 mb-8 md:mb-10 max-w-[90%] md:max-w-2xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            >
              Tell us what isn't working at <span className="font-bold text-white">VIT-AP</span>. From everyday frustrations to serious concerns, every student voice matters.
            </motion.p>

            <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full px-2 sm:px-0"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          >
            <button 
              onClick={scrollToForm}
              className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 bg-[#CF9EFF] hover:bg-[#b983ef] text-[#120F17] font-bold rounded-full transition-all shadow-[0_0_15px_rgba(207,158,255,0.3)] sm:shadow-[0_0_20px_rgba(207,158,255,0.4)] hover:shadow-[0_0_25px_rgba(207,158,255,0.5)] transform hover:-translate-y-1 text-sm sm:text-base whitespace-nowrap"
            >
              Report a Problem
            </button>
            <button 
              onClick={scrollToStory}
              className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 bg-white/5 hover:bg-white/10 text-white font-medium rounded-full backdrop-blur-sm transition-all border border-white/10 hover:border-white/20 text-sm sm:text-base whitespace-nowrap"
            >
              How It Works
            </button>
          </motion.div>
          </div>
        </motion.div>
      </motion.div>

      <motion.div 
        className="absolute bottom-10 left-1/2 -translate-x-1/2 cursor-pointer z-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        onClick={scrollToStory}
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        >
          <ChevronDownIcon className="w-8 h-8 text-white/50" />
        </motion.div>
      </motion.div>
    </section>
  );
}
