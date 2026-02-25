import React, { useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { formatCurrency } from '../utils/format';
import { TrendingUp, TrendingDown, Activity, AlertCircle } from 'lucide-react';

export const ProjectionsView: React.FC<{ profile: 'PJ' | 'PF' }> = ({ profile }) => {
  const { data } = useData();
  const state = data?.[profile];

  const {
    currentBalance,
    avgMonthlyIncome,
    avgMonthlyExpense,
    projectedBalance,
    runwayMonths,
    fireNumber
  } = useMemo(() => {
    if (!state) return { currentBalance: 0, avgMonthlyIncome: 0, avgMonthlyExpense: 0, projectedBalance: 0, runwayMonths: 0, fireNumber: 0 };

    let balance = 0;
    state.accounts.forEach(acc => balance += acc.initialBalance || 0);

    let totalIncome = 0;
    let totalExpense = 0;
    const monthsSet = new Set<string>();

    state.transactions.forEach(tx => {
      if (tx.type === 'receita') totalIncome += tx.amount;
      if (tx.type === 'despesa') totalExpense += tx.amount;
      
      const txDate = new Date(tx.date);
      monthsSet.add(`${txDate.getFullYear()}-${txDate.getMonth()}`);
    });

    const monthsCount = Math.max(1, monthsSet.size);
    const avgIncome = totalIncome / monthsCount;
    const avgExpense = totalExpense / monthsCount;

    // Projection for next 6 months
    const projected = balance + ((avgIncome - avgExpense) * 6);
    
    // Runway (PJ) - How many months can survive without income
    const runway = avgExpense > 0 ? balance / avgExpense : 0;

    // FIRE Number (PF) - Rule of 25 (Annual expenses * 25)
    const fire = (avgExpense * 12) * 25;

    return {
      currentBalance: balance,
      avgMonthlyIncome: avgIncome,
      avgMonthlyExpense: avgExpense,
      projectedBalance: projected,
      runwayMonths: runway,
      fireNumber: fire
    };
  }, [state]);

  if (!state) return null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <Activity className="text-blue-500" />
          {profile === 'PJ' ? 'Projeções e Fluxo de Caixa' : 'Projeções e FIRE'}
        </h3>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700 relative overflow-hidden">
          <div className="absolute right-0 top-0 p-4 opacity-10">
            <TrendingUp size={48} className="text-green-500" />
          </div>
          <h3 className="text-sm font-medium text-green-400 uppercase tracking-wider">Média de Receitas/Mês</h3>
          <p className="text-3xl font-bold text-white mt-2">{formatCurrency(avgMonthlyIncome)}</p>
        </div>
        
        <div className="bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700 relative overflow-hidden">
          <div className="absolute right-0 top-0 p-4 opacity-10">
            <TrendingDown size={48} className="text-red-500" />
          </div>
          <h3 className="text-sm font-medium text-red-400 uppercase tracking-wider">Média de Despesas/Mês</h3>
          <p className="text-3xl font-bold text-white mt-2">{formatCurrency(avgMonthlyExpense)}</p>
        </div>
        
        <div className="bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700 relative overflow-hidden">
          <div className="absolute right-0 top-0 p-4 opacity-10">
            <Activity size={48} className="text-blue-500" />
          </div>
          <h3 className="text-sm font-medium text-blue-400 uppercase tracking-wider">Saldo Projetado (6 Meses)</h3>
          <p className={`text-3xl font-bold mt-2 ${projectedBalance >= 0 ? 'text-white' : 'text-red-400'}`}>
            {formatCurrency(projectedBalance)}
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {profile === 'PJ' ? (
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <AlertCircle className="text-amber-500" size={20} />
              Análise de Sobrevivência (Runway)
            </h3>
            <div className="flex items-center justify-between mb-4">
              <span className="text-slate-400">Tempo de vida sem novas receitas:</span>
              <span className={`text-2xl font-bold ${runwayMonths >= 6 ? 'text-green-400' : runwayMonths >= 3 ? 'text-amber-400' : 'text-red-400'}`}>
                {runwayMonths.toFixed(1)} meses
              </span>
            </div>
            <div className="h-4 bg-slate-700 rounded-full overflow-hidden mb-4">
              <div 
                className={`h-full transition-all duration-500 ${runwayMonths >= 6 ? 'bg-green-500' : runwayMonths >= 3 ? 'bg-amber-500' : 'bg-red-500'}`} 
                style={{ width: `${Math.min(100, (runwayMonths / 12) * 100)}%` }}
              ></div>
            </div>
            <p className="text-sm text-slate-500">
              O ideal para empresas é manter um runway de pelo menos 6 a 12 meses para garantir segurança em períodos de crise.
            </p>
          </div>
        ) : (
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Activity className="text-purple-500" size={20} />
              Independência Financeira (FIRE)
            </h3>
            <div className="flex items-center justify-between mb-4">
              <span className="text-slate-400">Seu Número FIRE (Regra dos 300):</span>
              <span className="text-2xl font-bold text-purple-400">
                {formatCurrency(fireNumber)}
              </span>
            </div>
            <div className="mb-4">
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Progresso Atual</span>
                <span>{fireNumber > 0 ? ((currentBalance / fireNumber) * 100).toFixed(2) : 0}%</span>
              </div>
              <div className="h-4 bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-purple-500 transition-all duration-500" 
                  style={{ width: `${Math.min(100, fireNumber > 0 ? (currentBalance / fireNumber) * 100 : 0)}%` }}
                ></div>
              </div>
            </div>
            <p className="text-sm text-slate-500">
              O Número FIRE é uma estimativa do patrimônio investido necessário para viver de renda, baseado no seu custo de vida médio atual multiplicado por 300 meses (25 anos).
            </p>
          </div>
        )}

        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 flex flex-col justify-center items-center text-center">
          <div className="p-4 bg-blue-500/10 rounded-full text-blue-400 mb-4">
            <TrendingUp size={32} />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Crescimento Patrimonial</h3>
          <p className="text-slate-400 text-sm mb-4">
            Seu saldo médio mensal tem sido de <span className={`font-bold ${avgMonthlyIncome - avgMonthlyExpense >= 0 ? 'text-green-400' : 'text-red-400'}`}>{formatCurrency(avgMonthlyIncome - avgMonthlyExpense)}</span>.
          </p>
          <p className="text-slate-500 text-xs">
            Mantenha suas despesas abaixo das receitas para garantir um crescimento sustentável a longo prazo.
          </p>
        </div>
      </div>
    </div>
  );
};
