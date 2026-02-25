import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogIn } from 'lucide-react';

export const Login: React.FC = () => {
  const { signIn } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-200">
      <div className="bg-slate-800 p-8 rounded-xl shadow-2xl border border-slate-700 max-w-md w-full text-center">
        <div className="mb-8">
          <div className="w-20 h-20 bg-slate-900 rounded-2xl mx-auto flex items-center justify-center mb-4 border border-slate-700">
            <span className="text-3xl font-bold text-blue-500">HS</span>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">
            Financeiro Hub
          </h1>
          <p className="text-slate-400 mt-2">Gerencie suas finanças PJ e PF em um só lugar</p>
        </div>

        <button
          onClick={signIn}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-3 transition-colors"
        >
          <LogIn size={20} />
          Entrar com Google
        </button>
      </div>
    </div>
  );
};
