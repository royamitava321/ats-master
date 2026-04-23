import React from 'react';
import { Bell, User, Search, Menu } from 'lucide-react';

const Navbar = ({ toggleSidebar }) => {
  return (
    <nav className="fixed top-0 left-0 right-0 h-16 glass z-50 px-4 md:px-8 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleSidebar}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors md:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center font-bold text-white">
            A
          </div>
          <span className="text-xl font-bold tracking-tight hidden sm:block">
            ATS<span className="text-primary-400">Master</span>
          </span>
        </div>
      </div>

      <div className="flex-1 max-w-xl mx-8 hidden md:block">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search resumes, jobs..." 
            className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 focus:outline-none focus:border-primary-500 transition-colors"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <button className="p-2 hover:bg-white/10 rounded-full transition-colors relative">
          <Bell className="w-5 h-5 text-slate-300" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-primary-500 rounded-full border-2 border-dark"></span>
        </button>
        <div className="h-8 w-[1px] bg-white/10 mx-1"></div>
        <button className="flex items-center gap-2 p-1 pr-3 hover:bg-white/10 rounded-full transition-colors">
          <div className="w-8 h-8 rounded-full bg-primary-900 flex items-center justify-center border border-primary-700">
            <User className="w-4 h-4 text-primary-300" />
          </div>
          <span className="text-sm font-medium hidden sm:block">Amitava Roy</span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
