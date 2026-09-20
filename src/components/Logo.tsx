import { motion } from 'framer-motion';

export default function Logo({ className = "", onClick }: { className?: string, onClick?: () => void }) {
  return (
    <motion.div 
      className={`flex items-center gap-2.5 group cursor-pointer select-none ${className}`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => {
        if (onClick) onClick();
        else window.location.href = "/";
      }}
    >
      <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-[#CF9EFF] to-[#a874e0] shadow-[0_0_15px_rgba(207,158,255,0.3)] group-hover:shadow-[0_0_25px_rgba(207,158,255,0.5)] transition-shadow duration-300">
        {/* Abstract premium sound wave / voice icon */}
        <div className="flex items-center justify-center gap-[2px] h-4">
          <motion.div 
            className="w-1 bg-[#120F17] rounded-full"
            animate={{ height: ["40%", "100%", "40%"] }}
            transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
          />
          <motion.div 
            className="w-1 bg-[#120F17] rounded-full"
            animate={{ height: ["100%", "40%", "100%"] }}
            transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut", delay: 0.2 }}
          />
          <motion.div 
            className="w-1 bg-[#120F17] rounded-full"
            animate={{ height: ["40%", "80%", "40%"] }}
            transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut", delay: 0.4 }}
          />
        </div>
      </div>
      <span className="font-extrabold text-2xl tracking-tight text-white flex items-center">
        Ur<span className="text-[#CF9EFF] drop-shadow-[0_0_8px_rgba(207,158,255,0.3)]">Voice</span>
      </span>
    </motion.div>
  );
}
