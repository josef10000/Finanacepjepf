import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { Transaction, TransactionType } from '../types';
import { formatCurrency, formatDate } from '../utils/format';
import { Trash2, Plus } from 'lucide-react';

export const TransactionsView: React.FC<{ profile: 'PJ' | 'PF' }> = ({ profile }) => {
  const { data, updateData } = useData();
  const state = data?.[profile];

  const [showForm, setShowForm] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>('despesa');
  const [accountId, setAccountId] = useState('');
  const [categoryId, setCategoryId] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data || !state) return;

    const newTx: Transaction = {
      id: crypto.randomUUID(),
      date,
      description,
      amount: parseFloat(amount) || 0,
      type,
      accountId,
      categoryId
    };

    const newData = {
      ...data,
      [profile]: {
        ...state,
        transactions: [...state.transactions, newTx]
      }
    };

    await updateData(newData);
    setDescription('');
    setAmount('');
    setShowForm(false);
  };

  const handleDelete = async (id: string) => {
    if (!data || !state) return;
    const newData = {
      ...data,
      [profile]: {
        ...state,
        transactions: state.transactions.filter(t => t.id !== id)
      }
    };
    await updateData(newData);
  };

  if (!state) return null;

  const sortedTx = [...state.transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const filteredCategories = state.categories.filter(c => c.type === type || c.type === 'transfer');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-white">Histórico de Lançamentos</h3>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors"
        >
          <Plus size={20} />
          Novo Lançamento
        </button>
      </div>

      {showForm && (
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 mb-6">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Data</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded p-2 text-white" required />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Descrição</label>
              <input type="text" value={description} onChange={e => setDescription(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded p-2 text-white" required placeholder="Ex: Conta de Luz" />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Valor (R$)</label>
              <input type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded p-2 text-white" required placeholder="0.00" />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Tipo</label>
              <select value={type} onChange={e => setType(e.target.value as TransactionType)} className="w-full bg-slate-700 border border-slate-600 rounded p-2 text-white">
                <option value="despesa">Despesa (Saída)</option>
                <option value="receita">Receita (Entrada)</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Conta</label>
              <select value={accountId} onChange={e => setAccountId(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded p-2 text-white" required>
                <option value="">Selecione uma conta...</option>
                {state.accounts.map(acc => (
                  <option key={acc.id} value={acc.id}>{acc.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Categoria</label>
              <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded p-2 text-white" required>
                <option value="">Selecione uma categoria...</option>
                {filteredCategories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div className="lg:col-span-3 flex justify-end gap-2 mt-2">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded text-slate-300 hover:bg-slate-700 transition-colors">Cancelar</button>
              <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded font-bold transition-colors">Salvar Lançamento</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-slate-800 rounded-xl shadow-lg border border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-400">
            <thead className="bg-slate-700/50 text-xs uppercase font-medium text-slate-300">
              <tr>
                <th className="px-6 py-4">Data</th>
                <th className="px-6 py-4">Descrição</th>
                <th className="px-6 py-4">Categoria</th>
                <th className="px-6 py-4">Conta</th>
                <th className="px-6 py-4 text-right">Valor</th>
                <th className="px-6 py-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {sortedTx.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    Nenhum lançamento encontrado.
                  </td>
                </tr>
              ) : (
                sortedTx.map(tx => {
                  const cat = state.categories.find(c => c.id === tx.categoryId);
                  const acc = state.accounts.find(a => a.id === tx.accountId);
                  return (
                    <tr key={tx.id} className="hover:bg-slate-700/30 transition-colors group">
                      <td className="px-6 py-4">{formatDate(tx.date)}</td>
                      <td className="px-6 py-4 font-medium text-slate-300">{tx.description}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-slate-700 rounded text-xs">{cat?.name || 'Sem Categoria'}</span>
                      </td>
                      <td className="px-6 py-4">{acc?.name || 'Sem Conta'}</td>
                      <td className={`px-6 py-4 text-right font-bold ${
                        tx.type === 'receita' ? 'text-green-400' : 
                        tx.type === 'despesa' ? 'text-red-400' : 'text-slate-400'
                      }`}>
                        {tx.type === 'despesa' ? '-' : tx.type === 'receita' ? '+' : ''}
                        {formatCurrency(tx.amount)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button onClick={() => handleDelete(tx.id)} className="text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
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
    </div>
  );
};
