import React, { useState } from 'react';
import { Habit, HabitCategory } from '../types';
import { CATEGORY_SHORT_FORMS } from '../constants';

interface AddHabitModalProps {
  onClose: () => void;
  onSave: (habit: Omit<Habit, 'id' | 'createdAt'> & { id?: string }, initialDate?: string) => void;
  initialHabit?: Habit;
}

const CATEGORIES: HabitCategory[] = ['Appreciating', 'Depreciating', 'Neutral', 'Core'];

const AddHabitModal: React.FC<AddHabitModalProps> = ({ onClose, onSave, initialHabit }) => {
  const [name, setName] = useState(initialHabit?.name || '');
  const [anchor, setAnchor] = useState(initialHabit?.anchor || '');
  const [category, setCategory] = useState<HabitCategory>(initialHabit?.category || 'Core');
  const [goalCount, setGoalCount] = useState(initialHabit?.goalCount || 1);
  const [frequency, setFrequency] = useState<'daily' | 'weekly'>(initialHabit?.frequency || 'daily');
  const [logDate] = useState(new Date().toISOString().split('T')[0]);
  const [autoLog] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    onSave({ 
      id: initialHabit?.id,
      name, 
      anchor,
      category, 
      goalCount, 
      frequency, 
      color: '#ffffff'
    }, autoLog ? logDate : undefined);
    
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      
      <form 
        onSubmit={handleSubmit}
        className="relative bg-[#0a0a0a] w-full max-w-lg rounded-t-2xl p-5 shadow-2xl animate-in slide-in-from-bottom duration-300 safe-bottom"
      >
        <div className="w-7 h-0.5 bg-[#262626] rounded-full mx-auto mb-4"></div>

        <h2 className="text-[10px] font-bold text-white uppercase tracking-[0.25em] mb-5 text-center">
          {initialHabit ? 'Refine' : 'Define'} Discipline
        </h2>
        
        <div className="space-y-3.5">
          <div className="space-y-1">
            <label className="text-[6.5px] font-bold uppercase tracking-[0.15em] text-[#737373]">Instruction</label>
            <input 
              autoFocus
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Habit name (e.g., Meditation)"
              className="w-full h-10 px-3.5 rounded-xl bg-[#161616] text-white text-[11px] font-medium placeholder:text-[#404040] focus:ring-1 focus:ring-white transition-all outline-none"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-[6.5px] font-bold uppercase tracking-[0.15em] text-[#737373]">The Anchor (Stacking)</label>
            <input 
              type="text"
              value={anchor}
              onChange={(e) => setAnchor(e.target.value)}
              placeholder="After I... (e.g., brew my coffee)"
              className="w-full h-10 px-3.5 rounded-xl bg-[#161616] text-white text-[11px] font-medium placeholder:text-[#404040] focus:ring-1 focus:ring-white transition-all outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[6.5px] font-bold uppercase tracking-[0.15em] text-[#737373]">Category</label>
            <div className="flex gap-1">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`flex-1 h-9 rounded-lg text-[6.5px] font-bold uppercase tracking-widest transition-all ${
                    category === cat 
                      ? 'bg-white text-black' 
                      : 'text-[#737373] bg-[#161616]'
                  }`}
                >
                  {CATEGORY_SHORT_FORMS[cat]}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-1 space-y-1">
              <label className="text-[6.5px] font-bold uppercase tracking-[0.15em] text-[#737373]">Quantity</label>
              <input 
                type="number"
                min="1"
                value={goalCount}
                onChange={(e) => setGoalCount(parseInt(e.target.value) || 1)}
                className="w-full h-10 px-3.5 rounded-xl bg-[#161616] text-white font-bold text-center text-[11px] outline-none"
              />
            </div>
            <div className="flex-1 space-y-1">
              <label className="text-[6.5px] font-bold uppercase tracking-[0.15em] text-[#737373]">Interval</label>
              <select 
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as 'daily' | 'weekly')}
                className="w-full h-10 px-3.5 rounded-xl bg-[#161616] text-white font-bold appearance-none text-center text-[8px] uppercase tracking-widest outline-none"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>
          </div>

          <button 
            type="submit"
            className="w-full h-11 rounded-xl bg-white text-black font-bold text-[9px] uppercase tracking-[0.15em] shadow-xl active:scale-95 transition-all mt-1"
          >
            {initialHabit ? 'Save Changes' : 'Commit to Life'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddHabitModal;