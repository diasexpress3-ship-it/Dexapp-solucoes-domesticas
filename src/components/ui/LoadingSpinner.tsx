import React from 'react';
import { Loader2 } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface LoadingSpinnerProps {
  size?: number;
  className?: string;
  fullScreen?: boolean;
}

export const LoadingSpinner = ({ size = 32, className, fullScreen }: LoadingSpinnerProps) => {
  const spinner = (
    <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
      <Loader2 className="animate-spin text-primary" size={size} />
      <span className="text-sm font-medium text-gray-500">Carregando...</span>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-[200] bg-white flex items-center justify-center">
        {spinner}
      </div>
    );
  }

  return spinner;
};
