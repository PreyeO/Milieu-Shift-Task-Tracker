import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizes = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full ${sizes[size]} bg-navy-800 border border-white/10 rounded-t-2xl sm:rounded-2xl shadow-2xl animate-fade-in max-h-[90vh] flex flex-col`}>
        <div className="flex items-center justify-between p-5 border-b border-white/10 flex-shrink-0">
          <h2 className="text-white font-semibold text-lg">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 p-5">{children}</div>
      </div>
    </div>
  );
}
