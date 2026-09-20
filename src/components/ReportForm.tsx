import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { submitReport } from '../services/api';
import type { ReportCreate } from '../types';
import TrackReportModal from './TrackReportModal';

const defaultCategories = [
  "Academics", "Hostel", "Food", "Transportation", "Infrastructure", 
  "Faculty", "Administration", "Examinations", "Fees", "Internet & Technology", 
  "Clubs & Activities", "Campus Facilities", "Safety", "Other"
];

export default function ReportForm() {
  const { register, handleSubmit, formState: { errors, isSubmitting }, watch, reset } = useForm<ReportCreate>();
  const [categories] = useState(defaultCategories);
  const [isSuccess, setIsSuccess] = useState(false);
  const [serverError, setServerError] = useState('');
  const [generatedReportId, setGeneratedReportId] = useState<number | null>(null);
  const [isTrackModalOpen, setIsTrackModalOpen] = useState(false);

  const description = watch('description') || '';

  const onSubmit = async (data: ReportCreate) => {
    setServerError('');
    try {
      const report = await submitReport(data);
      setGeneratedReportId(report.id);
      setIsSuccess(true);
      reset();
    } catch (err: any) {
      setServerError(err.response?.data?.detail || "Something went wrong while submitting your report. Please try again.");
    }
  };

  if (isSuccess) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-4xl mx-auto p-6 sm:p-8 md:p-12 bg-[#1c1825]/90 rounded-[2rem] border border-white/10 relative z-10 backdrop-blur-xl shadow-2xl text-center flex flex-col justify-center items-center min-h-[400px]"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.2 }}
          className="w-20 h-20 bg-green-500/15 text-green-400 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/30"
        >
          <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </motion.div>
        <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">Report Submitted.</h3>
        <p className="text-slate-300 text-lg mb-8 max-w-lg mx-auto">Your voice has been successfully recorded.</p>
        
        <div className="bg-black/40 border border-white/5 rounded-2xl p-6 mb-8 w-full max-w-md shadow-inner">
          <p className="text-sm text-slate-400 uppercase tracking-wider font-bold mb-2">Your Tracking ID</p>
          <p className="text-3xl md:text-4xl font-mono text-[#CF9EFF] font-bold tracking-widest">{generatedReportId}</p>
          <p className="text-xs text-slate-500 mt-3">Please save this ID. You can use it along with your College ID to track the status of your report at any time.</p>
        </div>
        
        <button 
          onClick={() => {
            setIsSuccess(false);
            setGeneratedReportId(null);
          }}
          className="px-8 py-3 bg-white/5 hover:bg-white/10 text-white font-medium rounded-full transition-all border border-white/10 hover:border-white/20"
        >
          Submit another report
        </button>
      </motion.div>
    );
  }

  return (
    <>
      <div className="w-full max-w-4xl mx-auto p-6 sm:p-8 md:p-10 bg-[#1c1825]/90 rounded-[2rem] border border-white/10 relative z-10 backdrop-blur-xl shadow-2xl" id="report-form">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2">Report a Problem</h2>
            <p className="text-slate-400 text-sm sm:text-base">Your information is collected only to help understand and manage student concerns. Do not submit passwords, financial information, or other highly sensitive credentials.</p>
          </div>
          <button
            type="button"
            onClick={() => setIsTrackModalOpen(true)}
            className="w-full sm:w-auto shrink-0 px-5 py-2.5 bg-[#CF9EFF]/10 hover:bg-[#CF9EFF]/20 text-[#CF9EFF] text-sm font-medium rounded-xl transition-all border border-[#CF9EFF]/20 flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            Track Status
          </button>
        </div>

      {serverError && (
        <div className="mb-6 p-4 bg-red-900/30 text-red-400 rounded-lg text-sm border border-red-500/20">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Student Name</label>
            <input 
              type="text"
              {...register('student_name', { required: 'Name is required' })}
              className="w-full h-[50px] px-4 rounded-xl bg-black/40 border border-white/10 text-white placeholder-slate-500 focus:ring-2 focus:ring-brand-accent focus:border-brand-accent transition-all outline-none"
              placeholder="John Doe"
            />
            {errors.student_name && <p className="text-red-400 text-xs mt-1">{errors.student_name.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Student Email</label>
            <input 
              type="email"
              {...register('student_email', { 
                required: 'Email is required',
                validate: (value) => {
                  if (!value.endsWith('@vitap.ac.in') && !value.endsWith('@vitap.student.ac.in')) {
                    return "Must be a valid VIT-AP email address (e.g. @vitap.ac.in)";
                  }
                  return true;
                }
              })}
              className="w-full h-[50px] px-4 rounded-xl bg-black/40 border border-white/10 text-white placeholder-slate-500 focus:ring-2 focus:ring-brand-accent focus:border-brand-accent transition-all outline-none"
              placeholder="johndoe@vitap.ac.in"
            />
            {errors.student_email && <p className="text-red-400 text-xs mt-1">{errors.student_email.message}</p>}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">VIT-AP College ID</label>
            <input 
              type="text"
              {...register('college_id', { 
                required: 'College ID is required',
                validate: (value) => {
                  const idRegex = /^([1-9][0-9])([A-Za-z]{3})([0-9]{4})$/;
                  const match = value.match(idRegex);
                  if (!match) return "Invalid format. Expected format: 25BCE7321";
                  const year = parseInt(match[1], 10);
                  const currentYear = new Date().getFullYear() % 100;
                  if (year < 17 || year > currentYear) return `Year digits must be between 17 and ${currentYear}`;
                  return true;
                }
              })}
              className="w-full h-[50px] px-4 rounded-xl bg-black/40 border border-white/10 text-white placeholder-slate-500 focus:ring-2 focus:ring-brand-accent focus:border-brand-accent transition-all outline-none uppercase"
              placeholder="25BCE7321"
            />
            {errors.college_id && <p className="text-red-400 text-xs mt-1">{errors.college_id.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Problem Category</label>
            <select 
              {...register('category', { required: 'Please select a category' })}
              className="w-full h-[50px] px-4 rounded-xl bg-black/40 border border-white/10 text-white placeholder-slate-500 focus:ring-2 focus:ring-brand-accent focus:border-brand-accent transition-all outline-none"
            >
              <option value="" className="bg-[#1c1825]">Select a category</option>
              {categories.map(c => (
                <option key={c} value={c} className="bg-[#1c1825]">{c}</option>
              ))}
            </select>
            {errors.category && <p className="text-red-400 text-xs mt-1">{errors.category.message}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Problem Description</label>
          <textarea 
            {...register('description', { 
              required: 'Description is required',
              minLength: { value: 10, message: 'Please provide more detail (min 10 characters)' }
            })}
            className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder-slate-500 focus:ring-2 focus:ring-brand-accent focus:border-brand-accent transition-all outline-none min-h-[150px] resize-y"
            placeholder="Tell us what happened, where it happened, and how it affected you."
          ></textarea>
          <div className="flex justify-between mt-1">
            {errors.description ? (
              <p className="text-red-400 text-xs">{errors.description.message}</p>
            ) : <div></div>}
            <span className="text-xs text-slate-500">{description.length} characters</span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Location / Building (Optional)</label>
            <input 
              type="text"
              {...register('location')}
              className="w-full h-[50px] px-4 rounded-xl bg-black/40 border border-white/10 text-white placeholder-slate-500 focus:ring-2 focus:ring-brand-accent focus:border-brand-accent transition-all outline-none"
              placeholder="e.g. MH2 Block, Room 402"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Severity (Optional)</label>
            <select 
              {...register('severity')}
              className="w-full h-[50px] px-4 rounded-xl bg-black/40 border border-white/10 text-white placeholder-slate-500 focus:ring-2 focus:ring-brand-accent focus:border-brand-accent transition-all outline-none"
            >
              <option value="" className="bg-[#1c1825]">Select severity</option>
              <option value="Low" className="bg-[#1c1825]">Low - Minor inconvenience</option>
              <option value="Medium" className="bg-[#1c1825]">Medium - Affects daily life</option>
              <option value="High" className="bg-[#1c1825]">High - Serious issue</option>
              <option value="Critical" className="bg-[#1c1825]">Critical - Urgent attention needed</option>
            </select>
          </div>
        </div>

        <div className="pt-4 flex items-center gap-3 border-t border-white/10">
          <input 
            type="checkbox" 
            id="anonymous"
            {...register('anonymous_preference')}
            className="w-5 h-5 rounded border-white/20 bg-black/40 text-brand-accent focus:ring-brand-accent focus:ring-offset-black"
          />
          <label htmlFor="anonymous" className="text-sm text-slate-400">
            Prefer to remain anonymous if this is displayed publicly (admin will still see your details)
          </label>
        </div>

        <div className="pt-6">
          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-brand-accent hover:bg-[#a874e0] text-[#120F17] font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(207,158,255,0.4)] hover:shadow-[0_0_25px_rgba(207,158,255,0.6)] flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-[#120F17]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting...
              </>
            ) : "Submit Report"}
          </button>
        </div>
      </form>
    </div>
      <TrackReportModal 
        isOpen={isTrackModalOpen} 
        onClose={() => setIsTrackModalOpen(false)} 
      />
    </>
  );
}
