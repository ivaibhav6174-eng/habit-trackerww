import React, { useState } from 'react';
import { Note } from '../types';

interface NotesTabProps {
  notes: Note[];
  onAdd: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdate: (id: string, note: Partial<Omit<Note, 'id' | 'createdAt'>>) => void;
  onDelete: (id: string) => void;
  onTogglePin: (id: string) => void;
}

const PinIcon = ({ filled }: { filled?: boolean }) => (
  <svg 
    width="12" 
    height="12" 
    viewBox="0 0 24 24" 
    fill={filled ? "currentColor" : "none"} 
    stroke="currentColor" 
    strokeWidth="2.5" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    className="transition-all duration-300"
  >
    <path d="M12 2v8" />
    <path d="m16.4 12c.5 0 .8.3.8.7v1.1c0 .3-.1.5-.3.6l-2.2 2.2c-.4.4-.5.5-.7.8v3.6c0 .5-.4.8-.8.8h-2.4c-.4 0-.8-.3-.8-.8v-3.6c-.2-.3-.3-.4-.7-.8l-2.2-2.2c-.2-.1-.3-.3-.3-.6v-1.1c0-.4.3-.7.8-.7h8.4z" />
  </svg>
);

const NotesTab: React.FC<NotesTabProps> = ({ notes, onAdd, onUpdate, onDelete, onTogglePin }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleStartAdd = () => {
    setTitle('');
    setContent('');
    setIsAdding(true);
  };

  const handleStartEdit = (note: Note) => {
    setTitle(note.title);
    setContent(note.content);
    setEditingId(note.id);
    setIsAdding(false);
  };

  const handleSave = () => {
    if (!title.trim() && !content.trim()) return;
    
    if (editingId) {
      onUpdate(editingId, { title, content });
      setEditingId(null);
    } else {
      onAdd({ title, content });
      setIsAdding(false);
    }
    setTitle('');
    setContent('');
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setTitle('');
    setContent('');
  };

  const handleDelete = () => {
    if (editingId) {
      onDelete(editingId);
      handleCancel();
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center px-1">
        <h2 className="text-xl font-bold text-white tracking-tight">Reflections</h2>
        {!isAdding && !editingId && (
          <button 
            onClick={handleStartAdd}
            className="w-9 h-9 bg-white text-black rounded-xl flex items-center justify-center text-base font-bold shadow-lg active:scale-95 transition-transform cursor-pointer"
          >
            ✎
          </button>
        )}
      </div>

      {(isAdding || editingId) && (
        <div className="bg-[#161616] p-4 rounded-2xl space-y-3 animate-in fade-in duration-300 border border-white/5">
          <input 
            autoFocus
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Reflection Title..."
            className="w-full bg-transparent text-white font-bold text-base outline-none placeholder:text-[#404040]"
          />
          <textarea 
            rows={4}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Document your journey..."
            className="w-full bg-transparent text-white text-[11px] outline-none resize-none placeholder:text-[#404040] leading-relaxed"
          />
          <div className="flex flex-col gap-1.5 pt-2 border-t border-[#262626]">
            <div className="flex gap-2">
              <button 
                onClick={handleSave}
                className="flex-1 bg-white text-black text-[8px] font-bold uppercase tracking-widest py-2.5 rounded-xl shadow-lg active:scale-95 transition-all cursor-pointer"
              >
                Save Registry
              </button>
              <button 
                onClick={handleCancel}
                className="px-5 bg-[#0a0a0a] text-[#737373] text-[8px] font-bold uppercase tracking-widest py-2.5 rounded-xl active:scale-95 transition-all cursor-pointer"
              >
                Discard
              </button>
            </div>
            {editingId && (
              <button 
                onClick={handleDelete}
                className="w-full py-2 text-[7px] font-bold uppercase tracking-[0.2em] text-red-500/60 hover:text-red-500 active:scale-95 transition-all"
              >
                Delete Reflection
              </button>
            )}
          </div>
        </div>
      )}

      <div className="space-y-2.5">
        {notes.length === 0 && !isAdding && !editingId && (
          <div className="py-16 text-center bg-[#161616] rounded-2xl border border-dashed border-[#262626]">
            <p className="text-[#525252] text-[9px] uppercase tracking-widest mb-3 italic">The soul becomes dyed with the color of its thoughts.</p>
            <button onClick={handleStartAdd} className="text-white text-[8px] px-5 py-2 rounded-xl font-bold uppercase tracking-widest border border-[#262626] hover:bg-white/5 transition-all cursor-pointer">
              Log Thought
            </button>
          </div>
        )}

        {notes.map(note => (
          <div 
            key={note.id}
            className={`p-3.5 rounded-xl group transition-all relative border border-transparent ${
              note.isPinned 
              ? 'bg-[#1c1c1c] border-white/10 shadow-[0_0_12px_rgba(255,255,255,0.02)]' 
              : 'bg-[#161616] hover:bg-[#1c1c1c]'
            }`}
          >
            <div className="flex justify-between items-start mb-0.5">
              <div className="flex items-center gap-1.5 pr-16">
                {note.isPinned && (
                  <span className="text-white opacity-80 animate-pulse">
                    <PinIcon filled />
                  </span>
                )}
                <h3 className={`text-[12px] font-bold truncate leading-tight transition-colors ${note.isPinned ? 'text-white' : 'text-[#e5e5e5]'}`}>
                  {note.title || 'Untitled Thought'}
                </h3>
              </div>
              <div className="flex gap-0.5 absolute top-2 right-2 z-20">
                <button 
                  onClick={(e) => { e.stopPropagation(); onTogglePin(note.id); if ('vibrate' in navigator) navigator.vibrate(4); }}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all active:scale-90 cursor-pointer ${note.isPinned ? 'text-white bg-white/10' : 'text-[#404040] hover:text-white hover:bg-white/5'}`}
                >
                  <PinIcon filled={note.isPinned} />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); handleStartEdit(note); }}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-[#404040] hover:text-white hover:bg-white/5 transition-all active:scale-90 cursor-pointer"
                >
                  <span className="text-[10px] font-bold">✎</span>
                </button>
              </div>
            </div>
            <p className="text-[10px] text-[#a3a3a3] line-clamp-3 leading-relaxed mb-3 whitespace-pre-wrap">
              {note.content}
            </p>
            <div className="flex items-center justify-between">
              <div className="text-[6.5px] font-bold text-[#404040] uppercase tracking-[0.15em]">
                {new Date(note.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </div>
              {note.isPinned && (
                <div className="text-[6px] font-bold text-white/20 uppercase tracking-[0.15em]">Prioritized</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotesTab;