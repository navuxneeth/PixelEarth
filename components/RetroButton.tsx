import React from 'react';

interface RetroButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  icon?: React.ReactNode;
}

export const RetroButton: React.FC<RetroButtonProps> = ({ 
  children, 
  variant = 'primary', 
  className = '', 
  icon,
  ...props 
}) => {
  const baseStyles = "relative inline-flex items-center justify-center px-4 py-2 font-bold uppercase transition-all active:translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed group";
  
  const variants = {
    primary: "bg-[#33ff00] text-black border-2 border-[#33ff00] hover:bg-[#2adb00] hover:border-[#2adb00]",
    secondary: "bg-transparent text-[#33ff00] border-2 border-[#33ff00] hover:bg-[#33ff00] hover:text-black",
    danger: "bg-red-600 text-white border-2 border-red-600 hover:bg-red-500",
  };

  return (
    <button className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
      {/* Pixel corner hacks could go here, but border-2 is clean enough for vt323 */}
      {icon && <span className="mr-2">{icon}</span>}
      <span className="relative z-10">{children}</span>
    </button>
  );
};
