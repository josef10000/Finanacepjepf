import React, { useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { formatCurrency, formatDate } from '../utils/format';
import { Activity, ShieldCheck, Lock, TrendingUp, TrendingDown, Wallet } from 'lucide-react';

interface DashboardViewProps {
  profile: 'PJ' | 'PF';
}

export const DashboardView: React.FC<DashboardViewProps> = ({ profile }) => {
  const { data } = useData();
  const state = data ? data[profile] : null;

  const {
    saldoConsolidado,
    receitas,
    despesas,
    recentTransactions
  } = useMemo(() => {
    if (!state) return { saldoConsolidado: 0, receitas: 0, despesas: 0, recentTransactions: [] };

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    let saldo = 0;
    state.accounts.forEach(acc => {
      saldo += acc.initialBalance || 0;
    });

    let rec = 0;
    let desp = 0;

    const sortedTx = [...state.transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    sortedTx.forEach(tx => {
      const txDate = new Date(tx.date);
      // Saldo calculation
      if (tx.type === 'receita') saldo += tx.amount;
      if (tx.type === 'despesa') saldo -= tx.amount;

      // Current month calculation
      if (txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear) {
        if (tx.type === 'receita') rec += tx.amount;
        if (tx.type === 'despesa') desp += tx.amount;
      }
    });

    return {
      saldoConsolidado: saldo,
      receitas: rec,
      despesas: desp,
      recentTransactions: sortedTx.slice(0, 5)
    };
  }, [state]);

  if (!state) return <div className="text-slate-400 p-8 text-center">Carregando dados...</div>;

  return (
    <div className="space-y-8">
      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700 relative overflow-hidden group hover:shadow-[0_0_15px_rgba(59,130,246,0.15)] transition-all">
          <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Wallet size={48} className="text-blue-500" />
          </div>
          <h3 className="text-sm font-medium text-blue-400 uppercase tracking-wider">Saldo Real (Hoje)</h3>
          <p className="text-3xl font-bold text-white mt-2">{formatCurrency(saldoConsolidado)}</p>
          <p className="text-xs text-slate-500 mt-1">Disponível para uso imediato</p>
        </div>
        
        <div className="bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700 relative group hover:shadow-[0_0_15px_rgba(59,130,246,0.15)] transition-all">
          <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <TrendingUp size={48} className="text-green-500" />
          </div>
          <h3 className="text-sm font-medium text-green-400 uppercase tracking-wider">Receitas (Mês)</h3>
          <p className="text-3xl font-bold text-white mt-2">{formatCurrency(receitas)}</p>
        </div>
        
        <div className="bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700 relative group hover:shadow-[0_0_15px_rgba(59,130,246,0.15)] transition-all">
          <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <TrendingDown size={48} className="text-red-500" />
          </div>
          <h3 className="text-sm font-medium text-red-400 uppercase tracking-wider">Despesas (Mês)</h3>
          <p className="text-3xl font-bold text-white mt-2">{formatCurrency(despesas)}</p>
        </div>
      </div>

      {/* RUNWAY (PJ) or FIRE (PF) */}
      <div className="grid md:grid-cols-2 gap-6">
        {profile === 'PJ' ? (
          <>
            <div className="bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700 relative overflow-hidden">
              <div className="absolute right-0 top-0 p-4 opacity-10">
                <Activity size={64} className="text-red-500" />
              </div>
              <h3 className="text-sm font-medium text-red-400 uppercase tracking-wider">Runway (Crise)</h3>
              <p className="text-3xl font-bold text-white mt-2">
                {despesas > 0 ? (saldoConsolidado / despesas).toFixed(1) : '--'} meses
              </p>
              <p className="text-xs text-slate-500 mt-1">Sobrevivência sem receitas</p>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              <div className="bg-slate-800/50 border border-slate-700 p-4 rounded-lg flex flex-col justify-between relative overflow-hidden gap-4">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500"></div>
                <div className="flex items-center gap-4 pl-2">
                  <div className="bg-amber-500/20 p-3 rounded-full text-amber-400">
                    <ShieldCheck size={24} />
                  </div>
                  <div>
                    <h4 className="text-white font-bold">Provisão de Impostos</h4>
                    <p className="text-sm text-slate-400">
                      Restante: <span className="font-bold text-amber-400">{formatCurrency(receitas * (state.taxRate / 100))}</span>
                    </p>
                  </div>
                </div>
                <button className="w-full bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded font-bold shadow-lg transition-colors">
                  Gerenciar
                </button>
              </div>

              <div className="bg-slate-800/50 border border-slate-700 p-4 rounded-lg flex flex-col justify-between relative overflow-hidden gap-4">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-purple-500"></div>
                <div className="flex items-center gap-4 pl-2">
                  <div className="bg-purple-500/20 p-3 rounded-full text-purple-400">
                    <Lock size={24} />
                  </div>
                  <div>
                    <h4 className="text-white font-bold">Cofre de Guerra</h4>
                    <p className="text-sm text-slate-400">
                      Restante: <span className="font-bold text-purple-400">{formatCurrency(receitas * (state.warRate / 100))}</span>
                    </p>
                  </div>
                </div>
                <button className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded font-bold shadow-lg transition-colors">
                  Guardar
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700 relative">
            <h3 className="text-sm font-medium text-indigo-400 uppercase tracking-wider">Estilo de Vida (50/30/20)</h3>
            <div className="flex items-center gap-4 mt-4">
              <div className="flex-1 space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-blue-300">Essencial (50%)</span>
                  <div className="flex-1 mx-4 h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500" style={{ width: '50%' }}></div>
                  </div>
                  <span className="text-white font-bold">50%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-purple-300">Estilo (30%)</span>
                  <div className="flex-1 mx-4 h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500" style={{ width: '30%' }}></div>
                  </div>
                  <span className="text-white font-bold">30%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-green-300">Objetivos (20%)</span>
                  <div className="flex-1 mx-4 h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500" style={{ width: '20%' }}></div>
                  </div>
                  <span className="text-white font-bold">20%</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Recent Transactions */}
      <div className="bg-slate-800 rounded-xl shadow-lg border border-slate-700 overflow-hidden">
        <div className="p-6 border-b border-slate-700">
          <h3 className="text-lg font-semibold text-white">Últimas Movimentações</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-400">
            <thead className="bg-slate-700/50 text-xs uppercase font-medium text-slate-300">
              <tr>
                <th className="px-6 py-3">Data</th>
                <th className="px-6 py-3">Descrição</th>
                <th className="px-6 py-3">Categoria</th>
                <th className="px-6 py-3">Conta</th>
                <th className="px-6 py-3 text-right">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {recentTransactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    Nenhuma movimentação recente.
                  </td>
                </tr>
              ) : (
                recentTransactions.map(tx => {
                  const cat = state.categories.find(c => c.id === tx.categoryId);
                  const acc = state.accounts.find(a => a.id === tx.accountId);
                  return (
                    <tr key={tx.id} className="hover:bg-slate-700/30 transition-colors">
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
