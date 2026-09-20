import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { trackReport } from '../services/api';

interface TrackReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TrackReportModal({ isOpen, onClose }: TrackReportModalProps) {
  const [reportId, setReportId] = useState('');
  const [collegeId, setCollegeId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [report, setReport] = useState<any>(null);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportId || !collegeId) return;
    
    setError('');
    setLoading(true);
    
    try {
      const parsedId = parseInt(reportId, 10);
      if (isNaN(parsedId)) {
        setError('Invalid Report ID format. Must be a number.');
        return;
      }
      const data = await trackReport(parsedId, collegeId);
      setReport(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to track report. Please verify your details.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
      case 'reviewing': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      case 'investigating': return 'text-purple-400 bg-purple-400/10 border-purple-400/20';
      case 'resolved': return 'text-green-400 bg-green-400/10 border-green-400/20 shadow-[0_0_15px_rgba(74,222,128,0.2)]';
      default: return 'text-slate-500 bg-slate-800 border-slate-700';
    }
  };

  const resetAndClose = () => {
    setReport(null);
    setReportId('');
    setCollegeId('');
    setError('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={resetAndClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg bg-[#1c1825]/90 backdrop-blur-xl border border-white/10 p-6 sm:p-8 rounded-[2rem] shadow-[0_0_50px_rgba(207,158,255,0.15)] overflow-hidden max-h-[90vh] overflow-y-auto"
          >
            {/* Background Glow */}
            <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[#CF9EFF]/5 blur-[100px] pointer-events-none" />

            <div className="relative z-10">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-white tracking-tight">Track Report</h3>
                <button 
                  onClick={resetAndClose}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              {!report ? (
                <form onSubmit={handleTrack} className="space-y-5">
                  {error && (
                    <div className="p-3 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl text-sm flex items-center gap-2">
                      <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      {error}
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Report ID</label>
                    <input 
                      type="text" 
                      required
                      value={reportId}
                      onChange={e => setReportId(e.target.value)}
                      placeholder="e.g. 123456"
                      className="w-full h-[50px] px-4 rounded-xl bg-black/40 border border-white/10 text-white placeholder-slate-500 focus:ring-2 focus:ring-[#CF9EFF] focus:border-[#CF9EFF] transition-all outline-none font-mono"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">VIT-AP College ID</label>
                    <input 
                      type="text" 
                      required
                      value={collegeId}
                      onChange={e => setCollegeId(e.target.value)}
                      placeholder="e.g. 25BCE7321"
                      className="w-full h-[50px] px-4 rounded-xl bg-black/40 border border-white/10 text-white placeholder-slate-500 focus:ring-2 focus:ring-[#CF9EFF] focus:border-[#CF9EFF] transition-all outline-none uppercase font-mono"
                    />
                  </div>
                  
                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full h-[50px] mt-2 bg-[#CF9EFF] hover:bg-[#b983ef] text-[#120F17] font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(207,158,255,0.3)] hover:shadow-[0_0_25px_rgba(207,158,255,0.5)] flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    {loading ? 'Searching...' : 'Track Status'}
                  </button>
                </form>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#CF9EFF] to-purple-400" />
                    
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-xs text-slate-500 font-mono mb-1">#{report.id}</p>
                        <h4 className="text-white font-medium">{report.category}</h4>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider border ${getStatusColor(report.status === 'spam' ? 'closed' : report.status)}`}>
                        {report.status === 'spam' ? 'closed' : report.status}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400 line-clamp-3">{report.description}</p>
                  </div>
                  
                  <div className="relative pl-6 space-y-6 border-l-2 border-white/10 before:absolute before:top-0 before:bottom-0 before:left-[-2px] before:w-1 before:bg-gradient-to-b before:from-[#CF9EFF] before:to-transparent">
                    <div className="relative">
                      <div className="absolute w-3 h-3 bg-[#CF9EFF] rounded-full left-[-29px] top-1 shadow-[0_0_10px_#CF9EFF]" />
                      <p className="text-sm text-white font-medium">Report Submitted</p>
                      <p className="text-xs text-slate-500 mt-1">{new Date(report.created_at).toLocaleString()}</p>
                    </div>
                    
                    {report.status !== 'submitted' && (
                      <div className="relative">
                        <div className="absolute w-3 h-3 bg-[#CF9EFF] rounded-full left-[-29px] top-1 shadow-[0_0_10px_#CF9EFF]" />
                        <p className="text-sm text-white font-medium">Status Updated</p>
                        <p className="text-xs text-[#CF9EFF] mt-1 font-medium uppercase tracking-wide">{report.status === 'spam' ? 'closed' : report.status}</p>
                      </div>
                    )}
                  </div>
                  
                  <button 
                    onClick={() => setReport(null)}
                    className="w-full py-3 text-sm text-slate-400 hover:text-white transition-colors border border-white/5 hover:border-white/10 rounded-xl"
                  >
                    Track another report
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
