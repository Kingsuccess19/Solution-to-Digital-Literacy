import React, { useState } from 'react';
import { Navigation } from './components/Navigation';
import { ChatTutor } from './components/ChatTutor';
import { ImageAnalyzer } from './components/ImageAnalyzer'; // Now supports Media Studio
import { QuizGenerator } from './components/QuizGenerator';
import { ResourceFinder } from './components/ResourceFinder';
import { CreativeStudio } from './components/CreativeStudio';
import { LiveSession } from './components/LiveSession';
import { AppView } from './types';
import { ICONS } from './constants';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.HOME);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const renderContent = () => {
    switch (currentView) {
      case AppView.TUTOR:
        return <ChatTutor />;
      case AppView.MEDIA:
        return <ImageAnalyzer />;
      case AppView.CREATIVE:
        return <CreativeStudio />;
      case AppView.LIVE:
        return <LiveSession />;
      case AppView.QUIZ:
        return <QuizGenerator />;
      case AppView.RESOURCES:
        return <ResourceFinder />;
      case AppView.HOME:
      default:
        return (
          <div className="h-full overflow-y-auto p-6 md:p-12 bg-black">
             <div className="max-w-4xl mx-auto text-center space-y-12">
                <div className="space-y-4 animate-fade-in">
                    <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight">
                        Empowering Africa Through <br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 via-blue-600 to-red-600">
                            Digital Literacy
                        </span>
                    </h1>
                    <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                        Your AI-powered companion. 
                        Developed by PLP AI Engineering Students from Nigeria, Sierra Leone, and Kenya.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <FeatureCard 
                        icon={ICONS.Chat} 
                        title="AI Tutor Pro" 
                        desc="Smart Chat with Thinking" 
                        color="bg-indigo-600"
                        onClick={() => setCurrentView(AppView.TUTOR)}
                    />
                    <FeatureCard 
                        icon={ICONS.Wand} 
                        title="Creative Studio" 
                        desc="Generate Art & Video" 
                        color="bg-pink-600"
                        onClick={() => setCurrentView(AppView.CREATIVE)}
                    />
                    <FeatureCard 
                        icon={ICONS.Live} 
                        title="Live Voice" 
                        desc="Real-time Conversation" 
                        color="bg-red-600"
                        onClick={() => setCurrentView(AppView.LIVE)}
                    />
                    <FeatureCard 
                        icon={ICONS.Camera} 
                        title="Media Studio" 
                        desc="Analyze & Edit Photos" 
                        color="bg-green-600"
                        onClick={() => setCurrentView(AppView.MEDIA)}
                    />
                </div>

                <div className="bg-slate-900 rounded-2xl p-8 shadow-lg border border-slate-800 mt-12 text-left">
                    <h3 className="font-bold text-lg mb-4 text-white">Why Digital Literacy Matters</h3>
                    <div className="prose text-slate-400">
                        <p>
                            In today's interconnected world, digital skills are the passport to opportunity. 
                            From creating a CV to understanding internet safety, DigiLit Africa is here to bridge the gap.
                        </p>
                    </div>
                </div>

                <div className="bg-slate-900 rounded-2xl p-8 shadow-lg border border-slate-800 mt-6 text-left">
                    <h3 className="font-bold text-lg mb-6 text-white">Contact the Team</h3>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div>
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Developers (GitHub)</h4>
                            <div className="space-y-3">
                                <a href="https://github.com/DubaKanu" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-slate-400 hover:text-indigo-400 transition group">
                                    <ICONS.Github size={18} className="text-slate-500 group-hover:text-indigo-400"/>
                                    <span className="text-sm font-medium">DubaKanu</span>
                                </a>
                                <a href="https://github.com/Kingsuccess19" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-slate-400 hover:text-indigo-400 transition group">
                                    <ICONS.Github size={18} className="text-slate-500 group-hover:text-indigo-400"/>
                                    <span className="text-sm font-medium">Kingsuccess19</span>
                                </a>
                                <a href="https://github.com/PaulNthesi254" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-slate-400 hover:text-indigo-400 transition group">
                                    <ICONS.Github size={18} className="text-slate-500 group-hover:text-indigo-400"/>
                                    <span className="text-sm font-medium">PaulNthesi254</span>
                                </a>
                            </div>
                        </div>

                        <div>
                             <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Social & Email</h4>
                             <div className="space-y-3">
                                <a href="mailto:kariukijohnpaul08@gmail.com" className="flex items-center gap-2 text-slate-400 hover:text-indigo-400 transition group">
                                    <ICONS.Mail size={18} className="text-slate-500 group-hover:text-indigo-400"/>
                                    <span className="text-sm font-medium truncate">kariukijohnpaul08@gmail.com</span>
                                </a>
                                <a href="https://x.com/patrickadah13" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-slate-400 hover:text-indigo-400 transition group">
                                    <span className="text-lg leading-none font-bold text-slate-500 group-hover:text-indigo-400 w-[18px] text-center">𝕏</span>
                                    <span className="text-sm font-medium">@patrickadah13</span>
                                </a>
                             </div>
                        </div>

                        <div>
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Phone / WhatsApp</h4>
                            <ul className="space-y-2">
                                {[
                                    "+234 813 885 0702",
                                    "+250 793 224 196",
                                    "+254 718 814 876",
                                    "+234 802 772 5312",
                                    "+254 759 500 099"
                                ].map(phone => (
                                    <li key={phone} className="flex items-center gap-2 text-slate-400 text-sm">
                                        <ICONS.Phone size={14} className="text-slate-500"/>
                                        <span>{phone}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
             </div>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-black font-sans">
      <Navigation 
        currentView={currentView} 
        onChangeView={setCurrentView}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />
      <main className="flex-1 relative h-full pt-16 md:pt-0 overflow-hidden">
        {renderContent()}
      </main>
    </div>
  );
};

const FeatureCard: React.FC<{icon: any, title: string, desc: string, color: string, onClick: () => void}> = ({
    icon: Icon, title, desc, color, onClick
}) => (
    <button onClick={onClick} className="group text-left p-6 bg-slate-900 rounded-2xl shadow-lg border border-slate-800 hover:border-slate-700 hover:shadow-indigo-900/20 hover:-translate-y-1 transition-all duration-300">
        <div className={`w-12 h-12 rounded-xl ${color} text-white flex items-center justify-center mb-4 animate-[spin_6s_linear_infinite]`}>
            <Icon size={24} />
        </div>
        <h3 className="font-bold text-lg text-white mb-1">{title}</h3>
        <p className="text-sm text-slate-400">{desc}</p>
    </button>
);

export default App;