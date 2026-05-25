'use client';

import { useEffect, useState } from 'react';

interface PasswordStrengthProps {
  value: string;
  onValidationChange?: (isValid: boolean) => void;
}

export default function PasswordStrength({ value, onValidationChange }: PasswordStrengthProps) {
  const [strength, setStrength] = useState(0);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    let score = 0;
    if (!value) {
      setStrength(0);
      setFeedback('');
      onValidationChange?.(false);
      return;
    }

    if (value.length >= 8) score += 20;
    if (/[A-Z]/.test(value)) score += 20;
    if (/[a-z]/.test(value)) score += 20;
    if (/[0-9]/.test(value)) score += 20;
    if (/[^A-Za-z0-9]/.test(value)) score += 20;

    setStrength(score);

    if (score < 40) {
      setFeedback('Very Weak');
      onValidationChange?.(false);
    } else if (score < 60) {
      setFeedback('Weak');
      onValidationChange?.(false);
    } else if (score < 80) {
      setFeedback('Medium');
      onValidationChange?.(true); // Accept medium
    } else if (score < 100) {
      setFeedback('Strong');
      onValidationChange?.(true);
    } else {
      setFeedback('Excellent');
      onValidationChange?.(true);
    }
  }, [value, onValidationChange]);

  const getColor = () => {
    if (strength < 40) return 'bg-red-500';
    if (strength < 70) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  if (!value) return null;

  return (
    <div className="mt-2 space-y-1">
      <div className="flex justify-between items-center text-xs">
        <span className="text-gray-400">Password Strength:</span>
        <span 
          className={`font-semibold ${
            strength < 40 ? 'text-red-400' : strength < 70 ? 'text-amber-400' : 'text-emerald-400'
          }`}
        >
          {feedback}
        </span>
      </div>
      <div className="h-1.5 w-full bg-gray-800 rounded-[12px] overflow-hidden">
        <div 
          className={`h-full ${getColor()} transition-all duration-300`} 
          style={{ width: `${strength}%` }}
        />
      </div>
      <div className="text-[10px] text-gray-400 grid grid-cols-2 gap-x-2 pt-1">
        <div className={value.length >= 8 ? 'text-emerald-400' : ''}>✓ Min 8 characters</div>
        <div className={/[A-Z]/.test(value) ? 'text-emerald-400' : ''}>✓ Uppercase letter</div>
        <div className={/[a-z]/.test(value) ? 'text-emerald-400' : ''}>✓ Lowercase letter</div>
        <div className={/[0-9]/.test(value) ? 'text-emerald-400' : ''}>✓ Number</div>
      </div>
    </div>
  );
}
