import React, { useState, useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  LineChart,
  Line,
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid
} from 'recharts';
import { HabitLog, Habit, HabitCategory } from '../types';
import { CATEGORY_SHORT_FORMS } from '../constants';

interface ProgressChartProps {
  logs: HabitLog[];
  habits: Habit[];
}

type TimeRange = 'TODAY' | '7D' | '4W' | 'ALL';
const CATEGORIES: (HabitCategory | 'All')[] = ['All', 'Appreciating', 'Depreciating', 'Neutral', 'Core'];

const ProgressChart: React.FC<ProgressChartProps> = ({ logs, habits }) => {
  const [range, setRange] = useState<TimeRange>('7D');
  const [selectedCategory, setSelectedCategory] = useState<HabitCategory | 'All'>('All');
  const [chartType, setChartType] = useState<'BAR' | 'LINE'>('BAR');

  const activeHabits = useMemo(() => {
    if (selectedCategory === 'All') return habits;
    return habits.filter(h => h.category === selectedCategory);
  }, [habits, selectedCategory]);

  const chartData = useMemo(() => {
    if (logs.length === 0) return [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const getCountForDate = (dateStr: string) => {
      const habitIdsInScope = activeHabits.map(h => h.id);
      return logs
        .filter(l => l.date === dateStr && habitIdsInScope.includes(l.habitId))
        .reduce((acc, curr) => acc + curr.count, 0);
    };

    if (range === 'TODAY') {
      const dateStr = today.toISOString().split('T')[0];
      const entry: any = { name: 'Today' };
      activeHabits.forEach(h => {
        entry[h.name] = logs.filter(l => l.date === dateStr && l.habitId === h.id).reduce((acc, c) => acc + c.count, 0);
      });
      entry.total = getCountForDate(dateStr);
      return [entry];
    }

    if (range === '7D') {
      return Array.from({ length: 7 }).map((_, i) => {
        const d = new Date(today);
        d.setDate(today.getDate() - (6 - i));
        const dateStr = d.toISOString().split('T')[0];
        const entry: any = { 
          name: d.toLocaleDateString('en-US', { weekday: 'short' }),
          date: dateStr
        };
        activeHabits.forEach(h => {
          entry[h.name] = logs.filter(l => l.date === dateStr && l.habitId === h.id).reduce((acc, c) => acc + c.count, 0);
        });
        entry.total = getCountForDate(dateStr);
        return entry;
      });
    }

    if (range === '4W') {
      return Array.from({ length: 4 }).map((_, i) => {
        const d = new Date(today);
        d.setDate(today.getDate() - (3 - i) * 7);
        const start = new Date(d);
        start.setDate(d.getDate() - d.getDay());
        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        
        const entry: any = { name: `W${4 - i}` };
        const rangeLogs = logs.filter(l => {
          const ld = new Date(l.date);
          return ld >= start && ld <= end && activeHabits.some(h => h.id === l.habitId);
        });

        activeHabits.forEach(h => {
          entry[h.name] = rangeLogs.filter(l => l.habitId === h.id).reduce((acc, c) => acc + c.count, 0);
        });
        entry.total = rangeLogs.reduce((acc, c) => acc + c.count, 0);
        return entry;
      });
    }

    if (range === 'ALL') {
      const monthGroups: Record<string, any> = {};
      const sortedLogs = [...logs].filter(l => activeHabits.some(h => h.id === l.habitId)).sort((a, b) => a.date.localeCompare(b.date));
      
      if (sortedLogs.length === 0) return [];

      sortedLogs.forEach(log => {
        const [y, m] = log.date.split('-');
        const monthKey = `${y}-${m}`;
        if (!monthGroups[monthKey]) {
          const monthName = new Date(parseInt(y), parseInt(m) - 1).toLocaleDateString('en-US', { month: 'short' });
          monthGroups[monthKey] = { name: `${monthName} ${y.slice(-2)}`, date: monthKey };
          activeHabits.forEach(h => monthGroups[monthKey][h.name] = 0);
          monthGroups[monthKey].total = 0;
        }

        const habit = activeHabits.find(h => h.id === log.habitId);
        if (habit) {
          monthGroups[monthKey][habit.name] += log.count;
          monthGroups[monthKey].total += log.count;
        }
      });

      return Object.values(monthGroups);
    }

    return [];
  }, [logs, range, selectedCategory, activeHabits]);

  const colors = ['#ffffff', '#a3a3a3', '#525252', '#404040', '#262626'];

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2">
        <div className="flex gap-1 bg-[#161616] p-0.5 rounded-lg w-full">
          {(['TODAY', '7D', '4W', 'ALL'] as TimeRange[]).map(r => (
            <button
              key={r}
              onClick={() => { setRange(r); if ('vibrate' in navigator) navigator.vibrate(2); }}
              className={`flex-1 text-[6px] font-bold py-1.5 rounded-md transition-all uppercase tracking-widest ${
                range === r ? 'bg-white text-black shadow-sm' : 'text-[#525252] hover:text-[#e5e5e5]'
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        <div className="flex gap-1 overflow-x-auto pb-0.5 no-scrollbar">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => { setSelectedCategory(cat); if ('vibrate' in navigator) navigator.vibrate(2); }}
              className={`flex-shrink-0 text-[6px] font-bold px-3 py-1.5 rounded-lg transition-all uppercase tracking-widest ${
                selectedCategory === cat ? 'bg-white text-black' : 'bg-[#161616] text-[#525252]'
              }`}
            >
              {CATEGORY_SHORT_FORMS[cat] || cat}
            </button>
          ))}
        </div>

        <div className="flex justify-end items-center px-1">
          <div className="flex gap-0.5 bg-[#161616] p-0.5 rounded-md">
            {(['BAR', 'LINE'] as const).map(t => (
              <button
                key={t}
                onClick={() => setChartType(t)}
                className={`text-[6px] font-bold px-2 py-0.5 rounded transition-all uppercase tracking-widest ${
                  chartType === t ? 'bg-white text-black' : 'text-[#525252] hover:text-[#e5e5e5]'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="h-52 w-full bg-[#161616] rounded-2xl p-4 shadow-xl relative overflow-hidden">
        <div className="absolute top-3 left-4 z-10">
          <h3 className="text-[6px] font-bold uppercase tracking-[0.2em] text-[#737373]">
            {selectedCategory === 'All' ? 'Full Spectrum' : `${selectedCategory} Insights`}
          </h3>
        </div>
        
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'BAR' ? (
            <BarChart data={chartData} margin={{ top: 15, right: 0, left: -38, bottom: 0 }}>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#404040', fontSize: 6, fontWeight: 700 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#404040', fontSize: 6, fontWeight: 700 }} />
              <Tooltip 
                cursor={{ fill: '#262626', opacity: 0.1 }}
                contentStyle={{ borderRadius: '10px', border: 'none', backgroundColor: '#0a0a0a', color: '#e5e5e5', fontSize: '7px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em', boxShadow: '0 8px 12px -3px rgb(0 0 0 / 0.5)' }}
              />
              {activeHabits.map((h, i) => (
                <Bar key={h.id} dataKey={h.name} stackId="a" fill={colors[i % colors.length]} radius={[1, 1, 0, 0]} barSize={range === 'TODAY' ? 36 : 14} />
              ))}
            </BarChart>
          ) : (
            <LineChart data={chartData} margin={{ top: 15, right: 10, left: -38, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1f1f1f" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#404040', fontSize: 6, fontWeight: 700 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#404040', fontSize: 6, fontWeight: 700 }} />
              <Tooltip contentStyle={{ borderRadius: '10px', border: 'none', backgroundColor: '#0a0a0a', color: '#e5e5e5', fontSize: '7px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em', boxShadow: '0 8px 12px -3px rgb(0 0 0 / 0.5)' }} />
              {activeHabits.map((h, i) => (
                <Line key={h.id} type="monotone" dataKey={h.name} stroke={colors[i % colors.length]} strokeWidth={1.5} dot={{ r: 1.5 }} activeDot={{ r: 3 }} />
              ))}
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ProgressChart;