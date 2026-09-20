export function calculatePasswordStrength(password: string): { score: number; label: string; color: string } {
  if (!password) return { score: 0, label: 'None', color: 'bg-slate-700' };
  
  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  // Max theoretical score is 6, we cap it at 4 for UI
  const normalizedScore = Math.min(4, Math.floor((score / 6) * 4) + (score >= 4 ? 1 : 0));
  
  const finalScore = Math.min(4, Math.max(1, normalizedScore));

  switch (finalScore) {
    case 1: return { score: 1, label: 'Weak', color: 'bg-red-500' };
    case 2: return { score: 2, label: 'Fair', color: 'bg-yellow-500' };
    case 3: return { score: 3, label: 'Good', color: 'bg-blue-400' };
    case 4: return { score: 4, label: 'Strong', color: 'bg-green-500' };
    default: return { score: 0, label: 'None', color: 'bg-slate-700' };
  }
}

export function isPasswordStrongEnough(password: string): boolean {
  if (!password) return false;
  // Needs 1 upper, 1 lower, 1 number, 1 special, and 8 chars
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const hasLength = password.length >= 8;
  return hasUpper && hasLower && hasNumber && hasSpecial && hasLength;
}

export default function PasswordStrengthMeter({ password }: { password: string }) {
  if (!password) return null;
  const strength = calculatePasswordStrength(password);
  const isStrong = isPasswordStrongEnough(password);

  return (
    <div className="mt-2 space-y-1">
      <div className="flex gap-1 h-1.5 w-full">
        {[1, 2, 3, 4].map((level) => (
          <div 
            key={level} 
            className={`flex-1 rounded-full transition-all duration-300 ${strength.score >= level ? strength.color : 'bg-white/10'}`} 
          />
        ))}
      </div>
      <div className="flex justify-between items-center text-[10px] mt-1">
        <span className={`font-semibold ${
          strength.score === 1 ? 'text-red-400' : 
          strength.score === 2 ? 'text-yellow-400' : 
          strength.score === 3 ? 'text-blue-400' : 
          'text-green-400'
        }`}>
          {strength.label}
        </span>
        {!isStrong && (
          <span className="text-slate-400">Needs A, a, 1, @ (8+ chars)</span>
        )}
      </div>
    </div>
  );
}
