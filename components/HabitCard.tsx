import React from 'react';
import { Habit, HabitLog, HabitHistoryStats } from '../types';
import { CATEGORY_COLORS, CATEGORY_ICONS } from '../constants';

interface HabitCardProps {
  habit: Habit;
  log?: HabitLog;
  stats?: HabitHistoryStats;
  onUpdate: (habitId: string, delta: number) => void;
  onDelete?: (habitId: string) => void;
  onEdit?: (habit: Habit) => void;
  onView?: (habit: Habit) => void;
  showDecrement?: boolean;
  hideButtons?: boolean;
}

const HabitCard: React.FC<HabitCardProps> = ({ 
  habit, 
  log, 
  stats, 
  onUpdate, 
  onDelete, 
  onEdit, 
  onView,
  showDecrement = true,
  hideButtons = false
}) => {
  const currentCount = log?.count || 0;
  const progress = Math.min((currentCount / habit.goalCount) * 100, 100);
  const isCompleted = currentCount >= habit.goalCount;

  const handleUpdate = (e: React.MouseEvent, delta: number) => {
    e.stopPropagation();
    if ('vibrate' in navigator) {
      navigator.vibrate(delta > 0 ? [8] : [4]);
    }
    onUpdate(habit.id, delta);
  };

  const handleCardClick = () => {
    if (hideButtons && onView) {
      onView(habit);
    }
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) onEdit(habit);
  };

  return (
    <div 
      onClick={handleCardClick}
      className={`group relative bg-[#161616] rounded-xl flex flex-col transition-all active:bg-[#1a1a1a] hover:bg-[#1c1c1c] overflow-hidden ${hideButtons ? 'cursor-pointer' : ''}`}
    >
      <div className="flex items-center gap-2.5 px-2.5 py-2">
        {/* Category Icon */}
        <div className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-[9px] font-bold transition-colors ${CATEGORY_COLORS[habit.category]}`}>
          {CATEGORY_ICONS[habit.category]}
        </div>

        {/* Habit Info & Progress */}
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <div className="flex items-baseline justify-between gap-2">
            <div className="flex flex-col min-w-0">
              <h3 className="font-bold text-[12px] text-[#e5e5e5] tracking-tight truncate leading-tight">
                {habit.name}
              </h3>
              {habit.anchor && (
                <p className="text-[6.5px] text-[#525252] italic font-medium truncate mt-0.5">
                  Trigger: {habit.anchor}
                </p>
              )}
            </div>
            <span className={`text-[9px] font-bold tabular-nums ${isCompleted ? "text-white" : "text-[#525252]"}`}>
              {currentCount}/{habit.goalCount}
            </span>
          </div>
          
          {/* Minimal Progress Bar */}
          <div className="mt-1.5 w-full h-[1px] bg-[#262626] rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-700 ease-out rounded-full ${isCompleted ? 'bg-white shadow-[0_0_4px_white]' : 'bg-[#525252]'}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Mini Actions */}
        <div className="flex items-center gap-1.5 ml-1">
          {onEdit && (
            <button 
              onClick={handleEditClick}
              className="w-6 h-6 rounded-lg flex items-center justify-center text-[#404040] hover:text-white transition-colors text-[9px] md:opacity-0 group-hover:opacity-100"
            >
              ✎
            </button>
          )}
          
          {/* Controls */}
          {!hideButtons && (
            <div className="flex items-center bg-[#0a0a0a]/50 rounded-lg p-0.5">
              {showDecrement && (
                <>
                  <button 
                    onClick={(e) => handleUpdate(e, -1)}
                    disabled={currentCount === 0}
                    className="w-7 h-7 rounded-md text-[#737373] font-bold disabled:opacity-5 hover:text-white active:bg-white/5 transition-all flex items-center justify-center text-base"
                  >
                    －
                  </button>
                  <div className="w-[0.5px] h-2.5 bg-[#262626]" />
                </>
              )}
              <button 
                onClick={(e) => handleUpdate(e, 1)}
                className="w-7 h-7 rounded-md text-white font-bold hover:scale-110 active:scale-90 transition-all flex items-center justify-center text-base"
              >
                ＋
              </button>
            </div>
          )}

          {hideButtons && (
            <div className="w-7 h-7 flex items-center justify-center text-[#404040]">
              ▤
            </div>
          )}
        </div>
      </div>

      {/* Yearly Pulse Visualization */}
      {stats?.yearlyPulse && (
        <div className="w-full h-[1px] flex bg-[#0d0d0d] mt-0.5 opacity-50">
          {stats.yearlyPulse.map((done, idx) => (
            <div 
              key={idx} 
              className={`flex-1 h-full ${done ? 'bg-white opacity-70' : 'bg-[#262626] opacity-15'}`}
              style={{ minWidth: '1px' }}
            />
          ))}
        </div>
      )}

      {/* Optional Streak Dot */}
      {stats && stats.streak > 0 && (
        <div className="absolute top-1 left-1 w-1 h-1 bg-white rounded-full border border-[#161616] z-10 shadow-sm" title={`${stats.streak} day streak`} />
      )}
    </div>
  );
};

export default HabitCard;