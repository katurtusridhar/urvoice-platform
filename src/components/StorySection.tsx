import { motion } from 'framer-motion';

const categories = [
  "Hostel", "Academics", "Food", "Transport",
  "Infrastructure", "Internet", "Administration", "Other"
];

export default function StorySection() {
  return (
    <section className="py-16 md:py-24 text-white" id="story-section">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16 md:mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-200 mb-8 tracking-tight leading-tight px-2"
          >
            Small problems become big problems<br className="hidden sm:block" />
            <span className="text-brand-accent/80 sm:ml-2">when nobody speaks.</span>
          </motion.h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 max-w-3xl mx-auto">
            {categories.map((category, idx) => (
              <motion.div
                key={category}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white/5 rounded-xl p-3 md:p-4 text-center text-slate-300 font-medium text-sm md:text-base flex items-center justify-center min-h-[3rem]"
              >
                {category}
              </motion.div>
            ))}
          </div>
        </div>

        <div className="relative mt-16 md:mt-32 bg-black/30 border border-white/10 rounded-[2rem] p-6 sm:p-8 md:p-12 text-center overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[#CF9EFF]/5 blur-[100px] pointer-events-none" />
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative z-10"
          >
            <h3 className="text-2xl sm:text-3xl md:text-5xl font-bold text-white mb-8 md:mb-10 leading-tight">
              One platform. Every student concern.
            </h3>
            
            <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-3 md:gap-4 text-slate-400 font-medium text-xs sm:text-sm md:text-base">
              <span className="px-3 md:px-4 py-2 bg-white/5 rounded-lg border border-white/5 whitespace-nowrap">Student</span>
              <span className="hidden sm:block w-3 md:w-8 h-[1px] bg-slate-700"></span>
              <span className="px-3 md:px-4 py-2 bg-white/5 rounded-lg border border-white/5 whitespace-nowrap">Report</span>
              <span className="hidden sm:block w-3 md:w-8 h-[1px] bg-slate-700"></span>
              <span className="px-3 md:px-4 py-2 bg-white/5 rounded-lg border border-white/5 whitespace-nowrap">Data</span>
              <span className="hidden sm:block w-3 md:w-8 h-[1px] bg-slate-700"></span>
              <span className="px-3 md:px-4 py-2 bg-white/5 rounded-lg border border-white/5 whitespace-nowrap">Insights</span>
              <span className="hidden sm:block w-3 md:w-8 h-[1px] bg-brand-accent/50"></span>
              <span className="px-3 md:px-4 py-2 bg-white/5 rounded-lg border border-white/5 text-[#CF9EFF] font-bold shadow-[0_0_15px_rgba(207,158,255,0.15)] whitespace-nowrap">Change</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
