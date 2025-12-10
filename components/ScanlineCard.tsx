import React from 'react';

interface ScanlineCardProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
}

export const ScanlineCard: React.FC<ScanlineCardProps> = ({ children, title, className = '' }) => {
  return (
    <div className={`bg-black border-2 border-[#33ff00] shadow-[4px_4px_0px_0px_rgba(51,255,0,0.3)] ${className}`}>
      {title && (
        <div className="bg-[#33ff00] text-black px-2 py-1 font-bold uppercase text-lg border-b-2 border-[#33ff00] flex justify-between items-center">
          <span>{title}</span>
          <div className="flex gap-1">
             <div className="w-2 h-2 bg-black opacity-50"></div>
             <div className="w-2 h-2 bg-black opacity-50"></div>
             <div className="w-2 h-2 bg-black opacity-50"></div>
          </div>
        </div>
      )}
      <div className="p-4 relative overflow-hidden">
        {/* Inner grid texture */}
        <div 
            className="absolute inset-0 opacity-10 pointer-events-none" 
            style={{ 
                backgroundImage: 'linear-gradient(#33ff00 1px, transparent 1px), linear-gradient(90deg, #33ff00 1px, transparent 1px)', 
                backgroundSize: '20px 20px' 
            }}
        ></div>
        <div className="relative z-10">
            {children}
        </div>
      </div>
    </div>
  );
};
