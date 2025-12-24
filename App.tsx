import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Habit, HabitLog, HabitHistoryStats, HabitCategory, Note } from './types';
import Layout from './components/Layout';
import HabitCard from './components/HabitCard';
import AddHabitModal from './components/AddHabitModal';
import ProgressChart from './components/ProgressChart';
import HabitMonthModal from './components/HabitMonthModal';
import NotesTab from './components/NotesTab';
import { CATEGORY_SHORT_FORMS } from './constants';

const STORAGE_KEY_HABITS = 'aura_habits';
const STORAGE_KEY_LOGS = 'aura_logs';
const STORAGE_KEY_NOTES = 'aura_notes';
const CATEGORIES: (HabitCategory | 'All')[] = ['All', 'Appreciating', 'Depreciating', 'Neutral', 'Core'];

const App: React.FC = () => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeTab, setActiveTab] = useState('today');
  const [selectedCategory, setSelectedCategory] = useState<HabitCategory | 'All'>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | undefined>(undefined);
  const [viewingHabit, setViewingHabit] = useState<Habit | undefined>(undefined);

  useEffect(() => {
    const savedHabits = localStorage.getItem(STORAGE_KEY_HABITS);
    const savedLogs = localStorage.getItem(STORAGE_KEY_LOGS);
    const savedNotes = localStorage.getItem(STORAGE_KEY_NOTES);
    if (savedHabits) setHabits(JSON.parse(savedHabits));
    if (savedLogs) setLogs(JSON.parse(savedLogs));
    if (savedNotes) setNotes(JSON.parse(savedNotes));
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_HABITS, JSON.stringify(habits));
    localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(logs));
    localStorage.setItem(STORAGE_KEY_NOTES, JSON.stringify(notes));
  }, [habits, logs, notes]);

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  const getDateNDaysAgo = (n: number) => {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d.toISOString().split('T')[0];
  };

  const calculateStats = useCallback((habit: Habit, currentLogs: HabitLog[]): HabitHistoryStats => {
    const yearlyPulse: boolean[] = [];
    const lastSevenDays: boolean[] = [];
    let completedCount7 = 0;
    
    for (let i = 29; i >= 0; i--) {
      const date = getDateNDaysAgo(i);
      const log = currentLogs.find(l => l.habitId === habit.id && l.date === date);
      const isDone = (log?.count || 0) >= habit.goalCount;
      yearlyPulse.push(isDone);
      
      if (i < 7) {
        lastSevenDays.push(isDone);
        if (isDone) completedCount7++;
      }
    }

    let streak = 0;
    let dayOffset = 0;
    while (dayOffset < 365) {
      const date = getDateNDaysAgo(dayOffset);
      const log = currentLogs.find(l => l.habitId === habit.id && l.date === date);
      const isDone = (log?.count || 0) >= habit.goalCount;
      if (isDone) { 
        streak++; 
        dayOffset++; 
      } else { 
        if (dayOffset === 0) { 
          dayOffset++; 
          continue; 
        } 
        break; 
      }
    }

    return { 
      streak, 
      lastSevenDays, 
      yearlyPulse,
      completionRate: (completedCount7 / 7) * 100 
    };
  }, []);

  const handleSaveHabit = (habitData: Omit<Habit, 'id' | 'createdAt'> & { id?: string }, initialLogDate?: string) => {
    if (habitData.id) {
      setHabits(prev => prev.map(h => h.id === habitData.id ? { ...h, ...habitData } as Habit : h));
    } else {
      const finalId = crypto.randomUUID();
      const newHabit: Habit = { ...habitData, id: finalId, createdAt: Date.now() } as Habit;
      setHabits(prev => [newHabit, ...prev]);

      if (initialLogDate && finalId) {
        setLogs(prev => [...prev, { 
          id: crypto.randomUUID(), 
          habitId: finalId as string, 
          date: initialLogDate, 
          count: habitData.goalCount 
        }]);
      }
    }
    setIsModalOpen(false);
    setEditingHabit(undefined);
  };

  const handleDeleteHabit = (id: string) => {
    if (confirm('Cease this discipline permanently?')) {
      setHabits(prev => prev.filter(h => h.id !== id));
      setLogs(prev => prev.filter(l => l.habitId !== id));
    }
  };

  const handleUpdateLog = (habitId: string, delta: number) => {
    setLogs(prev => {
      const existingIdx = prev.findIndex(l => l.habitId === habitId && l.date === todayStr);
      if (existingIdx > -1) {
        const newLogs = [...prev];
        const newCount = Math.max(0, newLogs[existingIdx].count + delta);
        newLogs[existingIdx] = { ...newLogs[existingIdx], count: newCount };
        return newLogs;
      } else if (delta > 0) {
        return [...prev, { id: crypto.randomUUID(), habitId, date: todayStr, count: delta }];
      }
      return prev;
    });
  };

  const filteredHabitData = useMemo(() => {
    const baseData = habits.map(h => ({ 
      habit: h, 
      log: logs.find(l => l.habitId === h.id && l.date === todayStr), 
      stats: calculateStats(h, logs) 
    }));
    
    if (selectedCategory === 'All') return baseData;
    return baseData.filter(item => item.habit.category === selectedCategory);
  }, [habits, logs, todayStr, selectedCategory, calculateStats]);

  const sortedNotes = useMemo(() => {
    return [...notes].sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return b.updatedAt - a.updatedAt;
    });
  }, [notes]);

  const CategoryFilter = () => (
    <div className="flex gap-1.5 pb-2 mb-1 overflow-x-auto no-scrollbar scroll-smooth">
      {CATEGORIES.map(cat => (
        <button
          key={cat}
          onClick={() => { setSelectedCategory(cat); if ('vibrate' in navigator) navigator.vibrate(4); }}
          className={`flex-shrink-0 px-4 py-2 rounded-lg text-[7.5px] font-extrabold uppercase tracking-[0.15em] transition-all duration-300 ${
            selectedCategory === cat 
            ? 'bg-white text-black shadow-[0_3px_10px_rgba(255,255,255,0.12)] scale-105' 
            : 'bg-[#161616] text-[#525252] hover:text-[#e5e5e5]'
          }`}
        >
          {CATEGORY_SHORT_FORMS[cat]}
        </button>
      ))}
    </div>
  );

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      <div className="py-3 space-y-5 animate-tab-content">
        {activeTab === 'today' && (
          <>
            <div className="flex justify-between items-end mb-3">
              <div className="min-w-0 flex-1">
                <p className="text-[8px] font-bold uppercase tracking-[0.3em] text-[#525252] mb-1">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                </p>
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-extrabold text-white tracking-tighter">Current Task</h2>
                  <button 
                    onClick={() => { setEditingHabit(undefined); setIsModalOpen(true); }}
                    className="w-7 h-7 bg-white text-black rounded-lg flex items-center justify-center text-base font-bold shadow-xl active:scale-90 transition-transform cursor-pointer"
                  >
                    ＋
                  </button>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                 <span className="text-[9px] font-black text-white px-2.5 py-1.5 bg-[#161616] rounded-xl border border-white/5">
                   {habits.filter(h => (logs.find(l => l.habitId === h.id && l.date === todayStr)?.count || 0) >= h.goalCount).length} <span className="text-[#525252]">/</span> {habits.length}
                 </span>
              </div>
            </div>

            <CategoryFilter />

            <div className="grid grid-cols-1 gap-2.5">
              {filteredHabitData.length > 0 ? (
                filteredHabitData.map(({ habit, log, stats }) => (
                  <HabitCard 
                    key={habit.id} 
                    habit={habit} 
                    log={log} 
                    stats={stats} 
                    onUpdate={handleUpdateLog} 
                    onEdit={(h) => { setEditingHabit(h); setIsModalOpen(true); }}
                    showDecrement={false}
                  />
                ))
              ) : (
                <div className="py-20 text-center bg-[#161616] rounded-2xl border border-dashed border-[#262626]">
                  <p className="text-[#525252] text-[9px] uppercase font-bold tracking-[0.2em] mb-5">No duties identified in this spectrum.</p>
                  <button 
                    onClick={() => { setEditingHabit(undefined); setIsModalOpen(true); }} 
                    className="bg-white text-black text-[9px] px-7 py-3 rounded-xl font-black uppercase tracking-[0.15em] shadow-2xl active:scale-95 transition-all"
                  >
                    Initialize Registry
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === 'habits' && (
          <>
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-2xl font-extrabold text-white tracking-tighter">Registry</h2>
              <button 
                onClick={() => { setEditingHabit(undefined); setIsModalOpen(true); }}
                className="w-7 h-7 bg-white text-black rounded-lg flex items-center justify-center text-base font-bold shadow-xl active:scale-90 transition-transform cursor-pointer"
              >
                ＋
              </button>
            </div>

            <CategoryFilter />

            <div className="grid grid-cols-1 gap-2.5">
              {filteredHabitData.map(({ habit, log, stats }) => (
                <HabitCard 
                  key={habit.id} 
                  habit={habit} 
                  log={log}
                  stats={stats} 
                  onUpdate={handleUpdateLog} 
                  onDelete={handleDeleteHabit} 
                  onEdit={(h) => { setEditingHabit(h); setIsModalOpen(true); }}
                  onView={(h) => setViewingHabit(h)}
                  hideButtons={true}
                />
              ))}
            </div>
          </>
        )}

        {activeTab === 'stats' && (
          <div className="space-y-5">
            <h2 className="text-2xl font-extrabold text-white tracking-tighter mb-3">Growth Curve</h2>
            <ProgressChart logs={logs} habits={habits} />
            <div className="bg-[#161616] rounded-2xl p-5 space-y-3 shadow-2xl border border-white/5">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#0a0a0a] p-4 rounded-xl border border-white/5">
                  <p className="text-[7.5px] text-[#525252] uppercase font-black tracking-[0.15em] mb-1.5">Aggregate Effort</p>
                  <p className="text-2xl font-black text-white">{logs.reduce((acc, l) => acc + l.count, 0)}</p>
                </div>
                <div className="bg-[#0a0a0a] p-4 rounded-xl border border-white/5">
                  <p className="text-[7.5px] text-[#525252] uppercase font-black tracking-[0.15em] mb-1.5">Max Consistency</p>
                  <p className="text-2xl font-black text-white">{habits.length > 0 ? Math.max(0, ...habits.map(h => calculateStats(h, logs).streak)) : 0} <span className="text-[9px] text-[#525252]">D</span></p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notes' && (
          <NotesTab 
            notes={sortedNotes} 
            onAdd={(n) => setNotes(prev => [{ ...n, id: crypto.randomUUID(), createdAt: Date.now(), updatedAt: Date.now() }, ...prev])} 
            onUpdate={(id, n) => setNotes(prev => prev.map(item => item.id === id ? { ...item, ...n, updatedAt: Date.now() } : item))} 
            onDelete={(id) => setNotes(prev => prev.filter(n => n.id !== id))}
            onTogglePin={(id) => setNotes(prev => prev.map(n => n.id === id ? { ...n, isPinned: !n.isPinned, updatedAt: Date.now() } : n))}
          />
        )}
      </div>

      {isModalOpen && (
        <AddHabitModal 
          onClose={() => { setIsModalOpen(false); setEditingHabit(undefined); }} 
          onSave={handleSaveHabit} 
          initialHabit={editingHabit}
        />
      )}

      {viewingHabit && (
        <HabitMonthModal 
          habit={viewingHabit} 
          logs={logs} 
          onClose={() => setViewingHabit(undefined)} 
        />
      )}
    </Layout>
  );
};

export default App;