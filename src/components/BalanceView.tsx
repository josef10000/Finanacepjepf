import React, { useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { formatCurrency } from '../utils/format';
import { Book, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

export const BalanceView: React.FC<{ profile: 'PJ' | 'PF' }> = ({ profile }) => {
  const { data } = useData();
  const state = data?.[profile];

  const {
    totalAssets,
    totalLiabilities,
    netWorth,
    accounts,
    goals
  } = useMemo(() => {
    if (!state) return { totalAssets: 0, totalLiabilities: 0, netWorth: 0, accounts: [], goals: [] };

    let assets = 0;
    let liabilities = 0;

    // Calculate current balance for each account
    const accountBalances: Record<string, number> = {};
    state.accounts.forEach(acc => {
      accountBalances[acc.id] = acc.initialBalance || 0;
    });

    state.transactions.forEach(tx => {
      if (accountBalances[tx.accountId] !== undefined) {
        if (tx.type === 'receita') accountBalances[tx.accountId] += tx.amount;
        if (tx.type === 'despesa') accountBalances[tx.accountId] -= tx.amount;
      }
    });

    // Categorize accounts into assets and liabilities
    const processedAccounts = state.accounts.map(acc => {
      const balance = accountBalances[acc.id];
      const isLiability = acc.type === 'credit_card' || balance < 0;
      
      if (isLiability) {
        liabilities += Math.abs(balance);
      } else {
        assets += balance;
      }

      return {
        ...acc,
        balance,
        isLiability
      };
    });

    // Add goals/pots to assets
    const processedGoals = state.goals?.map(goal => {
      assets += goal.currentAmount;
      return goal;
    }) || [];

    return {
      totalAssets: assets,
      totalLiabilities: liabilities,
      netWorth: assets - liabilities,
      accounts: processedAccounts,
      goals: processedGoals
    };
  }, [state]);

  if (!state) return null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-white">
          {profile === 'PJ' ? 'Balanço Patrimonial' : 'Patrimônio Líquido'}
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700 relative overflow-hidden group">
          <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <TrendingUp size={48} className="text-green-500" />
          </div>
          <h3 className="text-sm font-medium text-green-400 uppercase tracking-wider">Ativos (Bens e Direitos)</h3>
          <p className="text-3xl font-bold text-white mt-2">{formatCurrency(totalAssets)}</p>
        </div>
        
        <div className="bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700 relative group">
          <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <TrendingDown size={48} className="text-red-500" />
          </div>
          <h3 className="text-sm font-medium text-red-400 uppercase tracking-wider">Passivos (Obrigações)</h3>
          <p className="text-3xl font-bold text-white mt-2">{formatCurrency(totalLiabilities)}</p>
        </div>
        
        <div className="bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700 relative group">
          <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <DollarSign size={48} className="text-blue-500" />
          </div>
          <h3 className="text-sm font-medium text-blue-400 uppercase tracking-wider">Patrimônio Líquido</h3>
          <p className={`text-3xl font-bold mt-2 ${netWorth >= 0 ? 'text-white' : 'text-red-400'}`}>
            {formatCurrency(netWorth)}
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
          <div className="p-6 border-b border-slate-700">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <TrendingUp className="text-green-400" size={20} />
              Detalhamento de Ativos
            </h3>
          </div>
          <div className="p-6 space-y-4">
            {accounts.filter(a => !a.isLiability).map(acc => (
              <div key={acc.id} className="flex justify-between items-center p-3 bg-slate-700/30 rounded-lg">
                <span className="text-slate-300">{acc.name}</span>
                <span className="text-white font-medium">{formatCurrency(acc.balance)}</span>
              </div>
            ))}
            {goals.map(goal => (
              <div key={goal.id} className="flex justify-between items-center p-3 bg-slate-700/30 rounded-lg">
                <span className="text-slate-300">{goal.name} (Meta/Pote)</span>
                <span className="text-white font-medium">{formatCurrency(goal.currentAmount)}</span>
              </div>
            ))}
            {accounts.filter(a => !a.isLiability).length === 0 && goals.length === 0 && (
              <p className="text-slate-500 text-center py-4">Nenhum ativo registrado.</p>
            )}
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
          <div className="p-6 border-b border-slate-700">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <TrendingDown className="text-red-400" size={20} />
              Detalhamento de Passivos
            </h3>
          </div>
          <div className="p-6 space-y-4">
            {accounts.filter(a => a.isLiability).map(acc => (
              <div key={acc.id} className="flex justify-between items-center p-3 bg-slate-700/30 rounded-lg">
                <span className="text-slate-300">{acc.name}</span>
                <span className="text-red-400 font-medium">{formatCurrency(Math.abs(acc.balance))}</span>
              </div>
            ))}
            {accounts.filter(a => a.isLiability).length === 0 && (
              <p className="text-slate-500 text-center py-4">Nenhum passivo registrado.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
