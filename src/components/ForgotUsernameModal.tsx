import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { requestOTP, recoverUsername } from '../services/api';

interface ForgotUsernameModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ForgotUsernameModal({ isOpen, onClose }: ForgotUsernameModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [recoveredUsername, setRecoveredUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await requestOTP(email);
      if (res.emailMethod === 'local_alert') {
        alert(`[SYSTEM FALLBACK] EmailJS not configured.\nOTP sent to ${email}:\n\nYour OTP is: ${res.mockOtp}`);
      } else {
        alert('An OTP has been successfully sent to your email inbox!');
      }
      setStep(2);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to request OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleRecover = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await recoverUsername(email, otp);
      setRecoveredUsername(res.username);
      setStep(3);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to verify OTP.');
    } finally {
      setLoading(false);
    }
  };

  const resetAndClose = () => {
    setStep(1);
    setEmail('');
    setOtp('');
    setRecoveredUsername('');
    setError('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={resetAndClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-[#1c1825]/90 backdrop-blur-xl border border-white/10 p-6 sm:p-8 rounded-[2rem] shadow-[0_0_50px_rgba(207,158,255,0.15)] overflow-hidden max-h-[90vh] overflow-y-auto"
          >
            <div className="relative z-10">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-white tracking-tight">Forgot Username</h3>
                <button onClick={resetAndClose} className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 flex items-center justify-center transition-colors">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              {step === 1 ? (
                <form onSubmit={handleRequestOTP} className="space-y-4">
                  <p className="text-slate-400 text-sm mb-4">Enter your admin email to receive an OTP and retrieve your username.</p>
                  {error && <div className="p-3 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl text-sm">{error}</div>}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Admin Email</label>
                    <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter your admin email" className="w-full h-12 px-4 rounded-xl bg-black/40 border border-white/10 text-white placeholder-slate-500 focus:ring-2 focus:ring-[#CF9EFF] outline-none" />
                  </div>
                  <button type="submit" disabled={loading} className="w-full h-12 mt-2 bg-[#CF9EFF] hover:bg-[#b983ef] text-[#120F17] font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(207,158,255,0.3)] hover:shadow-[0_0_25px_rgba(207,158,255,0.5)] flex items-center justify-center">
                    {loading ? 'Sending OTP...' : 'Send OTP'}
                  </button>
                </form>
              ) : step === 2 ? (
                <form onSubmit={handleRecover} className="space-y-4">
                  {error && <div className="p-3 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl text-sm">{error}</div>}
                  <div className="p-3 bg-[#CF9EFF]/10 text-[#CF9EFF] text-xs rounded-lg mb-4 text-center">OTP sent to {email}</div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Enter 6-digit OTP</label>
                    <input type="text" required value={otp} onChange={e => setOtp(e.target.value)} placeholder="123456" className="w-full h-12 px-4 rounded-xl bg-black/40 border border-white/10 text-white placeholder-slate-500 focus:ring-2 focus:ring-[#CF9EFF] outline-none tracking-widest text-center text-xl font-mono" maxLength={6} />
                  </div>
                  <button type="submit" disabled={loading} className="w-full h-12 mt-2 bg-[#CF9EFF] hover:bg-[#b983ef] text-[#120F17] font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(207,158,255,0.3)] hover:shadow-[0_0_25px_rgba(207,158,255,0.5)] flex items-center justify-center">
                    {loading ? 'Verifying...' : 'Verify OTP'}
                  </button>
                </form>
              ) : (
                <div className="space-y-6 text-center">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/30">
                    <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <h4 className="text-xl font-bold text-white">Username Recovered</h4>
                  <p className="text-slate-400">Your admin username is:</p>
                  <div className="p-4 bg-black/40 border border-[#CF9EFF]/30 rounded-xl font-mono text-[#CF9EFF] text-2xl tracking-wide select-all">
                    {recoveredUsername}
                  </div>
                  <button onClick={resetAndClose} className="w-full h-12 mt-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-all flex items-center justify-center">
                    Back to Login
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
