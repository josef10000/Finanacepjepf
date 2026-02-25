import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { AutomationRule } from '../types';
import { Zap, Plus, Trash2, ArrowRight } from 'lucide-react';

export const AutomationView: React.FC<{ profile: 'PJ' | 'PF' }> = ({ profile }) => {
  const { data, updateData } = useData();
  const state = data?.[profile];

  const [showForm, setShowForm] = useState(false);
  const [trigger, setTrigger] = useState('');
  const [action, setAction] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data || !state) return;

    const newRule: AutomationRule = {
      id: crypto.randomUUID(),
      trigger,
      action,
      active: true
    };

    const newData = {
      ...data,
      [profile]: {
        ...state,
        automations: [...(state.automations || []), newRule]
      }
    };

    await updateData(newData);
    setTrigger('');
    setAction('');
    setShowForm(false);
  };

  const toggleRule = async (id: string) => {
    if (!data || !state) return;
    const newData = {
      ...data,
      [profile]: {
        ...state,
        automations: state.automations.map(r => 
          r.id === id ? { ...r, active: !r.active } : r
        )
      }
    };
    await updateData(newData);
  };

  const handleDelete = async (id: string) => {
    if (!data || !state) return;
    const newData = {
      ...data,
      [profile]: {
        ...state,
        automations: state.automations.filter(r => r.id !== id)
      }
    };
    await updateData(newData);
  };

  if (!state) return null;

  const automations = state.automations || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <Zap className="text-yellow-500" />
          Automações
        </h3>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors"
        >
          <Plus size={20} />
          Nova Automação
        </button>
      </div>

      {showForm && (
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 mb-6">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Gatilho (Quando acontecer isso...)</label>
              <input type="text" value={trigger} onChange={e => setTrigger(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded p-2 text-white" required placeholder="Ex: Receber salário" />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Ação (Faça isso...)</label>
              <input type="text" value={action} onChange={e => setAction(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded p-2 text-white" required placeholder="Ex: Transferir 20% para Reserva" />
            </div>
            <div className="md:col-span-2 flex justify-end gap-2 mt-2">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded text-slate-300 hover:bg-slate-700 transition-colors">Cancelar</button>
              <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded font-bold transition-colors">Salvar Automação</button>
            </div>
          </form>
        </div>
      )}

      {automations.length === 0 ? (
        <div className="bg-slate-800 p-8 rounded-xl border border-slate-700 text-center text-slate-400">
          <Zap size={48} className="mx-auto mb-4 opacity-50" />
          <p>Nenhuma automação configurada.</p>
          <p className="text-sm mt-2">Crie regras para automatizar suas finanças.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {automations.map(rule => (
            <div key={rule.id} className={`bg-slate-800 p-6 rounded-xl border border-slate-700 relative group transition-all ${rule.active ? 'opacity-100' : 'opacity-60'}`}>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-lg ${rule.active ? 'bg-yellow-500/20 text-yellow-400' : 'bg-slate-700/50 text-slate-500'}`}>
                    <Zap size={24} />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white">Regra de Automação</h4>
                    <p className="text-sm text-slate-400">Status: {rule.active ? 'Ativa' : 'Inativa'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => toggleRule(rule.id)}
                    className={`text-xs px-2 py-1 rounded ${rule.active ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'} transition-colors`}
                  >
                    {rule.active ? 'Desativar' : 'Ativar'}
                  </button>
                  <button onClick={() => handleDelete(rule.id)} className="text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              
              <div className="mt-4 flex flex-col gap-2">
                <div className="bg-slate-700/30 p-3 rounded-lg border border-slate-600">
                  <span className="text-xs text-slate-500 block mb-1">Gatilho</span>
                  <span className="text-sm text-slate-300 font-medium">{rule.trigger}</span>
                </div>
                <div className="flex justify-center">
                  <ArrowRight size={20} className="text-slate-500" />
                </div>
                <div className="bg-slate-700/30 p-3 rounded-lg border border-slate-600">
                  <span className="text-xs text-slate-500 block mb-1">Ação</span>
                  <span className="text-sm text-slate-300 font-medium">{rule.action}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
