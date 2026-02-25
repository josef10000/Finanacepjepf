import React, { useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { formatCurrency } from '../utils/format';
import { Calculator, TrendingDown, TrendingUp, DollarSign, Activity, Info, Download } from 'lucide-react';

export const DREView: React.FC<{ profile: 'PJ' | 'PF' }> = ({ profile }) => {
  const { data, privacyMode, globalMonth, globalYear } = useData();
  const state = data?.[profile];

  const dreData = useMemo(() => {
    if (!state) return null;

    let receitaBruta = 0;
    let impostos = 0;
    let deducoes = 0;
    let custosDiretos = 0;
    let despesasOp = 0;
    let despesasRH = 0;
    let despesasMkt = 0;
    let despesasFin = 0;
    let receitasFin = 0;
    let outrasDespesas = 0;

    state.transactions.forEach(tx => {
      const txDate = new Date(tx.date);
      if (txDate.getMonth() === globalMonth && txDate.getFullYear() === globalYear) {
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
          } else if (cat?.dre === 'deducoes') {
            deducoes += tx.amount;
          } else if (cat?.dre === 'custos_diretos') {
            custosDiretos += tx.amount;
          } else if (cat?.dre === 'despesas_op') {
            despesasOp += tx.amount;
          } else if (cat?.dre === 'despesas_rh') {
            despesasRH += tx.amount;
          } else if (cat?.dre === 'despesas_mkt') {
            despesasMkt += tx.amount;
          } else if (cat?.dre === 'despesas_fin') {
            despesasFin += tx.amount;
          } else {
            outrasDespesas += tx.amount;
          }
        }
      }
    });

    const totalDeducoes = impostos + deducoes;
    const receitaLiquida = receitaBruta - totalDeducoes;
    const lucroBruto = receitaLiquida - custosDiretos;
    const totalDespesasOp = despesasOp + despesasRH + despesasMkt;
    const lucroOperacional = lucroBruto - totalDespesasOp; // EBITDA
    const resultadoFinanceiro = receitasFin - despesasFin;
    const lucroLiquido = lucroOperacional + resultadoFinanceiro - outrasDespesas;
    
    const margemBruta = receitaLiquida > 0 ? (lucroBruto / receitaLiquida) * 100 : 0;
    const margemOperacional = receitaLiquida > 0 ? (lucroOperacional / receitaLiquida) * 100 : 0;
    const margemLiquida = receitaLiquida > 0 ? (lucroLiquido / receitaLiquida) * 100 : 0;

    return {
      receitaBruta,
      impostos,
      deducoes,
      totalDeducoes,
      receitaLiquida,
      custosDiretos,
      lucroBruto,
      despesasOp,
      despesasRH,
      despesasMkt,
      totalDespesasOp,
      lucroOperacional,
      resultadoFinanceiro,
      receitasFin,
      despesasFin,
      outrasDespesas,
      lucroLiquido,
      margemBruta,
      margemOperacional,
      margemLiquida
    };
  }, [state, globalMonth, globalYear]);

  if (!state || !dreData) return null;

  const renderValue = (val: number | string) => {
    if (privacyMode) return <span className="privacy-blur">R$ •••••</span>;
    return typeof val === 'number' ? formatCurrency(val) : val;
  };

  const av = (value: number) => dreData.receitaLiquida > 0 ? ((value / dreData.receitaLiquida) * 100).toFixed(1) + '%' : '0.0%';

  const handleExportCSV = () => {
    const csvContent = [
      ['DRE Gerencial', `${globalMonth + 1}/${globalYear}`],
      ['Descrição', 'Valor (R$)', 'AV%'],
      ['1. Receita Bruta Operacional', dreData.receitaBruta, '100%'],
      ['(-) Impostos sobre Vendas', dreData.impostos, av(dreData.impostos)],
      ['(-) Deduções/Devoluções', dreData.deducoes, av(dreData.deducoes)],
      ['2. Receita Líquida', dreData.receitaLiquida, av(dreData.receitaLiquida)],
      ['(-) Custos Diretos (CMV/CSV)', dreData.custosDiretos, av(dreData.custosDiretos)],
      ['3. Lucro Bruto', dreData.lucroBruto, av(dreData.lucroBruto)],
      ['(-) Despesas Operacionais', dreData.despesasOp, av(dreData.despesasOp)],
      ['(-) Despesas com Pessoal (RH)', dreData.despesasRH, av(dreData.despesasRH)],
      ['(-) Despesas com Marketing', dreData.despesasMkt, av(dreData.despesasMkt)],
      ['4. Lucro Operacional (EBITDA)', dreData.lucroOperacional, av(dreData.lucroOperacional)],
      ['(+) Receitas Financeiras', dreData.receitasFin, av(dreData.receitasFin)],
      ['(-) Despesas Financeiras', dreData.despesasFin, av(dreData.despesasFin)],
      ['(-) Outras Despesas', dreData.outrasDespesas, av(dreData.outrasDespesas)],
      ['5. Resultado Líquido', dreData.lucroLiquido, av(dreData.lucroLiquido)],
      ['Margem Líquida', `${dreData.margemLiquida.toFixed(1)}%`, '']
    ].map(e => e.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `DRE_${globalYear}_${globalMonth + 1}.csv`;
    link.click();
  };

  const TooltipIcon = ({ text }: { text: string }) => (
    <div className="group relative ml-2 inline-block">
      <Info size={14} className="text-slate-500 hover:text-blue-400 cursor-help transition-colors" />
      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block w-48 p-2 bg-slate-800 text-xs text-slate-300 rounded shadow-xl border border-slate-700 z-10 text-center">
        {text}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-2xl font-bold text-white flex items-center gap-3">
            <Calculator className="text-blue-500" />
            DRE Gerencial
          </h3>
          <p className="text-slate-400 mt-1">Demonstração do Resultado do Exercício</p>
        </div>
        <button 
          onClick={handleExportCSV}
          className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors border border-slate-700"
        >
          <Download size={18} />
          Exportar CSV
        </button>
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-xl">
        {/* Header */}
        <div className="grid grid-cols-12 p-4 border-b border-slate-700 bg-slate-900/50 text-xs font-bold text-slate-400 uppercase tracking-wider">
          <div className="col-span-8">Descrição</div>
          <div className="col-span-3 text-right">Valor</div>
          <div className="col-span-1 text-right" title="Análise Vertical (Base: Receita Líquida)">AV%</div>
        </div>

        {/* Receita Bruta */}
        <div className="grid grid-cols-12 p-4 border-b border-slate-700 bg-slate-800/50 items-center hover:bg-slate-700/30 transition-colors">
          <div className="col-span-8 flex items-center gap-3">
            <div className="p-1.5 bg-green-500/10 rounded-lg text-green-400">
              <TrendingUp size={18} />
            </div>
            <span className="font-bold text-slate-200 flex items-center">
              1. Receita Bruta Operacional
              <TooltipIcon text="Total faturado antes de qualquer dedução." />
            </span>
          </div>
          <div className="col-span-3 text-right font-bold text-green-400">{renderValue(dreData.receitaBruta)}</div>
          <div className="col-span-1 text-right text-xs text-slate-500 font-mono">-</div>
        </div>

        {/* Deduções */}
        <div className="grid grid-cols-12 p-4 border-b border-slate-700 items-center hover:bg-slate-700/30 transition-colors">
          <div className="col-span-8 flex items-center gap-3 pl-10">
            <TrendingDown size={14} className="text-red-400" />
            <span className="text-slate-400 flex items-center">
              (-) Impostos sobre Vendas
              <TooltipIcon text="DAS, ISS, ICMS, etc." />
            </span>
          </div>
          <div className="col-span-3 text-right text-red-400">{renderValue(dreData.impostos)}</div>
          <div className="col-span-1 text-right text-xs text-slate-500 font-mono">{av(dreData.impostos)}</div>
        </div>
        <div className="grid grid-cols-12 p-4 border-b border-slate-700 items-center hover:bg-slate-700/30 transition-colors">
          <div className="col-span-8 flex items-center gap-3 pl-10">
            <TrendingDown size={14} className="text-red-400" />
            <span className="text-slate-400 flex items-center">
              (-) Deduções/Devoluções
              <TooltipIcon text="Descontos concedidos, devoluções de vendas." />
            </span>
          </div>
          <div className="col-span-3 text-right text-red-400">{renderValue(dreData.deducoes)}</div>
          <div className="col-span-1 text-right text-xs text-slate-500 font-mono">{av(dreData.deducoes)}</div>
        </div>

        {/* Receita Líquida */}
        <div className="grid grid-cols-12 p-4 border-b border-slate-700 bg-slate-700/20 items-center">
          <div className="col-span-8 font-bold text-slate-200">2. Receita Líquida</div>
          <div className="col-span-3 text-right font-bold text-blue-400">{renderValue(dreData.receitaLiquida)}</div>
          <div className="col-span-1 text-right text-xs text-slate-500 font-mono">100%</div>
        </div>

        {/* Custos Diretos */}
        <div className="grid grid-cols-12 p-4 border-b border-slate-700 items-center hover:bg-slate-700/30 transition-colors">
          <div className="col-span-8 flex items-center gap-3 pl-10">
            <TrendingDown size={14} className="text-red-400" />
            <span className="text-slate-400 flex items-center">
              (-) Custos Diretos (CMV/CSV)
              <TooltipIcon text="Custos ligados diretamente à produção ou prestação do serviço (ex: matéria-prima, comissões)." />
            </span>
          </div>
          <div className="col-span-3 text-right text-red-400">{renderValue(dreData.custosDiretos)}</div>
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
          <div className="col-span-3 text-right font-bold text-white">{renderValue(dreData.lucroBruto)}</div>
          <div className="col-span-1 text-right text-xs text-slate-500 font-mono">{av(dreData.lucroBruto)}</div>
        </div>

        {/* Despesas Operacionais */}
        <div className="grid grid-cols-12 p-4 border-b border-slate-700 items-center hover:bg-slate-700/30 transition-colors">
          <div className="col-span-8 flex items-center gap-3 pl-10">
            <TrendingDown size={14} className="text-red-400" />
            <span className="text-slate-400 flex items-center">
              (-) Despesas Operacionais
              <TooltipIcon text="Aluguel, energia, internet, software, contabilidade, etc." />
            </span>
          </div>
          <div className="col-span-3 text-right text-red-400">{renderValue(dreData.despesasOp)}</div>
          <div className="col-span-1 text-right text-xs text-slate-500 font-mono">{av(dreData.despesasOp)}</div>
        </div>
        <div className="grid grid-cols-12 p-4 border-b border-slate-700 items-center hover:bg-slate-700/30 transition-colors">
          <div className="col-span-8 flex items-center gap-3 pl-10">
            <TrendingDown size={14} className="text-red-400" />
            <span className="text-slate-400 flex items-center">
              (-) Despesas com Pessoal (RH)
              <TooltipIcon text="Salários, pró-labore, encargos, benefícios." />
            </span>
          </div>
          <div className="col-span-3 text-right text-red-400">{renderValue(dreData.despesasRH)}</div>
          <div className="col-span-1 text-right text-xs text-slate-500 font-mono">{av(dreData.despesasRH)}</div>
        </div>
        <div className="grid grid-cols-12 p-4 border-b border-slate-700 items-center hover:bg-slate-700/30 transition-colors">
          <div className="col-span-8 flex items-center gap-3 pl-10">
            <TrendingDown size={14} className="text-red-400" />
            <span className="text-slate-400 flex items-center">
              (-) Despesas com Marketing
              <TooltipIcon text="Anúncios, tráfego pago, agências, eventos." />
            </span>
          </div>
          <div className="col-span-3 text-right text-red-400">{renderValue(dreData.despesasMkt)}</div>
          <div className="col-span-1 text-right text-xs text-slate-500 font-mono">{av(dreData.despesasMkt)}</div>
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
            {renderValue(dreData.lucroOperacional)}
          </div>
          <div className="col-span-1 text-right text-xs text-slate-500 font-mono">{av(Math.abs(dreData.lucroOperacional))}</div>
        </div>

        {/* Resultado Financeiro */}
        <div className="grid grid-cols-12 p-4 border-b border-slate-700 items-center hover:bg-slate-700/30 transition-colors">
          <div className="col-span-8 flex items-center gap-3 pl-10">
            <TrendingUp size={14} className="text-green-400" />
            <span className="text-slate-400 flex items-center">
              (+) Receitas Financeiras
              <TooltipIcon text="Rendimentos de aplicações, juros recebidos." />
            </span>
          </div>
          <div className="col-span-3 text-right text-green-400">{renderValue(dreData.receitasFin)}</div>
          <div className="col-span-1 text-right text-xs text-slate-500 font-mono">{av(dreData.receitasFin)}</div>
        </div>
        <div className="grid grid-cols-12 p-4 border-b border-slate-700 items-center hover:bg-slate-700/30 transition-colors">
          <div className="col-span-8 flex items-center gap-3 pl-10">
            <TrendingDown size={14} className="text-red-400" />
            <span className="text-slate-400 flex items-center">
              (-) Despesas Financeiras
              <TooltipIcon text="Juros pagos, tarifas bancárias, IOF." />
            </span>
          </div>
          <div className="col-span-3 text-right text-red-400">{renderValue(dreData.despesasFin)}</div>
          <div className="col-span-1 text-right text-xs text-slate-500 font-mono">{av(dreData.despesasFin)}</div>
        </div>

        {/* Outras Despesas */}
        <div className="grid grid-cols-12 p-4 border-b border-slate-700 items-center hover:bg-slate-700/30 transition-colors">
          <div className="col-span-8 flex items-center gap-3 pl-10">
            <TrendingDown size={14} className="text-red-400" />
            <span className="text-slate-400 flex items-center">
              (-) Outras Despesas
              <TooltipIcon text="Despesas não operacionais, perdas extraordinárias." />
            </span>
          </div>
          <div className="col-span-3 text-right text-red-400">{renderValue(dreData.outrasDespesas)}</div>
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
              {renderValue(dreData.lucroLiquido)}
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
