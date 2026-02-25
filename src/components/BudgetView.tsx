import React, { useState, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { Budget } from '../types';
import { formatCurrency } from '../utils/format';
import { Archive, Plus, Trash2, AlertTriangle } from 'lucide-react';

export const BudgetView: React.FC<{ profile: 'PJ' | 'PF' }> = ({ profile }) => {
  const { data, updateData } = useData();
  const state = data?.[profile];

  const [showForm, setShowForm] = useState(false);
  const [categoryId, setCategoryId] = useState('');
  const [amount, setAmount] = useState('');
  const [period, setPeriod] = useState<'monthly' | 'yearly'>('monthly');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data || !state) return;

    // Check if budget already exists for this category
    const existingIndex = state.budgets?.findIndex(b => b.categoryId === categoryId);
    
    let newBudgets = [...(state.budgets || [])];
    
    if (existingIndex !== undefined && existingIndex >= 0) {
      newBudgets[existingIndex] = {
        ...newBudgets[existingIndex],
        amount: parseFloat(amount) || 0,
        period
      };
    } else {
      newBudgets.push({
        id: crypto.randomUUID(),
        categoryId,
        amount: parseFloat(amount) || 0,
        period
      });
    }

    const newData = {
      ...data,
      [profile]: {
        ...state,
        budgets: newBudgets
      }
    };

    await updateData(newData);
    setCategoryId('');
    setAmount('');
    setShowForm(false);
  };

  const handleDelete = async (id: string) => {
    if (!data || !state) return;
    const newData = {
      ...data,
      [profile]: {
        ...state,
        budgets: state.budgets.filter(b => b.id !== id)
      }
    };
    await updateData(newData);
  };

  const budgetStats = useMemo(() => {
    if (!state) return [];
    
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const spentByCategory: Record<string, number> = {};
    
    state.transactions.forEach(tx => {
      if (tx.type === 'despesa') {
        const txDate = new Date(tx.date);
        if (txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear) {
          spentByCategory[tx.categoryId] = (spentByCategory[tx.categoryId] || 0) + tx.amount;
        }
      }
    });

    return (state.budgets || []).map(budget => {
      const cat = state.categories.find(c => c.id === budget.categoryId);
      const spent = spentByCategory[budget.categoryId] || 0;
      const percent = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
      
      return {
        ...budget,
        categoryName: cat?.name || 'Categoria Removida',
        spent,
        percent
      };
    }).sort((a, b) => b.percent - a.percent);
  }, [state]);

  if (!state) return null;

  const expenseCategories = state.categories.filter(c => c.type === 'despesa');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-white">Orçamento Mensal</h3>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors"
        >
          <Plus size={20} />
          Definir Limite
        </button>
      </div>

      {showForm && (
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 mb-6">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Categoria</label>
              <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded p-2 text-white" required>
                <option value="">Selecione uma categoria...</option>
                {expenseCategories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Limite (R$)</label>
              <input type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded p-2 text-white" required placeholder="0.00" />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Período</label>
              <select value={period} onChange={e => setPeriod(e.target.value as 'monthly' | 'yearly')} className="w-full bg-slate-700 border border-slate-600 rounded p-2 text-white">
                <option value="monthly">Mensal</option>
                <option value="yearly">Anual</option>
              </select>
            </div>
            <div className="md:col-span-3 flex justify-end gap-2 mt-2">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded text-slate-300 hover:bg-slate-700 transition-colors">Cancelar</button>
              <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded font-bold transition-colors">Salvar Orçamento</button>
            </div>
          </form>
        </div>
      )}

      {budgetStats.length === 0 ? (
        <div className="bg-slate-800 p-8 rounded-xl border border-slate-700 text-center text-slate-400">
          <Archive size={48} className="mx-auto mb-4 opacity-50" />
          <p>Nenhum orçamento definido.</p>
          <p className="text-sm mt-2">Defina limites de gastos para suas categorias para acompanhar seu progresso.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {budgetStats.map(budget => {
            let statusColor = 'bg-blue-500';
            if (budget.percent > 100) statusColor = 'bg-red-500';
            else if (budget.percent > 80) statusColor = 'bg-amber-500';
            else if (budget.percent > 50) statusColor = 'bg-emerald-500';

            return (
              <div key={budget.id} className="bg-slate-800 p-6 rounded-xl border border-slate-700 relative group">
                <div className="flex justify-between items-start mb-4">
                  <h4 className="text-lg font-bold text-white">{budget.categoryName}</h4>
                  <button onClick={() => handleDelete(budget.id)} className="text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 size={18} />
                  </button>
                </div>
                
                <div className="flex justify-between items-end mb-2">
                  <div>
                    <p className="text-xs text-slate-400">Gasto Atual</p>
                    <p className={`text-2xl font-bold ${budget.percent > 100 ? 'text-red-400' : 'text-white'}`}>
                      {formatCurrency(budget.spent)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-400">Limite {budget.period === 'monthly' ? 'Mensal' : 'Anual'}</p>
                    <p className="text-sm font-medium text-slate-300">{formatCurrency(budget.amount)}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Progresso</span>
                    <span className={budget.percent > 100 ? 'text-red-400 font-bold' : ''}>
                      {budget.percent.toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div className={`h-full ${statusColor} transition-all duration-500`} style={{ width: `${Math.min(100, budget.percent)}%` }}></div>
                  </div>
                </div>

                {budget.percent > 100 && (
                  <div className="mt-4 p-2 bg-red-500/10 border border-red-500/20 rounded flex items-center gap-2 text-red-400 text-xs">
                    <AlertTriangle size={14} />
                    <span>Orçamento estourado em {formatCurrency(budget.spent - budget.amount)}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
