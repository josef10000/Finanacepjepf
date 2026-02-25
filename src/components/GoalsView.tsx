import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { Goal } from '../types';
import { formatCurrency } from '../utils/format';
import { Flag, Plus, Target, Trash2 } from 'lucide-react';

export const GoalsView: React.FC<{ profile: 'PJ' | 'PF' }> = ({ profile }) => {
  const { data, updateData } = useData();
  const state = data?.[profile];

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [deadline, setDeadline] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data || !state) return;

    const newGoal: Goal = {
      id: crypto.randomUUID(),
      name,
      targetAmount: parseFloat(targetAmount) || 0,
      currentAmount: parseFloat(currentAmount) || 0,
      deadline: deadline || undefined,
    };

    const newData = {
      ...data,
      [profile]: {
        ...state,
        goals: [...(state.goals || []), newGoal]
      }
    };

    await updateData(newData);
    setName('');
    setTargetAmount('');
    setCurrentAmount('');
    setDeadline('');
    setShowForm(false);
  };

  const handleDelete = async (id: string) => {
    if (!data || !state) return;
    const newData = {
      ...data,
      [profile]: {
        ...state,
        goals: state.goals.filter(g => g.id !== id)
      }
    };
    await updateData(newData);
  };

  if (!state) return null;

  const goals = state.goals || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-white">
          {profile === 'PJ' ? 'Potes Financeiros' : 'Sonhos e Metas'}
        </h3>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors"
        >
          <Plus size={20} />
          Nova Meta
        </button>
      </div>

      {showForm && (
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 mb-6">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Nome da Meta</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded p-2 text-white" required placeholder="Ex: Viagem, Reserva" />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Valor Alvo (R$)</label>
              <input type="number" step="0.01" value={targetAmount} onChange={e => setTargetAmount(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded p-2 text-white" required placeholder="0.00" />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Valor Atual (R$)</label>
              <input type="number" step="0.01" value={currentAmount} onChange={e => setCurrentAmount(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded p-2 text-white" required placeholder="0.00" />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Prazo (Opcional)</label>
              <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded p-2 text-white" />
            </div>
            <div className="lg:col-span-4 flex justify-end gap-2 mt-2">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded text-slate-300 hover:bg-slate-700 transition-colors">Cancelar</button>
              <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded font-bold transition-colors">Salvar Meta</button>
            </div>
          </form>
        </div>
      )}

      {goals.length === 0 ? (
        <div className="bg-slate-800 p-8 rounded-xl border border-slate-700 text-center text-slate-400">
          <Flag size={48} className="mx-auto mb-4 opacity-50" />
          <p>Nenhuma meta cadastrada.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map(goal => {
            const percent = goal.targetAmount > 0 ? Math.min(100, (goal.currentAmount / goal.targetAmount) * 100) : 0;
            return (
              <div key={goal.id} className="bg-slate-800 p-6 rounded-xl border border-slate-700 relative group overflow-hidden">
                <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Target size={64} className="text-purple-400" />
                </div>
                
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="text-lg font-bold text-white">{goal.name}</h4>
                    <button onClick={() => handleDelete(goal.id)} className="text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 size={18} />
                    </button>
                  </div>
                  
                  <div className="text-3xl font-bold text-white mb-2">
                    {formatCurrency(goal.currentAmount)}
                  </div>
                  <p className="text-sm text-slate-400 mb-6">de {formatCurrency(goal.targetAmount)}</p>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>Progresso</span>
                      <span>{percent.toFixed(1)}%</span>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-500 transition-all duration-500" style={{ width: `${percent}%` }}></div>
                    </div>
                  </div>
                  
                  {goal.deadline && (
                    <div className="mt-4 text-xs text-slate-500">
                      Prazo: {new Date(goal.deadline).toLocaleDateString('pt-BR')}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
