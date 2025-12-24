import React, { useState, useEffect } from 'react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const [yearProgress, setYearProgress] = useState(0);
  const [dayProgress, setDayProgress] = useState(0);
  const [currentYearRoman, setCurrentYearRoman] = useState('');

  const toRoman = (num: number): string => {
    const map: { [key: string]: number } = {
      M: 1000, CM: 900, D: 500, CD: 400, C: 100, XC: 90, L: 50, XL: 40, X: 10, IX: 9, V: 5, IV: 4, I: 1
    };
    let result = '';
    const entries = Object.entries(map).sort((a, b) => b[1] - a[1]);
    for (const [key, value] of entries) {
      const repeat = Math.floor(num / value);
      result += key.repeat(repeat);
      num %= value;
    }
    return result;
  };

  useEffect(() => {
    const calculateProgress = () => {
      const now = new Date();
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      const endOfYear = new Date(now.getFullYear() + 1, 0, 1);
      const yProgress = ((now.getTime() - startOfYear.getTime()) / (endOfYear.getTime() - startOfYear.getTime())) * 100;
      setYearProgress(yProgress);
      setCurrentYearRoman(toRoman(now.getFullYear()));

      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      const msInDay = 24 * 60 * 60 * 1000;
      const dProgress = ((now.getTime() - startOfDay) / msInDay) * 100;
      setDayProgress(dProgress);
    };

    calculateProgress();
    const timer = setInterval(calculateProgress, 500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="h-full flex flex-col md:flex-row bg-[#0a0a0a]">
      {/* Desktop Sidebar */}
      <nav className="hidden md:flex flex-col w-16 bg-[#0a0a0a] border-r border-white/5 items-center py-8 gap-6 z-40 h-full">
        <NavItem label="Now" icon="＋" active={activeTab === 'today'} onClick={() => setActiveTab('today')} />
        <NavItem label="Registry" icon="≡" active={activeTab === 'habits'} onClick={() => setActiveTab('habits')} />
        <NavItem label="Metrics" icon="▤" active={activeTab === 'stats'} onClick={() => setActiveTab('stats')} />
        <NavItem label="Soul" icon="✎" active={activeTab === 'notes'} onClick={() => setActiveTab('notes')} />
      </nav>

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Header */}
        <header className="px-5 pt-5 pb-3 bg-[#0a0a0a]/95 backdrop-blur-xl flex justify-between items-center safe-top border-b border-white/5 sticky top-0 z-40">
          <div className="flex flex-col gap-1.5">
            <h1 className="text-lg font-black text-white tracking-[0.2em] uppercase leading-none">Aura</h1>
            <div className="flex items-center gap-2">
              <span className="text-[6px] font-black tracking-[0.25em] uppercase text-[#525252]">Day: {dayProgress.toFixed(2)}%</span>
              <div className="w-12 h-[1px] bg-[#1a1a1a] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-white transition-all duration-700 ease-linear shadow-[0_0_6px_rgba(255,255,255,0.4)]" 
                  style={{ width: `${dayProgress}%` }} 
                />
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-1">
            <span className="text-[7px] font-black tracking-[0.25em] uppercase text-white/40">{currentYearRoman}</span>
            <div className="flex items-center gap-2">
              <span className="text-[6px] font-black tracking-[0.15em] text-[#525252] uppercase">Year: {yearProgress.toFixed(3)}%</span>
              <div className="w-16 h-[1.5px] bg-[#1a1a1a] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-white opacity-40 shadow-[0_0_6px_rgba(255,255,255,0.2)]" 
                  style={{ width: `${yearProgress}%` }} 
                />
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto px-4 pb-20 md:pb-8 pt-1 safe-bottom">
          <div className="max-w-xl mx-auto w-full">
            {children}
          </div>
        </main>

        {/* Mobile Nav */}
        <nav className="fixed bottom-0 left-0 right-0 h-14 bg-[#0a0a0a]/90 backdrop-blur-2xl flex items-center justify-around md:hidden px-3 z-40 safe-bottom border-t border-white/5">
          <NavItem label="Now" icon="＋" active={activeTab === 'today'} onClick={() => setActiveTab('today')} />
          <NavItem label="Registry" icon="≡" active={activeTab === 'habits'} onClick={() => setActiveTab('habits')} />
          <NavItem label="Metrics" icon="▤" active={activeTab === 'stats'} onClick={() => setActiveTab('stats')} />
          <NavItem label="Soul" icon="✎" active={activeTab === 'notes'} onClick={() => setActiveTab('notes')} />
        </nav>
      </div>
    </div>
  );
};

interface NavItemProps {
  label: string;
  icon: string;
  active: boolean;
  onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ label, icon, active, onClick }) => {
  return (
    <button 
      onClick={onClick} 
      className="flex flex-col items-center justify-center gap-0.5 group min-w-[54px] h-full outline-none"
    >
      <div className={`w-10 h-7 flex items-center justify-center transition-all duration-300 rounded-xl ${active ? 'bg-white/10' : 'bg-transparent'}`}>
        <span className={`text-lg font-black ${active ? 'text-white scale-105 drop-shadow-[0_0_6px_rgba(255,255,255,0.3)]' : 'text-[#404040] opacity-60'}`}>{icon}</span>
      </div>
      <span className={`text-[6px] uppercase font-black tracking-[0.15em] transition-colors duration-300 ${active ? 'text-white' : 'text-[#404040]'}`}>
        {label}
      </span>
    </button>
  );
};

export default Layout;