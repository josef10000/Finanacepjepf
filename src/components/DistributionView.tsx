import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { DistributionRule } from '../types';
import { formatCurrency } from '../utils/format';
import { Share2, Plus, Trash2, ArrowRight } from 'lucide-react';

export const DistributionView: React.FC<{ profile: 'PJ' | 'PF' }> = ({ profile }) => {
  const { data, updateData } = useData();
  const state = data?.[profile];

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [percentage, setPercentage] = useState('');
  const [destinationAccountId, setDestinationAccountId] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data || !state) return;

    const newRule: DistributionRule = {
      id: crypto.randomUUID(),
      name,
      percentage: parseFloat(percentage) || 0,
      destinationAccountId
    };

    const newData = {
      ...data,
      [profile]: {
        ...state,
        rules: [...(state.rules || []), newRule]
      }
    };

    await updateData(newData);
    setName('');
    setPercentage('');
    setDestinationAccountId('');
    setShowForm(false);
  };

  const handleDelete = async (id: string) => {
    if (!data || !state) return;
    const newData = {
      ...data,
      [profile]: {
        ...state,
        rules: state.rules.filter(r => r.id !== id)
      }
    };
    await updateData(newData);
  };

  if (!state) return null;

  const rules = state.rules || [];
  const totalPercentage = rules.reduce((acc, rule) => acc + rule.percentage, 0);

  // Calculate current month's revenue to simulate distribution
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  let currentRevenue = 0;
  state.transactions.forEach(tx => {
    const txDate = new Date(tx.date);
    if (tx.type === 'receita' && txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear) {
      currentRevenue += tx.amount;
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <Share2 className="text-blue-500" />
          Regras de Distribuição
        </h3>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors"
          disabled={totalPercentage >= 100}
        >
          <Plus size={20} />
          Nova Regra
        </button>
      </div>

      {showForm && (
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 mb-6">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Nome da Regra</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded p-2 text-white" required placeholder="Ex: Pró-labore, Impostos" />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Porcentagem (%)</label>
              <input type="number" step="0.1" min="0.1" max={100 - totalPercentage} value={percentage} onChange={e => setPercentage(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded p-2 text-white" required placeholder="Ex: 15" />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Conta Destino</label>
              <select value={destinationAccountId} onChange={e => setDestinationAccountId(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded p-2 text-white" required>
                <option value="">Selecione uma conta...</option>
                {state.accounts.map(acc => (
                  <option key={acc.id} value={acc.id}>{acc.name}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-3 flex justify-end gap-2 mt-2">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded text-slate-300 hover:bg-slate-700 transition-colors">Cancelar</button>
              <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded font-bold transition-colors">Salvar Regra</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-slate-800 rounded-xl shadow-lg border border-slate-700 overflow-hidden">
          <div className="p-6 border-b border-slate-700 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-white">Regras Ativas</h3>
            <span className={`text-sm font-bold px-3 py-1 rounded-full ${totalPercentage === 100 ? 'bg-green-500/20 text-green-400' : totalPercentage > 100 ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}`}>
              {totalPercentage.toFixed(1)}% Distribuído
            </span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-400">
              <thead className="bg-slate-700/50 text-xs uppercase font-medium text-slate-300">
                <tr>
                  <th className="px-6 py-4">Regra</th>
                  <th className="px-6 py-4">Destino</th>
                  <th className="px-6 py-4 text-right">%</th>
                  <th className="px-6 py-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {rules.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                      Nenhuma regra de distribuição cadastrada.
                    </td>
                  </tr>
                ) : (
                  rules.map(rule => {
                    const acc = state.accounts.find(a => a.id === rule.destinationAccountId);
                    return (
                      <tr key={rule.id} className="hover:bg-slate-700/30 transition-colors group">
                        <td className="px-6 py-4 font-medium text-slate-300">{rule.name}</td>
                        <td className="px-6 py-4 flex items-center gap-2">
                          <ArrowRight size={14} className="text-slate-500" />
                          {acc?.name || 'Conta Removida'}
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-white">
                          {rule.percentage.toFixed(1)}%
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button onClick={() => handleDelete(rule.id)} className="text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl shadow-lg border border-slate-700 p-6 h-fit">
          <h3 className="text-lg font-semibold text-white mb-4">Simulação (Mês Atual)</h3>
          <p className="text-sm text-slate-400 mb-2">Receita Base</p>
          <p className="text-2xl font-bold text-green-400 mb-6">{formatCurrency(currentRevenue)}</p>

          <div className="space-y-4">
            {rules.map(rule => {
              const amount = currentRevenue * (rule.percentage / 100);
              return (
                <div key={`sim-${rule.id}`} className="flex justify-between items-center text-sm">
                  <span className="text-slate-300">{rule.name}</span>
                  <span className="text-white font-medium">{formatCurrency(amount)}</span>
                </div>
              );
            })}
            
            <div className="pt-4 border-t border-slate-700 flex justify-between items-center text-sm font-bold">
              <span className="text-slate-400">Restante ({(100 - totalPercentage).toFixed(1)}%)</span>
              <span className="text-slate-300">{formatCurrency(currentRevenue * ((100 - totalPercentage) / 100))}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
