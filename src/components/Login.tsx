import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ShieldCheck, TrendingUp, PieChart } from 'lucide-react';

export const Login: React.FC = () => {
  const { signIn } = useAuth();

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-200 font-sans selection:bg-blue-500/30">
      {/* Left Panel - Branding & Info */}
      <div className="hidden lg:flex flex-1 flex-col justify-between p-12 border-r border-slate-800 bg-slate-900/50 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-900/0 to-slate-900/0"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/20">
              <span className="text-xl font-bold text-white">HS</span>
            </div>
            <span className="text-2xl font-bold tracking-tight text-white">Financeiro Hub</span>
          </div>
          
          <h1 className="text-5xl font-bold leading-[1.1] tracking-tight text-white mb-6">
            O controle definitivo <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
              PJ e PF
            </span> em um só lugar.
          </h1>
          <p className="text-lg text-slate-400 max-w-md">
            Gerencie fluxo de caixa, runway, DRE gerencial e seu patrimônio pessoal com inteligência e simplicidade.
          </p>
        </div>

        <div className="relative z-10 grid grid-cols-2 gap-6 mt-12">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400"><TrendingUp size={20} /></div>
            <div>
              <h3 className="font-semibold text-white">Dashboard Unificado</h3>
              <p className="text-sm text-slate-500">Visão clara do seu negócio e vida pessoal.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400"><PieChart size={20} /></div>
            <div>
              <h3 className="font-semibold text-white">DRE & FIRE</h3>
              <p className="text-sm text-slate-500">Métricas avançadas para tomada de decisão.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 relative">
        <div className="w-full max-w-md space-y-8 relative z-10">
          <div className="text-center lg:text-left">
            <div className="lg:hidden w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-900/20 mx-auto mb-6">
              <span className="text-2xl font-bold text-white">HS</span>
            </div>
            <h2 className="text-3xl font-bold text-white tracking-tight">Bem-vindo de volta</h2>
            <p className="text-slate-400 mt-2">Faça login para acessar seu painel financeiro.</p>
          </div>

          <div className="bg-slate-900/80 backdrop-blur-xl p-8 rounded-2xl border border-slate-800 shadow-2xl">
            <button
              onClick={signIn}
              className="w-full group relative flex items-center justify-center gap-3 bg-white text-slate-900 font-semibold py-3.5 px-4 rounded-xl transition-all hover:bg-slate-100 active:scale-[0.98]"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Continuar com Google
            </button>

            <div className="mt-6 flex items-center justify-center gap-2 text-sm text-slate-500">
              <ShieldCheck size={16} className="text-emerald-500" />
              <span>Acesso seguro via Google Authenticator</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
