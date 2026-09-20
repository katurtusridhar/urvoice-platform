import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { requestChangeOTPs, changeCredentials } from '../services/api';
import PasswordStrengthMeter, { isPasswordStrongEnough } from './PasswordStrengthMeter';

interface AdminSecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminSecurityModal({ isOpen, onClose }: AdminSecurityModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [otpCurrent, setOtpCurrent] = useState('');
  const [otpNew, setOtpNew] = useState('');
  const [requiresDualOtp, setRequiresDualOtp] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [resendCount, setResendCount] = useState(0);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleRequestOTP = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (step === 2 && (countdown > 0 || resendCount >= 2)) return;
    
    setError('');
    if (!currentPassword) {
      setError('Current password is required.');
      return;
    }
    if (newPassword && !isPasswordStrongEnough(newPassword)) {
      setError('New password must be strong (8+ chars, uppercase, lowercase, number, special).');
      return;
    }
    if (!newUsername && !newPassword && !newEmail) {
      setError('Please provide at least one new credential to change.');
      return;
    }
    
    setLoading(true);
    try {
      // Validate current password locally before sending emails
      const res = await requestChangeOTPs(currentPassword, newEmail);
      
      let msg = '';
      if (res.currentOTPRes.emailMethod === 'local_alert') {
        msg += `[FALLBACK] OTP 1 (Current Email): ${res.currentOTPRes.mockOtp}\n`;
      }
      
      if (res.newOTPRes) {
        setRequiresDualOtp(true);
        if (res.newOTPRes.emailMethod === 'local_alert') {
          msg += `[FALLBACK] OTP 2 (New Email): ${res.newOTPRes.mockOtp}`;
        }
      } else {
        setRequiresDualOtp(false);
      }
      
      if (msg) alert(msg);
      else if (step === 1) alert('OTP(s) sent successfully to the respective email inboxes.');
      
      if (step === 2) {
        setResendCount(prev => prev + 1);
      }
      setCountdown(30);
      setStep(2);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to request OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangeCreds = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await changeCredentials(currentPassword, newUsername, newPassword, newEmail, otpCurrent, otpNew);
      setSuccessMsg('Security credentials updated successfully!');
      setTimeout(() => {
        resetAndClose();
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update credentials.');
    } finally {
      setLoading(false);
    }
  };

  const resetAndClose = () => {
    setStep(1);
    setCurrentPassword('');
    setNewUsername('');
    setNewPassword('');
    setNewEmail('');
    setOtpCurrent('');
    setOtpNew('');
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setError('');
    setSuccessMsg('');
    setResendCount(0);
    setCountdown(0);
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
                <h3 className="text-2xl font-bold text-white tracking-tight">Security Settings</h3>
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
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Current Password <span className="text-red-400">*</span></label>
                    <div className="relative">
                      <input type={showCurrentPassword ? "text" : "password"} required value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="Required for verification" className="w-full h-12 px-4 pr-12 rounded-xl bg-black/40 border border-white/10 text-white placeholder-slate-500 focus:ring-2 focus:ring-[#CF9EFF] outline-none" />
                      <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#CF9EFF] transition-colors p-1">
                        {showCurrentPassword ? (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-white/10 mt-2">
                    <p className="text-xs text-slate-400 mb-4">Leave fields blank if you do not wish to change them.</p>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">New Username</label>
                        <input type="text" value={newUsername} onChange={e => setNewUsername(e.target.value)} placeholder="New Admin ID" className="w-full h-12 px-4 rounded-xl bg-black/40 border border-white/10 text-white placeholder-slate-500 focus:ring-2 focus:ring-[#CF9EFF] outline-none" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">New Password</label>
                        <div className="relative">
                          <input type={showNewPassword ? "text" : "password"} value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="New Password" minLength={8} className="w-full h-12 px-4 pr-12 rounded-xl bg-black/40 border border-white/10 text-white placeholder-slate-500 focus:ring-2 focus:ring-[#CF9EFF] outline-none" />
                          <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#CF9EFF] transition-colors p-1">
                            {showNewPassword ? (
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                            ) : (
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                            )}
                          </button>
                        </div>
                        {newPassword && <PasswordStrengthMeter password={newPassword} />}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">New Email Address</label>
                        <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="New Admin Email" className="w-full h-12 px-4 rounded-xl bg-black/40 border border-white/10 text-white placeholder-slate-500 focus:ring-2 focus:ring-[#CF9EFF] outline-none" />
                      </div>
                    </div>
                  </div>

                  <button type="submit" disabled={loading} className="w-full h-12 mt-4 bg-[#CF9EFF] hover:bg-[#b983ef] text-[#120F17] font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(207,158,255,0.3)] hover:shadow-[0_0_25px_rgba(207,158,255,0.5)] flex items-center justify-center">
                    {loading ? 'Processing...' : 'Proceed to OTP Verification'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleChangeCreds} className="space-y-4">
                  {error && <div className="p-3 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl text-sm">{error}</div>}
                  
                  <div className="p-3 bg-[#CF9EFF]/10 text-[#CF9EFF] text-xs rounded-lg mb-4 text-center">
                    {requiresDualOtp ? 'Security OTPs sent to your current and new email addresses.' : 'Security OTP sent to your current email address.'}
                  </div>
                  
                  <div className="flex justify-end items-center mb-2 px-1">
                    <button 
                      type="button" 
                      disabled={countdown > 0 || resendCount >= 2 || loading}
                      onClick={() => handleRequestOTP()}
                      className="text-[11px] font-medium text-[#CF9EFF] disabled:text-slate-500 hover:text-white transition-colors"
                    >
                      {countdown > 0 
                        ? `Resend in ${countdown}s` 
                        : resendCount >= 2 
                          ? 'Max attempts reached' 
                          : 'Resend OTP(s)'}
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">OTP (Current Email)</label>
                    <input type="text" required value={otpCurrent} onChange={e => setOtpCurrent(e.target.value)} placeholder="123456" className="w-full h-12 px-4 rounded-xl bg-black/40 border border-white/10 text-white placeholder-slate-500 focus:ring-2 focus:ring-[#CF9EFF] outline-none tracking-widest text-center text-xl font-mono" maxLength={6} />
                  </div>

                  {requiresDualOtp && (
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5 mt-4">OTP (New Email)</label>
                      <input type="text" required value={otpNew} onChange={e => setOtpNew(e.target.value)} placeholder="123456" className="w-full h-12 px-4 rounded-xl bg-black/40 border border-white/10 text-white placeholder-slate-500 focus:ring-2 focus:ring-[#CF9EFF] outline-none tracking-widest text-center text-xl font-mono" maxLength={6} />
                    </div>
                  )}

                  <button type="submit" disabled={loading} className="w-full h-12 mt-4 bg-[#CF9EFF] hover:bg-[#b983ef] text-[#120F17] font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(207,158,255,0.3)] hover:shadow-[0_0_25px_rgba(207,158,255,0.5)] flex items-center justify-center">
                    {loading ? 'Updating...' : 'Confirm Changes'}
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
