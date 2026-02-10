import React, { useState } from 'react';
import { Icons } from '../common/Icons';

export const Header: React.FC<{ onMenuClick: () => void }> = ({ onMenuClick }) => {
  return (
    <header className="h-20 bg-white/90 backdrop-blur-md border-b border-border flex items-center justify-between px-6 lg:px-12 sticky top-0 z-50">
      <div className="flex items-center gap-4 lg:gap-16">
        <button className="lg:hidden p-2 text-gray-500" onClick={onMenuClick}>
          <Icons.Menu size={20} />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-black flex items-center justify-center rounded-sm">
            <Icons.Activity className="text-white" size={14} />
          </div>
          <span className="text-xs font-bold tracking-[0.25em] uppercase hidden sm:block">Premium Analytics</span>
        </div>

        <nav className="hidden lg:flex items-center gap-8">
          <a href="#" className="text-[11px] font-medium text-gray-400 hover:text-black uppercase tracking-[0.15em] transition-colors">Intelligence</a>
          <a href="#" className="text-[11px] font-semibold text-black border-b border-black pb-1 uppercase tracking-[0.15em]">Performance</a>
          <a href="#" className="text-[11px] font-medium text-gray-400 hover:text-black uppercase tracking-[0.15em] transition-colors">Ecosystem</a>
        </nav>
      </div>

      <div className="flex items-center gap-4 lg:gap-8">
        <div className="hidden sm:flex items-center gap-2 border-b border-transparent hover:border-gray-200 transition-all py-1">
          <Icons.Search className="text-gray-400" size={16} />
          <input
            type="text"
            placeholder="SEARCH..."
            className="bg-transparent border-none outline-none text-[10px] font-medium w-24 placeholder:text-gray-300 uppercase tracking-widest focus:ring-0"
          />
        </div>
        <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden border border-border cursor-pointer hover:border-gray-300 transition-colors">
          <img src="https://picsum.photos/100/100" alt="User" className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity" />
        </div>
      </div>
    </header>
  );
};