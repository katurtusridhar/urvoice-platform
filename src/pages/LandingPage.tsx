import { useRef, useEffect, useState } from 'react';
import HeroSection from '../components/HeroSection';
import StorySection from '../components/StorySection';
import ReportForm from '../components/ReportForm';
import ImageTrail from '../components/ImageTrail';
import Logo from '../components/Logo';

const trailImages = [
  '/trail/1.jpg', '/trail/2.jpg', '/trail/3.jpg', '/trail/4.jpg', '/trail/5.jpg',
  '/trail/1.jpg', '/trail/2.jpg', '/trail/3.jpg', '/trail/4.jpg', '/trail/5.jpg',
  '/trail/1.jpg', '/trail/2.jpg', '/trail/3.jpg', '/trail/4.jpg', '/trail/5.jpg'
];

export default function LandingPage() {
  const sketchRef = useRef<HTMLDivElement>(null);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      // Only render the trail if the device has a fine pointer (mouse) and supports hover
      setIsDesktop(window.matchMedia('(hover: hover) and (pointer: fine)').matches);
    };
    
    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen font-sans bg-[#120F17]">
      {/* Premium Fixed Header */}
      <header className="fixed top-0 w-full z-[100] px-4 sm:px-8 py-4 flex justify-between items-center bg-gradient-to-b from-[#120F17]/90 to-transparent backdrop-blur-sm pointer-events-none">
        <div className="pointer-events-auto">
          <Logo onClick={scrollToTop} />
        </div>
        <div className="pointer-events-auto">
          <a href="/admin" className="px-5 py-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-sm font-medium border border-white/10 transition-colors backdrop-blur-md">
            Admin Portal
          </a>
        </div>
      </header>
      
      <HeroSection />
      
      <div 
        className="relative overflow-hidden"
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          const el = sketchRef.current;
          if (el) {
            el.style.setProperty('--mx', `${x}px`);
            el.style.setProperty('--my', `${y}px`);
          }
        }}
        onMouseLeave={() => {
          const el = sketchRef.current;
          if (el) {
            el.style.setProperty('--mx', '-9999px');
            el.style.setProperty('--my', '-9999px');
          }
        }}
      >
        {/* Sketch / Blueprint reveal layer - spans entire remainder of page */}
        <div 
          ref={sketchRef}
          className="absolute inset-0 z-10 pointer-events-none"
          style={{
            '--mx': '-9999px',
            '--my': '-9999px',
            WebkitMaskImage: 'radial-gradient(circle 300px at var(--mx) var(--my), black 0%, transparent 100%)',
            maskImage: 'radial-gradient(circle 300px at var(--mx) var(--my), black 0%, transparent 100%)',
            WebkitMaskRepeat: 'no-repeat',
            maskRepeat: 'no-repeat'
          } as any}
        >
          {/* Dot grid pattern */}
          <div 
            className="absolute inset-0 opacity-50" 
            style={{
              backgroundImage: 'radial-gradient(circle, #CF9EFF 1.5px, transparent 1.5px)',
              backgroundSize: '32px 32px',
              backgroundPosition: '0 0'
            }}
          />
          {/* Repeating faint campus watermark */}
          <div className="absolute inset-0 flex flex-wrap content-start items-start opacity-[0.03] pointer-events-none overflow-hidden">
             {Array.from({length: 100}).map((_, i) => (
                <div key={i} className="font-bold text-[#CF9EFF] text-6xl tracking-widest whitespace-nowrap p-10 rotate-[-10deg]">
                  VIT-AP STUDENT VOICE
                </div>
             ))}
          </div>
        </div>

        <div className="relative z-20">
          <StorySection />
          
          <div className="py-12 md:py-24 px-4 md:px-6 relative">
            {/* ImageTrail Container */}
            <div className="absolute inset-0 z-0 pointer-events-none hidden md:block">
              {isDesktop && <ImageTrail items={trailImages} variant={1} />}
            </div>
            
            <div className="relative z-10 pointer-events-auto">
              <ReportForm />
            </div>
          </div>
          
          <footer className="text-slate-400 py-8 text-center border-t border-white/5 relative z-20">
            <p>
              &copy; Made with ❤️ by{' '}
              <a 
                href="https://www.linkedin.com/in/katurtu-sridhar-rao-baitharu/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-[#CF9EFF] hover:text-white transition-colors hover:underline"
              >
                Sridhar
              </a>
            </p>
            <p className="text-sm mt-2"><a href="/admin" className="hover:text-brand-accent transition-colors">Admin Access</a></p>
          </footer>
        </div>
      </div>
    </div>
  );
}
