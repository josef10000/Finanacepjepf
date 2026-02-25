import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { StackItem } from '../types';
import { formatCurrency } from '../utils/format';
import { Layers, Plus, Trash2, DollarSign } from 'lucide-react';

export const StackView: React.FC<{ profile: 'PJ' | 'PF' }> = ({ profile }) => {
  const { data, updateData } = useData();
  const state = data?.[profile];

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [cost, setCost] = useState('');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [category, setCategory] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data || !state) return;

    const newItem: StackItem = {
      id: crypto.randomUUID(),
      name,
      cost: parseFloat(cost) || 0,
      billingCycle,
      category: category || 'Geral'
    };

    const newData = {
      ...data,
      [profile]: {
        ...state,
        stack: [...(state.stack || []), newItem]
      }
    };

    await updateData(newData);
    setName('');
    setCost('');
    setCategory('');
    setShowForm(false);
  };

  const handleDelete = async (id: string) => {
    if (!data || !state) return;
    const newData = {
      ...data,
      [profile]: {
        ...state,
        stack: state.stack.filter(s => s.id !== id)
      }
    };
    await updateData(newData);
  };

  if (!state) return null;

  const stack = state.stack || [];
  const totalMonthly = stack.reduce((acc, item) => acc + (item.billingCycle === 'monthly' ? item.cost : item.cost / 12), 0);
  const totalYearly = stack.reduce((acc, item) => acc + (item.billingCycle === 'yearly' ? item.cost : item.cost * 12), 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-white">
          {profile === 'PJ' ? 'Stack de Ferramentas' : 'Assinaturas'}
        </h3>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors"
        >
          <Plus size={20} />
          Adicionar Item
        </button>
      </div>

      {showForm && (
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 mb-6">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Nome da Ferramenta/Serviço</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded p-2 text-white" required placeholder="Ex: Notion, Netflix" />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Custo (R$)</label>
              <input type="number" step="0.01" value={cost} onChange={e => setCost(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded p-2 text-white" required placeholder="0.00" />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Ciclo de Cobrança</label>
              <select value={billingCycle} onChange={e => setBillingCycle(e.target.value as 'monthly' | 'yearly')} className="w-full bg-slate-700 border border-slate-600 rounded p-2 text-white">
                <option value="monthly">Mensal</option>
                <option value="yearly">Anual</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Categoria (Opcional)</label>
              <input type="text" value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded p-2 text-white" placeholder="Ex: Marketing, Lazer" />
            </div>
            <div className="lg:col-span-4 flex justify-end gap-2 mt-2">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded text-slate-300 hover:bg-slate-700 transition-colors">Cancelar</button>
              <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded font-bold transition-colors">Salvar Item</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700 relative overflow-hidden">
          <div className="absolute right-0 top-0 p-4 opacity-10">
            <DollarSign size={48} className="text-blue-500" />
          </div>
          <h3 className="text-sm font-medium text-blue-400 uppercase tracking-wider">Custo Mensal Estimado</h3>
          <p className="text-3xl font-bold text-white mt-2">{formatCurrency(totalMonthly)}</p>
        </div>
        <div className="bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700 relative overflow-hidden">
          <div className="absolute right-0 top-0 p-4 opacity-10">
            <Layers size={48} className="text-purple-500" />
          </div>
          <h3 className="text-sm font-medium text-purple-400 uppercase tracking-wider">Custo Anual Estimado</h3>
          <p className="text-3xl font-bold text-white mt-2">{formatCurrency(totalYearly)}</p>
        </div>
      </div>

      <div className="bg-slate-800 rounded-xl shadow-lg border border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-400">
            <thead className="bg-slate-700/50 text-xs uppercase font-medium text-slate-300">
              <tr>
                <th className="px-6 py-4">Nome</th>
                <th className="px-6 py-4">Categoria</th>
                <th className="px-6 py-4">Ciclo</th>
                <th className="px-6 py-4 text-right">Custo</th>
                <th className="px-6 py-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {stack.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    Nenhum item cadastrado.
                  </td>
                </tr>
              ) : (
                stack.map(item => (
                  <tr key={item.id} className="hover:bg-slate-700/30 transition-colors group">
                    <td className="px-6 py-4 font-medium text-slate-300 flex items-center gap-2">
                      <Layers size={16} className="text-blue-500" />
                      {item.name}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-slate-700 rounded text-xs">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {item.billingCycle === 'monthly' ? 'Mensal' : 'Anual'}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-white">
                      {formatCurrency(item.cost)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button onClick={() => handleDelete(item.id)} className="text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
