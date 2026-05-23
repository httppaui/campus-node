import React from "react";

export const GlassCard: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = "" }) => {
  return (
    <div
      className={`
        bg-card backdrop-blur-md 
        border border-[var(--color-card-border)] 
        rounded-2xl p-6 shadow-glass 
        hover:border-indigo-500/20 transition-all duration-300
        ${className}
      `}
    >
      {children}
    </div>
  );
};
