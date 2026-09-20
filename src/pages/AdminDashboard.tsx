import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getReports, updateReportStatus } from '../services/api';
import type { Report } from '../types';
import clsx from 'clsx';
import AdminSecurityModal from '../components/AdminSecurityModal';
import Logo from '../components/Logo';

export default function AdminDashboard() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const data = await getReports();
        setReports(data);
      } catch (err: any) {
        if (err.response?.status === 401) {
          localStorage.removeItem('admin_token');
          navigate('/admin');
        } else {
          setError('Failed to fetch reports');
        }
      } finally {
        setLoading(false);
      }
    };

    const token = localStorage.getItem('admin_token');
    if (!token) {
      navigate('/admin');
      return;
    }
    fetchReports();
  }, [navigate]);

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      await updateReportStatus(id, newStatus);
      // Optimistic update
      setReports(reports.map(r => r.id === id ? { ...r, status: newStatus } : r));
    } catch {
      alert('Failed to update status');
    }
  };

  const filteredReports = reports.filter(r => filter === 'all' ? r.status !== 'spam' : r.status === filter);

  // Stats
  const nonSpamReports = reports.filter(r => r.status !== 'spam');
  const total = nonSpamReports.length;
  const openCount = nonSpamReports.filter(r => r.status === 'submitted' || r.status === 'reviewing').length;
  const resolvedCount = nonSpamReports.filter(r => r.status === 'resolved' || r.status === 'closed').length;

  const logout = () => {
    localStorage.removeItem('admin_token');
    navigate('/admin');
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#120F17]">
      <div className="w-12 h-12 border-4 border-[#CF9EFF]/30 border-t-[#CF9EFF] rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#120F17] text-slate-300 font-sans relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#CF9EFF]/5 blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[60%] bg-[#CF9EFF]/5 blur-[150px] pointer-events-none rounded-full" />

      <nav className="relative z-10 bg-[#1c1825]/80 backdrop-blur-xl border-b border-white/5 px-4 md:px-8 py-4 flex justify-between items-center sticky top-0">
        <Logo onClick={() => navigate('/')} className="scale-90 md:scale-100 origin-left" />
        <div className="flex items-center gap-2 md:gap-3">
          <button 
            onClick={() => setIsSecurityModalOpen(true)}
            className="text-xs md:text-sm bg-white/5 hover:bg-white/10 border border-white/10 px-3 md:px-4 py-2 md:py-2.5 rounded-xl transition-all hover:border-[#CF9EFF]/50 hover:text-white flex items-center gap-1.5 md:gap-2 shrink-0"
          >
            <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            <span className="hidden sm:inline">Security</span>
          </button>
          <button 
            onClick={logout} 
            className="text-xs md:text-sm bg-white/5 hover:bg-white/10 border border-white/10 px-3 md:px-4 py-2 md:py-2.5 rounded-xl transition-all hover:border-red-500/50 hover:text-red-400 flex items-center gap-1.5 md:gap-2 shrink-0"
          >
            <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </nav>

      <div className="relative z-10 max-w-[90rem] mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-10">
        {error && (
          <div className="mb-6 p-4 bg-red-900/30 text-red-400 border border-red-500/20 rounded-xl flex items-center gap-3 animate-pulse">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-[#1c1825]/60 backdrop-blur-md p-8 rounded-3xl border border-white/5 shadow-xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent group-hover:from-blue-500/10 transition-colors duration-500"></div>
            <h3 className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-2 relative z-10">Total Reports</h3>
            <p className="text-5xl font-black text-white relative z-10 tracking-tight">{total}</p>
          </div>
          
          <div className="bg-[#1c1825]/60 backdrop-blur-md p-8 rounded-3xl border border-white/5 shadow-xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent group-hover:from-yellow-500/10 transition-colors duration-500"></div>
            <h3 className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-2 relative z-10">Needs Attention</h3>
            <p className="text-5xl font-black text-yellow-400 relative z-10 tracking-tight">{openCount}</p>
          </div>

          <div className="bg-[#1c1825]/60 backdrop-blur-md p-8 rounded-3xl border border-white/5 shadow-xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent group-hover:from-green-500/10 transition-colors duration-500"></div>
            <h3 className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-2 relative z-10">Resolved / Closed</h3>
            <p className="text-5xl font-black text-green-400 relative z-10 tracking-tight">{resolvedCount}</p>
          </div>
        </div>

        <div className="bg-[#1c1825]/60 backdrop-blur-md rounded-3xl border border-white/5 shadow-2xl overflow-hidden">
          <div className="p-6 md:p-8 border-b border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 bg-black/20">
            <div>
              <h2 className="text-xl font-bold text-white">Issue Tracking Board</h2>
              <p className="text-sm text-slate-400 mt-1">Manage and respond to student concerns efficiently.</p>
            </div>
            
            <div className="relative">
              <select 
                className="appearance-none pl-5 pr-10 py-3 rounded-xl border border-white/10 bg-[#120F17] text-white text-sm outline-none focus:ring-2 focus:ring-[#CF9EFF] focus:border-transparent transition-all shadow-inner font-medium cursor-pointer"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">View All Statuses</option>
                <option value="submitted">Submitted</option>
                <option value="reviewing">Reviewing</option>
                <option value="investigating">Investigating</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
                <option value="spam">Spam Folder</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-black/40 text-slate-400 text-xs uppercase tracking-wider border-b border-white/5">
                  <th className="px-4 md:px-6 py-4 md:py-5 font-semibold whitespace-nowrap">Report ID</th>
                  <th className="px-4 md:px-6 py-4 md:py-5 font-semibold whitespace-nowrap">Student Info</th>
                  <th className="px-4 md:px-6 py-4 md:py-5 font-semibold whitespace-nowrap">Category & Details</th>
                  <th className="px-4 md:px-6 py-4 md:py-5 font-semibold whitespace-nowrap">Current Status</th>
                  <th className="px-4 md:px-6 py-4 md:py-5 font-semibold whitespace-nowrap text-right">Update Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredReports.map((report) => (
                  <tr key={report.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-4 md:px-6 py-4 md:py-6 text-slate-500 font-mono text-sm">
                      #{report.id}
                      <div className="text-xs text-slate-600 mt-1">{new Date(report.created_at).toLocaleDateString()}</div>
                    </td>
                    <td className="px-4 md:px-6 py-4 md:py-6 whitespace-nowrap">
                      {report.anonymous_preference ? (
                        <div>
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-[#CF9EFF] border border-purple-500/20 mb-1.5 uppercase tracking-wide">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                            Anonymous Publicly
                          </span>
                          <span className="text-white font-medium block text-sm md:text-base">{report.student_name}</span>
                          <span className="text-slate-500 block text-xs mt-0.5">{report.college_id}</span>
                        </div>
                      ) : (
                        <div>
                          <span className="text-white font-medium block text-sm md:text-base">{report.student_name}</span>
                          <span className="text-slate-500 block text-xs mt-0.5">{report.college_id}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 md:px-6 py-4 md:py-6 max-w-[250px] md:max-w-md">
                      <div className="flex flex-wrap gap-2 mb-2">
                        <span className="inline-flex px-2 py-1 md:px-2.5 md:py-1 bg-white/10 text-slate-200 text-xs rounded-lg font-medium border border-white/5">{report.category}</span>
                        {report.severity && (
                          <span className={clsx(
                            "inline-flex px-2 py-1 md:px-2.5 md:py-1 text-xs rounded-lg font-medium border",
                            report.severity === 'Critical' ? "bg-red-500/10 text-red-400 border-red-500/20" :
                            report.severity === 'High' ? "bg-orange-500/10 text-orange-400 border-orange-500/20" :
                            report.severity === 'Medium' ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" :
                            "bg-blue-500/10 text-blue-400 border-blue-500/20"
                          )}>
                            {report.severity}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-400 leading-relaxed line-clamp-2 group-hover:line-clamp-none transition-all duration-300" title={report.description}>
                        {report.description}
                      </p>
                      {report.location && (
                        <p className="text-xs text-slate-500 mt-2 flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                          {report.location}
                        </p>
                      )}
                    </td>
                    <td className="px-4 md:px-6 py-4 md:py-6">
                      <span className={clsx(
                        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border whitespace-nowrap",
                        report.status === 'submitted' ? "bg-white/5 text-slate-300 border-white/10" :
                        report.status === 'reviewing' ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                        report.status === 'investigating' ? "bg-purple-500/10 text-purple-400 border-purple-500/20" :
                        report.status === 'resolved' ? "bg-green-500/10 text-green-400 border-green-500/20 shadow-[0_0_10px_rgba(74,222,128,0.1)]" :
                        report.status === 'spam' ? "bg-red-500/10 text-red-500 border-red-500/20" :
                        "bg-slate-800 text-slate-500 border-slate-700"
                      )}>
                        <span className={clsx(
                          "w-1.5 h-1.5 rounded-full",
                          report.status === 'submitted' ? "bg-slate-400" :
                          report.status === 'reviewing' ? "bg-blue-400" :
                          report.status === 'investigating' ? "bg-purple-400" :
                          report.status === 'resolved' ? "bg-green-400" :
                          report.status === 'spam' ? "bg-red-500" :
                          "bg-slate-600"
                        )}></span>
                        {report.status}
                      </span>
                    </td>
                    <td className="px-4 md:px-6 py-4 md:py-6 text-right">
                      <div className="relative inline-block text-left">
                        <select 
                          className="appearance-none pl-4 pr-10 py-2 rounded-lg border border-white/10 bg-[#1c1825] text-slate-300 text-sm outline-none focus:ring-2 focus:ring-[#CF9EFF] focus:border-transparent transition-all hover:bg-white/5 cursor-pointer font-medium"
                          value={report.status}
                          onChange={(e) => handleStatusChange(report.id, e.target.value)}
                        >
                          <option value="submitted">Submitted</option>
                          <option value="reviewing">Reviewing</option>
                          <option value="investigating">Investigating</option>
                          <option value="resolved">Resolved</option>
                          <option value="closed">Closed</option>
                          <option value="spam">Mark as Spam</option>
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredReports.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-24 text-center">
                      <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/5">
                        <svg className="w-8 h-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
                      </div>
                      <p className="text-slate-400 font-medium text-lg">No reports match this filter.</p>
                      <p className="text-slate-500 text-sm mt-1">Try selecting a different status.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <AdminSecurityModal isOpen={isSecurityModalOpen} onClose={() => setIsSecurityModalOpen(false)} />
    </div>
  );
}
