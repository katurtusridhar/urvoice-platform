import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { requestOTP, resetPassword } from '../services/api';
import PasswordStrengthMeter, { isPasswordStrongEnough } from './PasswordStrengthMeter';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ForgotPasswordModal({ isOpen, onClose }: ForgotPasswordModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [showPassword, setShowPassword] = useState(false);

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

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!isPasswordStrongEnough(newPassword)) {
      setError('Password must be strong (8+ chars, uppercase, lowercase, number, special).');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email, newPassword, otp);
      setSuccessMsg('Password successfully reset! You can now log in.');
      setTimeout(() => {
        resetAndClose();
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  const resetAndClose = () => {
    setStep(1);
    setEmail('');
    setOtp('');
    setNewPassword('');
    setShowPassword(false);
    setError('');
    setSuccessMsg('');
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
                <h3 className="text-2xl font-bold text-white tracking-tight">Reset Password</h3>
                <button onClick={resetAndClose} className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 flex items-center justify-center transition-colors">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              {successMsg ? (
                <div className="p-4 bg-green-500/10 text-green-400 border border-green-500/20 rounded-xl text-center font-medium">
                  {successMsg}
                </div>
              ) : step === 1 ? (
                <form onSubmit={handleRequestOTP} className="space-y-4">
                  {error && <div className="p-3 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl text-sm">{error}</div>}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Admin Email</label>
                    <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter your admin email" className="w-full h-12 px-4 rounded-xl bg-black/40 border border-white/10 text-white placeholder-slate-500 focus:ring-2 focus:ring-[#CF9EFF] outline-none" />
                  </div>
                  <button type="submit" disabled={loading} className="w-full h-12 mt-2 bg-[#CF9EFF] hover:bg-[#b983ef] text-[#120F17] font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(207,158,255,0.3)] hover:shadow-[0_0_25px_rgba(207,158,255,0.5)] flex items-center justify-center">
                    {loading ? 'Sending OTP...' : 'Send OTP'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleReset} className="space-y-4">
                  {error && <div className="p-3 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl text-sm">{error}</div>}
                  <div className="p-3 bg-[#CF9EFF]/10 text-[#CF9EFF] text-xs rounded-lg mb-4 text-center">OTP sent to {email}</div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Enter 6-digit OTP</label>
                    <input type="text" required value={otp} onChange={e => setOtp(e.target.value)} placeholder="123456" className="w-full h-12 px-4 rounded-xl bg-black/40 border border-white/10 text-white placeholder-slate-500 focus:ring-2 focus:ring-[#CF9EFF] outline-none tracking-widest text-center text-xl font-mono" maxLength={6} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">New Password</label>
                    <div className="relative">
                      <input type={showPassword ? "text" : "password"} required value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Enter new password" className="w-full h-12 px-4 pr-12 rounded-xl bg-black/40 border border-white/10 text-white placeholder-slate-500 focus:ring-2 focus:ring-[#CF9EFF] outline-none" minLength={8} />
                      <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#CF9EFF] transition-colors p-1"
                      >
                        {showPassword ? (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        )}
                      </button>
                    </div>
                    {newPassword && <PasswordStrengthMeter password={newPassword} />}
                  </div>
                  <button type="submit" disabled={loading} className="w-full h-12 mt-2 bg-[#CF9EFF] hover:bg-[#b983ef] text-[#120F17] font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(207,158,255,0.3)] hover:shadow-[0_0_25px_rgba(207,158,255,0.5)] flex items-center justify-center">
                    {loading ? 'Resetting...' : 'Reset Password'}
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
