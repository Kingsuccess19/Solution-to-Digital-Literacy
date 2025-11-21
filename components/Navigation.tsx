import React from 'react';
import { AppView } from '../types';
import { ICONS, COUNTRIES } from '../constants';

interface NavigationProps {
  currentView: AppView;
  onChangeView: (view: AppView) => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ 
  currentView, 
  onChangeView,
  isMobileMenuOpen,
  setIsMobileMenuOpen
}) => {
  const navItems = [
    { id: AppView.HOME, label: 'Home', icon: ICONS.Book },
    { id: AppView.TUTOR, label: 'AI Tutor', icon: ICONS.Chat },
    { id: AppView.MEDIA, label: 'Media Studio', icon: ICONS.Camera },
    { id: AppView.CREATIVE, label: 'Create', icon: ICONS.Wand },
    { id: AppView.LIVE, label: 'Live Voice', icon: ICONS.Live },
    { id: AppView.QUIZ, label: 'Skill Check', icon: ICONS.Brain },
    { id: AppView.RESOURCES, label: 'Resources', icon: ICONS.Map },
  ];

  const handleNavClick = (view: AppView) => {
    onChangeView(view);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-black border-b border-slate-800 shadow-sm z-50 flex items-center justify-between px-4">
        <div className="font-bold text-xl flex items-center gap-2">
           <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 via-blue-600 to-red-600">
             DigiLit
           </span>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-white hover:bg-slate-800 rounded-full transition"
        >
          {isMobileMenuOpen ? <ICONS.Close /> : <ICONS.Menu />}
        </button>
      </div>

      {/* Sidebar (Desktop + Mobile Drawer) */}
      <div className={`
        fixed inset-y-0 left-0 bg-slate-900 border-r border-slate-800 text-white z-40 w-64 transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:static md:h-full shadow-xl flex flex-col
      `}>
        <div className="p-6 hidden md:block">
          <h1 className="text-2xl font-bold tracking-tight">
             <span className="text-green-400">Digi</span><span className="text-blue-400">Lit</span> <span className="text-red-400">Africa</span>
          </h1>
          <p className="text-slate-400 text-[10px] mt-1 uppercase tracking-wide">PLP AI Engineering</p>
        </div>

        <div className="mt-16 md:mt-6 flex-1 px-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-500/30' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Footer with Countries */}
        <div className="p-6 border-t border-slate-800">
          <p className="text-[10px] text-slate-500 mb-3 uppercase tracking-wider font-semibold">Powered By PLP Cohort</p>
          <div className="flex justify-between items-center">
             {COUNTRIES.map(c => (
                 <div key={c.name} className="flex flex-col items-center group cursor-default">
                    <span className="text-xl group-hover:scale-125 transition-transform">{c.flag}</span>
                 </div>
             ))}
          </div>
        </div>
      </div>
      
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/70 z-30 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
};