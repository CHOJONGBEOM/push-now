import React from 'react';
import { Icons } from '../common/Icons';

export const Sidebar: React.FC = () => {
  return (
    <aside className="w-72 bg-white border-r border-border flex-col hidden xl:flex h-screen sticky top-0">
      <div className="p-10 flex-1">
        <div className="mb-12">
          <h3 className="text-[10px] font-bold text-gray-300 uppercase tracking-[0.25em] mb-6">Strategic Modules</h3>
          <nav className="flex flex-col gap-1">
            <a href="#" className="flex items-center gap-4 px-3 py-3 text-gray-400 hover:text-black transition-colors group">
              <Icons.Trending size={16} className="group-hover:scale-110 transition-transform" />
              <span className="text-xs font-medium tracking-wide">Market Dynamics</span>
            </a>
            <a href="#" className="flex items-center gap-4 px-3 py-3 text-black bg-gray-50 border-r-2 border-black -mr-10">
              <Icons.Box size={16} />
              <span className="text-xs font-semibold tracking-wide">Pattern Analysis</span>
            </a>
            <a href="#" className="flex items-center gap-4 px-3 py-3 text-gray-400 hover:text-black transition-colors group">
              <Icons.Pie size={16} className="group-hover:scale-110 transition-transform" />
              <span className="text-xs font-medium tracking-wide">Competitive Edge</span>
            </a>
          </nav>
        </div>
      </div>

      <div className="p-8 border-t border-border">
        <div className="bg-gray-50 p-5 border border-border">
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-2">Engine Status</p>
          <div className="flex items-center gap-2">
            <div className="w-1 h-1 bg-black rounded-full animate-pulse"></div>
            <p className="text-[10px] font-medium text-gray-600">Enterprise v3.2 Optimal</p>
          </div>
        </div>
      </div>
    </aside>
  );
};