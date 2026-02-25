import React, { useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { formatCurrency } from '../utils/format';
import { Calculator, TrendingDown, TrendingUp, DollarSign } from 'lucide-react';

export const DREView: React.FC<{ profile: 'PJ' | 'PF' }> = ({ profile }) => {
  const { data } = useData();
  const state = data?.[profile];

  const dreData = useMemo(() => {
    if (!state) return null;

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    let receitaBruta = 0;
    let impostos = 0;
    let despesasOp = 0;
    let outrasDespesas = 0;

    state.transactions.forEach(tx => {
      const txDate = new Date(tx.date);
      if (txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear) {
        const cat = state.categories.find(c => c.id === tx.categoryId);
        
        if (tx.type === 'receita') {
          receitaBruta += tx.amount;
        } else if (tx.type === 'despesa') {
          if (cat?.dre === 'impostos') {
            impostos += tx.amount;
          } else if (cat?.dre === 'despesas_op') {
            despesasOp += tx.amount;
          } else {
            outrasDespesas += tx.amount;
          }
        }
      }
    });

    const receitaLiquida = receitaBruta - impostos;
    const lucroOperacional = receitaLiquida - despesasOp;
    const lucroLiquido = lucroOperacional - outrasDespesas;
    
    const margemLiquida = receitaBruta > 0 ? (lucroLiquido / receitaBruta) * 100 : 0;

    return {
      receitaBruta,
      impostos,
      receitaLiquida,
      despesasOp,
      lucroOperacional,
      outrasDespesas,
      lucroLiquido,
      margemLiquida
    };
  }, [state]);

  if (!state || !dreData) return null;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h3 className="text-2xl font-bold text-white flex items-center gap-3">
            <Calculator className="text-blue-500" />
            DRE Gerencial
          </h3>
          <p className="text-slate-400 mt-1">Demonstração do Resultado do Exercício (Mês Atual)</p>
        </div>
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-xl">
        {/* Receita Bruta */}
        <div className="p-4 sm:p-6 border-b border-slate-700 bg-slate-800/50 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/10 rounded-lg text-green-400">
              <TrendingUp size={20} />
            </div>
            <span className="font-bold text-slate-200 text-lg">1. Receita Bruta</span>
          </div>
          <span className="font-bold text-green-400 text-xl">{formatCurrency(dreData.receitaBruta)}</span>
        </div>

        {/* Deduções */}
        <div className="p-4 sm:p-6 border-b border-slate-700 flex justify-between items-center pl-12 sm:pl-16">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-red-500/10 rounded text-red-400">
              <TrendingDown size={16} />
            </div>
            <span className="text-slate-400">(-) Impostos e Deduções</span>
          </div>
          <span className="text-red-400 font-medium">{formatCurrency(dreData.impostos)}</span>
        </div>

        {/* Receita Líquida */}
        <div className="p-4 sm:p-6 border-b border-slate-700 bg-slate-700/20 flex justify-between items-center">
          <span className="font-bold text-slate-200 text-lg">2. Receita Líquida</span>
          <span className="font-bold text-blue-400 text-xl">{formatCurrency(dreData.receitaLiquida)}</span>
        </div>

        {/* Despesas Operacionais */}
        <div className="p-4 sm:p-6 border-b border-slate-700 flex justify-between items-center pl-12 sm:pl-16">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-red-500/10 rounded text-red-400">
              <TrendingDown size={16} />
            </div>
            <span className="text-slate-400">(-) Despesas Operacionais (Fixas/Variáveis)</span>
          </div>
          <span className="text-red-400 font-medium">{formatCurrency(dreData.despesasOp)}</span>
        </div>

        {/* Lucro Operacional */}
        <div className="p-4 sm:p-6 border-b border-slate-700 bg-slate-700/20 flex justify-between items-center">
          <span className="font-bold text-slate-200 text-lg">3. Lucro Operacional (EBITDA)</span>
          <span className={`font-bold text-xl ${dreData.lucroOperacional >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {formatCurrency(dreData.lucroOperacional)}
          </span>
        </div>

        {/* Outras Despesas */}
        <div className="p-4 sm:p-6 border-b border-slate-700 flex justify-between items-center pl-12 sm:pl-16">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-red-500/10 rounded text-red-400">
              <TrendingDown size={16} />
            </div>
            <span className="text-slate-400">(-) Outras Despesas (Financeiras/Não Op.)</span>
          </div>
          <span className="text-red-400 font-medium">{formatCurrency(dreData.outrasDespesas)}</span>
        </div>

        {/* Lucro Líquido */}
        <div className="p-6 bg-slate-900/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl ${dreData.lucroLiquido >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
              <DollarSign size={28} />
            </div>
            <div>
              <span className="font-black text-white text-2xl block">4. Resultado Líquido</span>
              <span className="text-sm text-slate-400">O que realmente sobrou no caixa</span>
            </div>
          </div>
          <div className="text-right w-full sm:w-auto">
            <span className={`font-black text-3xl block ${dreData.lucroLiquido >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {formatCurrency(dreData.lucroLiquido)}
            </span>
            <span className={`text-sm font-bold px-2 py-1 rounded mt-2 inline-block ${dreData.margemLiquida >= 20 ? 'bg-emerald-500/20 text-emerald-400' : dreData.margemLiquida > 0 ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'}`}>
              Margem: {dreData.margemLiquida.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>
      
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 text-sm text-blue-300 flex items-start gap-3">
        <div className="mt-0.5">ℹ️</div>
        <p>
          Para que o DRE funcione corretamente, certifique-se de classificar suas categorias de despesa na aba "Categorias" com as tags corretas (Impostos, Operacionais, etc).
        </p>
      </div>
    </div>
  );
};
