import React, { useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { formatCurrency } from '../utils/format';
import { CreditCard, AlertCircle } from 'lucide-react';

export const CardsView: React.FC<{ profile: 'PJ' | 'PF' }> = ({ profile }) => {
  const { data } = useData();
  const state = data?.[profile];

  const cards = useMemo(() => {
    if (!state) return [];
    return state.accounts.filter(a => a.type === 'credit_card');
  }, [state]);

  const cardStats = useMemo(() => {
    if (!state) return {};
    
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const stats: Record<string, { spent: number }> = {};
    cards.forEach(c => stats[c.id] = { spent: 0 });

    state.transactions.forEach(tx => {
      if (tx.type === 'despesa' && stats[tx.accountId]) {
        const txDate = new Date(tx.date);
        if (txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear) {
          stats[tx.accountId].spent += tx.amount;
        }
      }
    });

    return stats;
  }, [state, cards]);

  if (!state) return null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-white">Meus Cartões</h3>
      </div>

      {cards.length === 0 ? (
        <div className="bg-slate-800 p-8 rounded-xl border border-slate-700 text-center text-slate-400">
          <CreditCard size={48} className="mx-auto mb-4 opacity-50" />
          <p>Nenhum cartão de crédito cadastrado.</p>
          <p className="text-sm mt-2">Vá até a aba "Contas" para adicionar um novo cartão.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map(card => {
            const limit = card.limit || 0;
            const spent = cardStats[card.id]?.spent || 0;
            const available = Math.max(0, limit - spent);
            const usagePercent = limit > 0 ? Math.min(100, (spent / limit) * 100) : 0;
            
            let statusColor = 'bg-blue-500';
            if (usagePercent > 80) statusColor = 'bg-red-500';
            else if (usagePercent > 50) statusColor = 'bg-amber-500';

            return (
              <div key={card.id} className="bg-slate-800 p-6 rounded-xl border border-slate-700 relative overflow-hidden group">
                <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <CreditCard size={64} className="text-slate-400" />
                </div>
                
                <div className="relative z-10">
                  <h4 className="text-lg font-bold text-white mb-1">{card.name}</h4>
                  <p className="text-sm text-slate-400 mb-6">Fatura atual (mês vigente)</p>
                  
                  <div className="text-3xl font-bold text-white mb-6">
                    {formatCurrency(spent)}
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>Limite Utilizado</span>
                      <span>{usagePercent.toFixed(1)}%</span>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div className={`h-full ${statusColor} transition-all duration-500`} style={{ width: `${usagePercent}%` }}></div>
                    </div>
                    <div className="flex justify-between text-xs mt-2">
                      <span className="text-slate-500">Limite Total: {formatCurrency(limit)}</span>
                      <span className="text-emerald-400 font-medium">Disponível: {formatCurrency(available)}</span>
                    </div>
                  </div>
                </div>
                
                {usagePercent > 80 && (
                  <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2 text-red-400 text-xs">
                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                    <p>Atenção: O uso do limite está alto. Considere antecipar o pagamento ou reduzir gastos.</p>
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
