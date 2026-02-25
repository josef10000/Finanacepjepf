import React, { useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { formatCurrency } from '../utils/format';
import { BarChart2, PieChart, TrendingDown, TrendingUp } from 'lucide-react';

export const ReportsView: React.FC<{ profile: 'PJ' | 'PF' }> = ({ profile }) => {
  const { data } = useData();
  const state = data?.[profile];

  const {
    totalReceitas,
    totalDespesas,
    despesasPorCategoria,
    receitasPorCategoria
  } = useMemo(() => {
    if (!state) return { totalReceitas: 0, totalDespesas: 0, despesasPorCategoria: [], receitasPorCategoria: [] };

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    let rec = 0;
    let desp = 0;
    const despesasMap: Record<string, number> = {};
    const receitasMap: Record<string, number> = {};

    state.transactions.forEach(tx => {
      const txDate = new Date(tx.date);
      if (txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear) {
        if (tx.type === 'receita') {
          rec += tx.amount;
          receitasMap[tx.categoryId] = (receitasMap[tx.categoryId] || 0) + tx.amount;
        }
        if (tx.type === 'despesa') {
          desp += tx.amount;
          despesasMap[tx.categoryId] = (despesasMap[tx.categoryId] || 0) + tx.amount;
        }
      }
    });

    const formatCategoryData = (map: Record<string, number>, total: number) => {
      return Object.entries(map)
        .map(([categoryId, amount]) => {
          const cat = state.categories.find(c => c.id === categoryId);
          return {
            id: categoryId,
            name: cat?.name || 'Sem Categoria',
            amount,
            percent: total > 0 ? (amount / total) * 100 : 0
          };
        })
        .sort((a, b) => b.amount - a.amount);
    };

    return {
      totalReceitas: rec,
      totalDespesas: desp,
      despesasPorCategoria: formatCategoryData(despesasMap, desp),
      receitasPorCategoria: formatCategoryData(receitasMap, rec)
    };
  }, [state]);

  if (!state) return null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-white">Relatório Mensal</h3>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Despesas */}
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-red-500/10 rounded-lg text-red-400">
              <TrendingDown size={24} />
            </div>
            <div>
              <h4 className="text-lg font-bold text-white">Despesas por Categoria</h4>
              <p className="text-sm text-slate-400">Total: <span className="text-red-400 font-bold">{formatCurrency(totalDespesas)}</span></p>
            </div>
          </div>

          {despesasPorCategoria.length === 0 ? (
            <p className="text-slate-500 text-center py-4">Nenhuma despesa neste mês.</p>
          ) : (
            <div className="space-y-4">
              {despesasPorCategoria.map(item => (
                <div key={item.id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-300">{item.name}</span>
                    <span className="text-white font-medium">{formatCurrency(item.amount)}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-red-500" style={{ width: `${item.percent}%` }}></div>
                    </div>
                    <span className="text-xs text-slate-500 w-10 text-right">{item.percent.toFixed(1)}%</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Receitas */}
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-green-500/10 rounded-lg text-green-400">
              <TrendingUp size={24} />
            </div>
            <div>
              <h4 className="text-lg font-bold text-white">Receitas por Categoria</h4>
              <p className="text-sm text-slate-400">Total: <span className="text-green-400 font-bold">{formatCurrency(totalReceitas)}</span></p>
            </div>
          </div>

          {receitasPorCategoria.length === 0 ? (
            <p className="text-slate-500 text-center py-4">Nenhuma receita neste mês.</p>
          ) : (
            <div className="space-y-4">
              {receitasPorCategoria.map(item => (
                <div key={item.id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-300">{item.name}</span>
                    <span className="text-white font-medium">{formatCurrency(item.amount)}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500" style={{ width: `${item.percent}%` }}></div>
                    </div>
                    <span className="text-xs text-slate-500 w-10 text-right">{item.percent.toFixed(1)}%</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
