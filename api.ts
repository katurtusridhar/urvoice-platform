import emailjs from '@emailjs/browser';
import { supabase } from './supabaseClient';
import type { ReportCreate } from '../types';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const validateCollegeId = (id: string) => {
  const regex = /^\d{2}[A-Z]{3}\d{4,5}$/i;
  if (!regex.test(id)) {
    return { isValid: false, error: 'Invalid College ID format. Example: 25BCE7321' };
  }
  
  const match = id.match(/^(\d{2})/);
  if (!match) {
    return { isValid: false, error: 'Invalid format' };
  }
  
  const yearStr = match[1];
  const year = parseInt(yearStr, 10);
  const currentYear = new Date().getFullYear() % 100;
  
  if (year < 17 || year > currentYear) {
    return { isValid: false, error: `Year digits must be between 17 and ${currentYear}` };
  }
  
  return { isValid: true };
};

export const submitReport = async (data: ReportCreate) => {
  // Backend validation mock
  const validation = validateCollegeId(data.college_id);
  if (!validation.isValid) {
    throw { response: { status: 400, data: { detail: validation.error } } };
  }
  
  if (!data.student_email.endsWith('@vitap.ac.in') && !data.student_email.endsWith('@vitap.student.ac.in')) {
    throw { response: { status: 400, data: { detail: "Must be a valid VIT-AP email address" } } };
  }

  // Anti-Spam Rate Limiter (2 reports per 15 minutes per college_id)
  const rateLimitKey = 'mock_reports_rate_limit';
  const limits = JSON.parse(localStorage.getItem(rateLimitKey) || '{}');
  const now = Date.now();
  const fifteenMinutes = 15 * 60 * 1000;
  
  const userSubmissions = (limits[data.college_id] || []).filter((time: number) => now - time < fifteenMinutes);
  
  if (userSubmissions.length >= 2) {
    throw { response: { status: 429, data: { detail: 'Anti-Spam: You can only submit 2 reports per 15 minutes.' } } };
  }
  
  // Update rate limit
  userSubmissions.push(now);
  limits[data.college_id] = userSubmissions;
  localStorage.setItem(rateLimitKey, JSON.stringify(limits));
  
  // Insert into Supabase
  const { data: insertedData, error } = await supabase
    .from('reports')
    .insert([{
      student_name: data.student_name,
      student_email: data.student_email,
      college_id: data.college_id.toUpperCase(),
      category: data.category,
      description: data.description,
      location: data.location,
      severity: data.severity,
      anonymous_preference: data.anonymous_preference
    }])
    .select()
    .single();

  if (error) {
    console.error("Supabase insert error:", error);
    throw { response: { status: 500, data: { detail: error.message } } };
  }
  
  return insertedData;
};

export const trackReport = async (reportId: number, collegeId: string) => {
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .eq('id', reportId)
    .ilike('college_id', collegeId)
    .single();

  if (error || !data) {
    throw { response: { status: 404, data: { detail: 'No report found matching this Report ID and College ID.' } } };
  }
  
  return data;
};

export const getReports = async () => {
  const token = localStorage.getItem('admin_token');
  if (token !== 'mock-jwt-token-admin') {
    throw { response: { status: 401, data: { detail: 'Unauthorized' } } };
  }
  
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Supabase fetch error:", error);
    throw { response: { status: 500, data: { detail: error.message } } };
  }
  
  return data;
};

export const updateReportStatus = async (id: number, status: string) => {
  const token = localStorage.getItem('admin_token');
  if (token !== 'mock-jwt-token-admin') {
    throw { response: { status: 401, data: { detail: 'Unauthorized' } } };
  }
  
  const { data, error } = await supabase
    .from('reports')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw { response: { status: 500, data: { detail: error.message } } };
  }
  
  return data;
};

export const getCategories = async () => {
  await delay(200);
  return [
    "Academics", "Hostel", "Food", "Transportation", "Infrastructure", 
    "Faculty", "Administration", "Examinations", "Fees", "Internet & Technology", 
    "Clubs & Activities", "Campus Facilities", "Safety", "Other"
  ];
};

const getAdminCreds = async () => {
  const { data, error } = await supabase
    .from('admin_credentials')
    .select('id, username, email')
    .eq('id', 1)
    .single();
    
  if (error) {
    console.error("Error fetching admin creds:", error);
    return null;
  }
  return data;
};

export const loginAdmin = async (username: string, password: string) => {
  const { data, error } = await supabase
    .from('admin_credentials')
    .select('id')
    .eq('username', username)
    .eq('password', password)
    .single();
    
  if (error || !data) {
    throw { response: { status: 401, data: { detail: 'Incorrect username or password' } } };
  }
  
  return { access_token: 'mock-jwt-token-admin', token_type: 'bearer' };
};

