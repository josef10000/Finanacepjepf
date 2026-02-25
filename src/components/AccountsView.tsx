import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { Account, AccountType } from '../types';
import { formatCurrency } from '../utils/format';
import { Wallet, Trash2, CreditCard, PiggyBank, Briefcase } from 'lucide-react';

export const AccountsView: React.FC<{ profile: 'PJ' | 'PF' }> = ({ profile }) => {
  const { data, updateData } = useData();
  const state = data?.[profile];

  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>('operational');
  const [initialBalance, setInitialBalance] = useState('');
  const [limit, setLimit] = useState('');
  const [closingDay, setClosingDay] = useState('');
  const [dueDay, setDueDay] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data || !state) return;

    const newAccount: Account = {
      id: crypto.randomUUID(),
      name,
      type,
      initialBalance: parseFloat(initialBalance) || 0,
      limit: type === 'credit_card' ? parseFloat(limit) || 0 : undefined,
      closingDay: type === 'credit_card' ? parseInt(closingDay) || undefined : undefined,
      dueDay: type === 'credit_card' ? parseInt(dueDay) || undefined : undefined,
    };

    const newData = {
      ...data,
      [profile]: {
        ...state,
        accounts: [...state.accounts, newAccount]
      }
    };

    await updateData(newData);
    setName('');
    setInitialBalance('');
    setLimit('');
    setClosingDay('');
    setDueDay('');
  };

  const handleDelete = async (id: string) => {
    if (!data || !state) return;
    const newData = {
      ...data,
      [profile]: {
        ...state,
        accounts: state.accounts.filter(a => a.id !== id)
      }
    };
    await updateData(newData);
  };

  if (!state) return null;

  const getIcon = (t: AccountType) => {
    switch(t) {
      case 'operational': return <Briefcase size={20} className="text-blue-400" />;
      case 'goal_pot': return <PiggyBank size={20} className="text-emerald-400" />;
      case 'wallet': return <Wallet size={20} className="text-purple-400" />;
      case 'credit_card': return <CreditCard size={20} className="text-amber-400" />;
    }
  };

  return (
    <div className="grid md:grid-cols-3 gap-8">
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 h-fit">
        <h3 className="text-lg font-bold text-white mb-4">Nova Conta</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-slate-400 block mb-1">Nome da Conta</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded p-2 text-white" required placeholder="Ex: Nubank, Itaú" />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">Tipo</label>
            <select value={type} onChange={e => setType(e.target.value as AccountType)} className="w-full bg-slate-700 border border-slate-600 rounded p-2 text-white">
              <option value="operational">Conta Corrente</option>
              <option value="goal_pot">Pote / Investimento</option>
              <option value="wallet">Wallet / Plataforma</option>
              <option value="credit_card">Cartão de Crédito</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">Saldo Inicial (R$)</label>
            <input type="number" step="0.01" value={initialBalance} onChange={e => setInitialBalance(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded p-2 text-white" required placeholder="0.00" />
          </div>
          {type === 'credit_card' && (
            <>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Limite do Cartão (R$)</label>
                <input type="number" step="0.01" value={limit} onChange={e => setLimit(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded p-2 text-white" required placeholder="0.00" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Dia de Fechamento</label>
                  <input type="number" min="1" max="31" value={closingDay} onChange={e => setClosingDay(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded p-2 text-white" required placeholder="Ex: 25" />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Dia de Vencimento</label>
                  <input type="number" min="1" max="31" value={dueDay} onChange={e => setDueDay(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded p-2 text-white" required placeholder="Ex: 5" />
                </div>
              </div>
            </>
          )}
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors">
            Salvar Conta
          </button>
        </form>
      </div>

      <div className="md:col-span-2 space-y-4">
        <h3 className="text-lg font-bold text-white mb-4">Suas Contas</h3>
        {state.accounts.length === 0 ? (
          <div className="bg-slate-800 p-8 rounded-xl border border-slate-700 text-center text-slate-400">
            Nenhuma conta cadastrada ainda.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {state.accounts.map(acc => (
              <div key={acc.id} className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-700 rounded-lg">
                    {getIcon(acc.type)}
                  </div>
                  <div>
                    <h4 className="text-white font-bold">{acc.name}</h4>
                    <p className="text-sm text-slate-400">
                      {acc.type === 'credit_card' ? `Limite: ${formatCurrency(acc.limit || 0)}` : formatCurrency(acc.initialBalance)}
                    </p>
                    {acc.type === 'credit_card' && acc.dueDay && (
                      <p className="text-xs text-slate-500">Vence dia {acc.dueDay} • Fecha dia {acc.closingDay}</p>
                    )}
                  </div>
                </div>
                <button onClick={() => handleDelete(acc.id)} className="text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-2">
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
