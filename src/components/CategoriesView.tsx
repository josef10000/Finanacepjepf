import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { Category, TransactionType } from '../types';
import { Trash2 } from 'lucide-react';

export const CategoriesView: React.FC<{ profile: 'PJ' | 'PF' }> = ({ profile }) => {
  const { data, updateData } = useData();
  const state = data?.[profile];

  const [name, setName] = useState('');
  const [type, setType] = useState<TransactionType>('despesa');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data || !state) return;

    const newCategory: Category = {
      id: crypto.randomUUID(),
      name,
      type,
    };

    const newData = {
      ...data,
      [profile]: {
        ...state,
        categories: [...state.categories, newCategory]
      }
    };

    await updateData(newData);
    setName('');
  };

  const handleDelete = async (id: string) => {
    if (!data || !state) return;
    // Prevent deleting system transfer category
    if (id === 'sys-transfer-cat') return;
    
    const newData = {
      ...data,
      [profile]: {
        ...state,
        categories: state.categories.filter(c => c.id !== id)
      }
    };
    await updateData(newData);
  };

  if (!state) return null;

  const receitas = state.categories.filter(c => c.type === 'receita');
  const despesas = state.categories.filter(c => c.type === 'despesa');

  return (
    <div className="grid md:grid-cols-3 gap-8">
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 h-fit">
        <h3 className="text-lg font-bold text-white mb-4">Nova Categoria</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-slate-400 block mb-1">Nome da Categoria</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded p-2 text-white" required placeholder="Ex: Alimentação, Software" />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">Tipo</label>
            <select value={type} onChange={e => setType(e.target.value as TransactionType)} className="w-full bg-slate-700 border border-slate-600 rounded p-2 text-white">
              <option value="despesa">Despesa (Saída)</option>
              <option value="receita">Receita (Entrada)</option>
            </select>
          </div>
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors">
            Adicionar Categoria
          </button>
        </form>
      </div>

      <div className="md:col-span-2 grid sm:grid-cols-2 gap-6">
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
          <h3 className="text-lg font-bold text-green-400 mb-4 border-b border-slate-700 pb-2">Entradas (Receitas)</h3>
          <ul className="space-y-2">
            {receitas.map(cat => (
              <li key={cat.id} className="flex items-center justify-between p-2 hover:bg-slate-700/50 rounded group">
                <span className="text-slate-300">{cat.name}</span>
                {cat.id !== 'sys-transfer-cat' && (
                  <button onClick={() => handleDelete(cat.id)} className="text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 size={16} />
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
          <h3 className="text-lg font-bold text-red-400 mb-4 border-b border-slate-700 pb-2">Saídas (Despesas)</h3>
          <ul className="space-y-2">
            {despesas.map(cat => (
              <li key={cat.id} className="flex items-center justify-between p-2 hover:bg-slate-700/50 rounded group">
                <span className="text-slate-300">{cat.name}</span>
                {cat.id !== 'sys-transfer-cat' && (
                  <button onClick={() => handleDelete(cat.id)} className="text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 size={16} />
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
