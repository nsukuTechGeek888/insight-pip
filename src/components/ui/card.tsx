import React from "react";

export const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
  return (
    <div className={`bg-zinc-100 dark:bg-zinc-900 rounded-xl shadow-sm border dark:border-zinc-800 p-4 ${className}`}>
      {children}
    </div>
  );
};

export const CardContent = ({ children }: { children: React.ReactNode }) => {
  return <div className="mt-2">{children}</div>;
};
