import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { DigitalTool } from '../types';
import { Rocket, Plus, Trash2, ExternalLink } from 'lucide-react';

export const DigitalToolsView: React.FC<{ profile: 'PJ' | 'PF' }> = ({ profile }) => {
  const { data, updateData } = useData();
  const state = data?.[profile];

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [purpose, setPurpose] = useState('');
  const [url, setUrl] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data || !state) return;

    const newTool: DigitalTool = {
      id: crypto.randomUUID(),
      name,
      purpose,
      url: url || undefined
    };

    const newData = {
      ...data,
      [profile]: {
        ...state,
        digitalTools: [...(state.digitalTools || []), newTool]
      }
    };

    await updateData(newData);
    setName('');
    setPurpose('');
    setUrl('');
    setShowForm(false);
  };

  const handleDelete = async (id: string) => {
    if (!data || !state) return;
    const newData = {
      ...data,
      [profile]: {
        ...state,
        digitalTools: state.digitalTools.filter(t => t.id !== id)
      }
    };
    await updateData(newData);
  };

  if (!state) return null;

  const tools = state.digitalTools || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <Rocket className="text-blue-500" />
          Ferramentas Digitais
        </h3>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors"
        >
          <Plus size={20} />
          Adicionar Ferramenta
        </button>
      </div>

      {showForm && (
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 mb-6">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Nome da Ferramenta</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded p-2 text-white" required placeholder="Ex: Notion, Figma" />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Propósito</label>
              <input type="text" value={purpose} onChange={e => setPurpose(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded p-2 text-white" required placeholder="Ex: Gestão de Projetos" />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">URL (Opcional)</label>
              <input type="url" value={url} onChange={e => setUrl(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded p-2 text-white" placeholder="https://" />
            </div>
            <div className="md:col-span-3 flex justify-end gap-2 mt-2">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded text-slate-300 hover:bg-slate-700 transition-colors">Cancelar</button>
              <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded font-bold transition-colors">Salvar Ferramenta</button>
            </div>
          </form>
        </div>
      )}

      {tools.length === 0 ? (
        <div className="bg-slate-800 p-8 rounded-xl border border-slate-700 text-center text-slate-400">
          <Rocket size={48} className="mx-auto mb-4 opacity-50" />
          <p>Nenhuma ferramenta digital cadastrada.</p>
          <p className="text-sm mt-2">Organize as ferramentas que você usa no seu dia a dia.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map(tool => (
            <div key={tool.id} className="bg-slate-800 p-6 rounded-xl border border-slate-700 relative group hover:shadow-lg transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-slate-700/50 rounded-lg text-blue-400">
                    <Rocket size={24} />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white">{tool.name}</h4>
                    <p className="text-sm text-slate-400">{tool.purpose}</p>
                  </div>
                </div>
                <button onClick={() => handleDelete(tool.id)} className="text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Trash2 size={18} />
                </button>
              </div>
              
              {tool.url && (
                <a 
                  href={tool.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="mt-4 flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <ExternalLink size={16} />
                  Acessar Ferramenta
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
