import React, { useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { formatCurrency } from '../utils/format';
import { Calculator, TrendingDown, TrendingUp, DollarSign, Activity } from 'lucide-react';

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
    let custosDiretos = 0;
    let despesasOp = 0;
    let despesasFin = 0;
    let receitasFin = 0;
    let outrasDespesas = 0;

    state.transactions.forEach(tx => {
      const txDate = new Date(tx.date);
      if (txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear) {
        const cat = state.categories.find(c => c.id === tx.categoryId);
        
        if (tx.type === 'receita') {
          if (cat?.dre === 'receitas_fin') {
            receitasFin += tx.amount;
          } else {
            receitaBruta += tx.amount;
          }
        } else if (tx.type === 'despesa') {
          if (cat?.dre === 'impostos') {
            impostos += tx.amount;
          } else if (cat?.dre === 'custos_diretos') {
            custosDiretos += tx.amount;
          } else if (cat?.dre === 'despesas_op') {
            despesasOp += tx.amount;
          } else if (cat?.dre === 'despesas_fin') {
            despesasFin += tx.amount;
          } else {
            outrasDespesas += tx.amount;
          }
        }
      }
    });

    const receitaLiquida = receitaBruta - impostos;
    const lucroBruto = receitaLiquida - custosDiretos;
    const lucroOperacional = lucroBruto - despesasOp; // EBITDA
    const resultadoFinanceiro = receitasFin - despesasFin;
    const lucroLiquido = lucroOperacional + resultadoFinanceiro - outrasDespesas;
    
    const margemBruta = receitaBruta > 0 ? (lucroBruto / receitaBruta) * 100 : 0;
    const margemOperacional = receitaBruta > 0 ? (lucroOperacional / receitaBruta) * 100 : 0;
    const margemLiquida = receitaBruta > 0 ? (lucroLiquido / receitaBruta) * 100 : 0;

    return {
      receitaBruta,
      impostos,
      receitaLiquida,
      custosDiretos,
      lucroBruto,
      despesasOp,
      lucroOperacional,
      resultadoFinanceiro,
      outrasDespesas,
      lucroLiquido,
      margemBruta,
      margemOperacional,
      margemLiquida
    };
  }, [state]);

  if (!state || !dreData) return null;

  const av = (value: number) => dreData.receitaBruta > 0 ? ((value / dreData.receitaBruta) * 100).toFixed(1) + '%' : '0.0%';

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-2xl font-bold text-white flex items-center gap-3">
            <Calculator className="text-blue-500" />
            DRE Gerencial
          </h3>
          <p className="text-slate-400 mt-1">Demonstração do Resultado do Exercício (Mês Atual)</p>
        </div>
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-xl">
        {/* Header */}
        <div className="grid grid-cols-12 p-4 border-b border-slate-700 bg-slate-900/50 text-xs font-bold text-slate-400 uppercase tracking-wider">
          <div className="col-span-8">Descrição</div>
          <div className="col-span-3 text-right">Valor</div>
          <div className="col-span-1 text-right">AV%</div>
        </div>

        {/* Receita Bruta */}
        <div className="grid grid-cols-12 p-4 border-b border-slate-700 bg-slate-800/50 items-center">
          <div className="col-span-8 flex items-center gap-3">
            <div className="p-1.5 bg-green-500/10 rounded-lg text-green-400">
              <TrendingUp size={18} />
            </div>
            <span className="font-bold text-slate-200">1. Receita Bruta Operacional</span>
          </div>
          <div className="col-span-3 text-right font-bold text-green-400">{formatCurrency(dreData.receitaBruta)}</div>
          <div className="col-span-1 text-right text-xs text-slate-500 font-mono">100%</div>
        </div>

        {/* Impostos */}
        <div className="grid grid-cols-12 p-4 border-b border-slate-700 items-center">
          <div className="col-span-8 flex items-center gap-3 pl-10">
            <TrendingDown size={14} className="text-red-400" />
            <span className="text-slate-400">(-) Impostos sobre Vendas</span>
          </div>
          <div className="col-span-3 text-right text-red-400">{formatCurrency(dreData.impostos)}</div>
          <div className="col-span-1 text-right text-xs text-slate-500 font-mono">{av(dreData.impostos)}</div>
        </div>

        {/* Receita Líquida */}
        <div className="grid grid-cols-12 p-4 border-b border-slate-700 bg-slate-700/20 items-center">
          <div className="col-span-8 font-bold text-slate-200">2. Receita Líquida</div>
          <div className="col-span-3 text-right font-bold text-blue-400">{formatCurrency(dreData.receitaLiquida)}</div>
          <div className="col-span-1 text-right text-xs text-slate-500 font-mono">{av(dreData.receitaLiquida)}</div>
        </div>

        {/* Custos Diretos */}
        <div className="grid grid-cols-12 p-4 border-b border-slate-700 items-center">
          <div className="col-span-8 flex items-center gap-3 pl-10">
            <TrendingDown size={14} className="text-red-400" />
            <span className="text-slate-400">(-) Custos Diretos (CMV/CSV)</span>
          </div>
          <div className="col-span-3 text-right text-red-400">{formatCurrency(dreData.custosDiretos)}</div>
          <div className="col-span-1 text-right text-xs text-slate-500 font-mono">{av(dreData.custosDiretos)}</div>
        </div>

        {/* Lucro Bruto */}
        <div className="grid grid-cols-12 p-4 border-b border-slate-700 bg-slate-700/20 items-center">
          <div className="col-span-8 font-bold text-slate-200 flex items-center gap-2">
            3. Lucro Bruto
            <span className="text-xs font-normal px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-600">
              Margem: {dreData.margemBruta.toFixed(1)}%
            </span>
          </div>
          <div className="col-span-3 text-right font-bold text-white">{formatCurrency(dreData.lucroBruto)}</div>
          <div className="col-span-1 text-right text-xs text-slate-500 font-mono">{av(dreData.lucroBruto)}</div>
        </div>

        {/* Despesas Operacionais */}
        <div className="grid grid-cols-12 p-4 border-b border-slate-700 items-center">
          <div className="col-span-8 flex items-center gap-3 pl-10">
            <TrendingDown size={14} className="text-red-400" />
            <span className="text-slate-400">(-) Despesas Operacionais (Fixas/Variáveis)</span>
          </div>
          <div className="col-span-3 text-right text-red-400">{formatCurrency(dreData.despesasOp)}</div>
          <div className="col-span-1 text-right text-xs text-slate-500 font-mono">{av(dreData.despesasOp)}</div>
        </div>

        {/* Lucro Operacional (EBITDA) */}
        <div className="grid grid-cols-12 p-4 border-b border-slate-700 bg-slate-700/20 items-center">
          <div className="col-span-8 font-bold text-slate-200 flex items-center gap-2">
            4. Lucro Operacional (EBITDA)
            <span className="text-xs font-normal px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-600">
              Margem: {dreData.margemOperacional.toFixed(1)}%
            </span>
          </div>
          <div className={`col-span-3 text-right font-bold ${dreData.lucroOperacional >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {formatCurrency(dreData.lucroOperacional)}
          </div>
          <div className="col-span-1 text-right text-xs text-slate-500 font-mono">{av(dreData.lucroOperacional)}</div>
        </div>

        {/* Resultado Financeiro */}
        <div className="grid grid-cols-12 p-4 border-b border-slate-700 items-center">
          <div className="col-span-8 flex items-center gap-3 pl-10">
            <Activity size={14} className={dreData.resultadoFinanceiro >= 0 ? 'text-green-400' : 'text-red-400'} />
            <span className="text-slate-400">(+/-) Resultado Financeiro</span>
          </div>
          <div className={`col-span-3 text-right ${dreData.resultadoFinanceiro >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {formatCurrency(dreData.resultadoFinanceiro)}
          </div>
          <div className="col-span-1 text-right text-xs text-slate-500 font-mono">{av(Math.abs(dreData.resultadoFinanceiro))}</div>
        </div>

        {/* Outras Despesas */}
        <div className="grid grid-cols-12 p-4 border-b border-slate-700 items-center">
          <div className="col-span-8 flex items-center gap-3 pl-10">
            <TrendingDown size={14} className="text-red-400" />
            <span className="text-slate-400">(-) Outras Despesas (Não Operacionais)</span>
          </div>
          <div className="col-span-3 text-right text-red-400">{formatCurrency(dreData.outrasDespesas)}</div>
          <div className="col-span-1 text-right text-xs text-slate-500 font-mono">{av(dreData.outrasDespesas)}</div>
        </div>

        {/* Lucro Líquido */}
        <div className="p-6 bg-slate-900/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl ${dreData.lucroLiquido >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
              <DollarSign size={28} />
            </div>
            <div>
              <span className="font-black text-white text-2xl block">5. Resultado Líquido</span>
              <span className="text-sm text-slate-400">O que realmente sobrou no caixa</span>
            </div>
          </div>
          <div className="text-right w-full sm:w-auto">
            <span className={`font-black text-3xl block ${dreData.lucroLiquido >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {formatCurrency(dreData.lucroLiquido)}
            </span>
            <span className={`text-sm font-bold px-2 py-1 rounded mt-2 inline-block ${dreData.margemLiquida >= 20 ? 'bg-emerald-500/20 text-emerald-400' : dreData.margemLiquida > 0 ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'}`}>
              Margem Líquida: {dreData.margemLiquida.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>
      
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 text-sm text-blue-300 flex items-start gap-3">
        <div className="mt-0.5">ℹ️</div>
        <p>
          <strong>Dica de Gestão:</strong> Para que o DRE seja preciso, edite suas Categorias e defina a classificação DRE correta (Impostos, Custos Diretos, Despesas Operacionais, etc).
        </p>
      </div>
    </div>
  );
};
