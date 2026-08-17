import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ children, className = "", ...props }) => {
  return (
    <button
      {...props}
      className={`px-4 py-2 rounded bg-gradient-to-br from-purple-600 via-pink-500 to-red-500 text-white font-medium hover:opacity-90 transition ${className}`}
    >
      {children}
    </button>
  );
};