export const sendOTPEmail = async (email: string, storageKey: string) => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  localStorage.setItem(storageKey, otp);
  
  const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || '';
  const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || '';
  const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '';

  let emailSent = false;
  if (EMAILJS_SERVICE_ID && EMAILJS_TEMPLATE_ID && EMAILJS_PUBLIC_KEY) {
    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        { 
          email: email, 
          passcode: otp, 
          time: new Date(Date.now() + 15 * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          reply_to: "noreply@vitap.student.ac.in" 
        },
        EMAILJS_PUBLIC_KEY
      );
      emailSent = true;
    } catch (err) {
      console.error('EmailJS Error:', err);
      emailSent = false;
    }
  }

  return { 
    message: 'OTP sent successfully', 
    mockOtp: emailSent ? undefined : otp,
    emailMethod: emailSent ? 'emailjs' : 'local_alert'
  };
};

export const requestOTP = async (email: string) => {
  const creds = await getAdminCreds();
  if (!creds || email.toLowerCase() !== creds.email.toLowerCase()) {
    throw { response: { status: 404, data: { detail: 'Email not registered as an admin.' } } };
  }
  return await sendOTPEmail(email, 'mock_admin_otp');
};

export const requestChangeOTPs = async (currentPassword: string, newEmail?: string) => {
  const { data: credCheck, error } = await supabase
    .from('admin_credentials')
    .select('email')
    .eq('password', currentPassword)
    .single();
    
  if (error || !credCheck) {
    throw { response: { status: 401, data: { detail: 'Current password is incorrect.' } } };
  }
  
  const currentOTPRes = await sendOTPEmail(credCheck.email, 'mock_admin_otp');
  
  let newOTPRes = null;
  if (newEmail && newEmail.toLowerCase() !== credCheck.email.toLowerCase()) {
    newOTPRes = await sendOTPEmail(newEmail, 'mock_admin_otp_new');
  }
  
  return { currentOTPRes, newOTPRes };
};

export const resetPassword = async (email: string, newPassword: string, otp: string) => {
  const creds = await getAdminCreds();
  if (!creds || email.toLowerCase() !== creds.email.toLowerCase()) {
    throw { response: { status: 404, data: { detail: 'Email not found.' } } };
  }
  
  const storedOtp = localStorage.getItem('mock_admin_otp');
  if (otp !== storedOtp) {
    throw { response: { status: 400, data: { detail: 'Invalid or expired OTP.' } } };
  }
  
  const { error } = await supabase
    .from('admin_credentials')
    .update({ password: newPassword })
    .eq('id', 1);

  if (error) {
    console.error("Supabase update error:", error);
    throw { response: { status: 500, data: { detail: 'Database error' } } };
  }
    
  localStorage.removeItem('mock_admin_otp');
  return { success: true };
};

export const changeCredentials = async (
  currentPassword: string, 
  newUsername: string, 
  newPassword: string, 
  newEmail: string,
  otp: string,
  otpNew?: string
) => {
  const { data: creds, error: credError } = await supabase
    .from('admin_credentials')
    .select('email')
    .eq('password', currentPassword)
    .single();

  if (credError || !creds) {
    throw { response: { status: 401, data: { detail: 'Current password is incorrect.' } } };
  }
  
  const storedOtp = localStorage.getItem('mock_admin_otp');
  if (otp !== storedOtp) {
    throw { response: { status: 400, data: { detail: 'Invalid or expired OTP for current email.' } } };
  }

  const updates: any = {};

  if (newEmail && newEmail.toLowerCase() !== creds.email.toLowerCase()) {
    const storedOtpNew = localStorage.getItem('mock_admin_otp_new');
    if (otpNew !== storedOtpNew) {
      throw { response: { status: 400, data: { detail: 'Invalid or expired OTP for new email.' } } };
    }
    updates.email = newEmail;
  }
  
  if (newUsername) updates.username = newUsername;
  if (newPassword) updates.password = newPassword;
  
  if (Object.keys(updates).length > 0) {
    const { error } = await supabase
      .from('admin_credentials')
      .update(updates)
      .eq('id', 1);
      
    if (error) {
      console.error("Supabase update error:", error);
      throw { response: { status: 500, data: { detail: 'Database error' } } };
    }
  }
  
  localStorage.removeItem('mock_admin_otp');
  localStorage.removeItem('mock_admin_otp_new');
  return { success: true };
};
  
export const recoverUsername = async (email: string, otp: string) => {  
  const creds = await getAdminCreds();  
  if (!creds || email.toLowerCase() !== creds.email.toLowerCase()) {  
    throw { response: { status: 404, data: { detail: 'Email not found.' } } };  
  }  
  const storedOtp = localStorage.getItem('mock_admin_otp');  
  if (otp !== storedOtp) {  
    throw { response: { status: 400, data: { detail: 'Invalid or expired OTP.' } } };  
  }  
  localStorage.removeItem('mock_admin_otp');  
  return { username: creds.username };  
}; 
