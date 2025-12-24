import React from 'react';
import { Habit, HabitLog } from '../types';

interface HabitMonthModalProps {
  habit: Habit;
  logs: HabitLog[];
  onClose: () => void;
}

const HabitMonthModal: React.FC<HabitMonthModalProps> = ({ habit, logs, onClose }) => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 (Sun) to 6 (Sat)
  
  const monthName = now.toLocaleString('default', { month: 'long' });
  
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  const getLogForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return logs.find(l => l.habitId === habit.id && l.date === dateStr);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative bg-[#161616] w-full max-w-sm rounded-2xl p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight leading-none mb-2">{habit.name}</h2>
            <p className="text-[8px] font-bold uppercase tracking-[0.3em] text-[#737373]">
              {monthName} {year} Cycle
            </p>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#262626] flex items-center justify-center text-white font-bold hover:bg-[#404040] transition-colors text-xs"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-7 gap-y-4 mb-8">
          {weekDays.map((wd, i) => (
            <div key={i} className="text-center text-[8px] font-bold text-[#404040] uppercase tracking-widest pb-2">
              {wd}
            </div>
          ))}
          
          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}

          {days.map(day => {
            const log = getLogForDay(day);
            const count = log?.count || 0;
            const isToday = day === now.getDate();
            const isCompleted = count >= habit.goalCount;
            const hasActivity = count > 0;

            return (
              <div key={day} className="flex flex-col items-center justify-center group">
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isCompleted 
                      ? 'bg-white' 
                      : hasActivity 
                        ? 'bg-white/20' 
                        : 'bg-[#0a0a0a]'
                  } ${isToday ? 'ring-2 ring-white ring-offset-2 ring-offset-[#161616]' : ''}`}
                >
                  {isCompleted && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
                </div>
                <span className={`text-[6px] font-bold mt-2 ${isToday ? 'text-white' : 'text-[#404040]'}`}>
                  {day}
                </span>
              </div>
            );
          })}
        </div>

        <div className="pt-6 border-t border-[#0a0a0a] flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-white" />
              <span className="text-[7px] font-bold uppercase tracking-widest text-[#737373]">Completed</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-[#0a0a0a]" />
              <span className="text-[7px] font-bold uppercase tracking-widest text-[#737373]">Pending</span>
            </div>
          </div>
          <div className="text-[7px] font-bold uppercase tracking-widest text-white bg-[#0a0a0a] px-2 py-1 rounded-lg">
            TOTAL: {logs.filter(l => l.habitId === habit.id && l.count >= habit.goalCount).length}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HabitMonthModal;