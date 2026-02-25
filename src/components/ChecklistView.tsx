import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { ChecklistItem } from '../types';
import { CheckSquare, Plus, Trash2, Calendar as CalendarIcon } from 'lucide-react';

export const ChecklistView: React.FC<{ profile: 'PJ' | 'PF' }> = ({ profile }) => {
  const { data, updateData } = useData();
  const state = data?.[profile];

  const now = new Date();
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  
  const [selectedMonth, setSelectedMonth] = useState(currentMonthStr);
  const [newItemText, setNewItemText] = useState('');

  if (!state) return null;

  const checklist = state.checklist || [];
  const currentItems = checklist.filter(item => item.month === selectedMonth);
  const completedCount = currentItems.filter(i => i.completed).length;
  const progress = currentItems.length > 0 ? (completedCount / currentItems.length) * 100 : 0;

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemText.trim()) return;

    const newItem: ChecklistItem = {
      id: crypto.randomUUID(),
      text: newItemText.trim(),
      completed: false,
      month: selectedMonth
    };

    const newData = {
      ...data,
      [profile]: {
        ...state,
        checklist: [...checklist, newItem]
      }
    };

    await updateData(newData);
    setNewItemText('');
  };

  const toggleItem = async (id: string) => {
    const newData = {
      ...data,
      [profile]: {
        ...state,
        checklist: checklist.map(item => 
          item.id === id ? { ...item, completed: !item.completed } : item
        )
      }
    };
    await updateData(newData);
  };

  const deleteItem = async (id: string) => {
    const newData = {
      ...data,
      [profile]: {
        ...state,
        checklist: checklist.filter(item => item.id !== id)
      }
    };
    await updateData(newData);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <CheckSquare className="text-blue-500" />
          Checklist Mensal
        </h3>
        
        <div className="flex items-center gap-2 bg-slate-800 p-2 rounded-lg border border-slate-700">
          <CalendarIcon size={18} className="text-slate-400" />
          <input 
            type="month" 
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-transparent text-white border-none focus:ring-0 text-sm"
          />
        </div>
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-slate-400">Progresso do Mês</span>
            <span className="text-white font-bold">{completedCount} de {currentItems.length} ({progress.toFixed(0)}%)</span>
          </div>
          <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500 transition-all duration-500" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        <form onSubmit={handleAddItem} className="flex gap-2 mb-6">
          <input
            type="text"
            value={newItemText}
            onChange={(e) => setNewItemText(e.target.value)}
            placeholder="Adicionar nova tarefa..."
            className="flex-1 bg-slate-700 border border-slate-600 rounded-lg p-3 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
          <button 
            type="submit"
            disabled={!newItemText.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 rounded-lg transition-colors flex items-center justify-center"
          >
            <Plus size={24} />
          </button>
        </form>

        <div className="space-y-2">
          {currentItems.length === 0 ? (
            <p className="text-center text-slate-500 py-8">Nenhuma tarefa para este mês.</p>
          ) : (
            currentItems.map(item => (
              <div 
                key={item.id} 
                className={`flex items-center justify-between p-4 rounded-lg border transition-all group ${
                  item.completed 
                    ? 'bg-slate-800/50 border-slate-700/50 opacity-60' 
                    : 'bg-slate-700/30 border-slate-600 hover:border-slate-500'
                }`}
              >
                <div className="flex items-center gap-4 flex-1 cursor-pointer" onClick={() => toggleItem(item.id)}>
                  <div className={`w-6 h-6 rounded border flex items-center justify-center transition-colors ${
                    item.completed ? 'bg-blue-500 border-blue-500 text-white' : 'border-slate-500 text-transparent'
                  }`}>
                    <CheckSquare size={16} />
                  </div>
                  <span className={`text-base transition-all ${item.completed ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                    {item.text}
                  </span>
                </div>
                <button 
                  onClick={() => deleteItem(item.id)}
                  className="text-slate-500 hover:text-red-400 p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
