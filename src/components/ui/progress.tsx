'use client';

import React from 'react';

type ProgressProps = {
  value: number; // percentage (0 - 100)
  className?: string;
};

export const Progress = ({ value, className }: ProgressProps) => {
  return (
    <div className={`w-full h-2 bg-zinc-800 rounded-full overflow-hidden ${className}`}>
      <div
        className="h-full bg-gradient-to-r from-green-400 via-yellow-400 to-red-500 rounded-full transition-all duration-500"
        style={{ width: `${value}%` }}
      ></div>
    </div>
  );
};
