import React from 'react';
import { Heart, Sparkles, Star, Shield, Sun, Rocket, Smile } from 'lucide-react';

interface PediatricAvatarProps {
  sticker?: string;
  gender?: 'M' | 'F';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  status?: 'estable' | 'observacion' | 'critico';
}

export const PediatricAvatar: React.FC<PediatricAvatarProps> = ({
  sticker = 'bear',
  gender = 'M',
  size = 'md',
  status = 'estable',
}) => {
  const sizeClasses = {
    sm: 'w-9 h-9 text-base',
    md: 'w-12 h-12 text-xl',
    lg: 'w-16 h-16 text-2xl',
    xl: 'w-20 h-20 text-4xl',
  };

  const statusBorder = {
    estable: 'border-emerald-400 dark:border-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 shadow-emerald-100 dark:shadow-none',
    observacion: 'border-amber-400 dark:border-amber-600 bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 shadow-amber-100 dark:shadow-none',
    critico: 'border-rose-400 dark:border-rose-600 bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 shadow-rose-100 dark:shadow-none animate-pulse',
  };

  const getEmoji = () => {
    switch (sticker) {
      case 'bear':
        return '🧸';
      case 'lion':
        return '🦁';
      case 'rabbit':
        return '🐰';
      case 'dino':
        return '🦖';
      case 'star':
        return '⭐';
      case 'rocket':
        return '🚀';
      case 'superhero':
        return '🦸';
      default:
        return gender === 'F' ? '👧' : '👦';
    }
  };

  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-2xl border-2 shadow-sm font-semibold select-none transition-transform hover:scale-105 ${sizeClasses[size]} ${statusBorder[status]}`}
      title={`Estado: ${status.toUpperCase()}`}
    >
      <span>{getEmoji()}</span>
      {status === 'critico' && (
        <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-rose-600 border border-white"></span>
        </span>
      )}
      {status === 'estable' && (
        <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full p-0.5 shadow">
          <Sparkles className="w-2.5 h-2.5" />
        </span>
      )}
      {status === 'observacion' && (
        <span className="absolute -bottom-1 -right-1 bg-amber-500 text-white rounded-full p-0.5 shadow">
          <Sun className="w-2.5 h-2.5" />
        </span>
      )}
    </div>
  );
};
