import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { DashboardView } from './DashboardView';
import { TransactionsView } from './TransactionsView';
import { 
  FinanceHubView, 
  PlanningHubView, 
  AnalyticsHubView, 
  WorkspaceHubView, 
  SettingsHubView 
} from './HubViews';
import { 
  PieChart, List, Wallet, Target, BarChart2, Layers, Settings, LogOut, Eye, EyeOff, ChevronLeft, ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';

type Profile = 'PJ' | 'PF';
type Page = 'dashboard' | 'transactions' | 'finance' | 'planning' | 'analytics' | 'workspace' | 'settings';

const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export const Dashboard: React.FC = () => {
  const { user, signOut } = useAuth();
  const { privacyMode, togglePrivacyMode, globalMonth, setGlobalMonth, globalYear, setGlobalYear } = useData();
  const [profile, setProfile] = useState<Profile>('PJ');
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');

  const navItems = [
    { id: 'dashboard', icon: PieChart, label: 'Dashboard' },
    { id: 'transactions', icon: List, label: 'Lançamentos' },
    { id: 'finance', icon: Wallet, label: 'Contas & Cartões' },
    { id: 'planning', icon: Target, label: 'Planejamento' },
    { id: 'analytics', icon: BarChart2, label: 'Inteligência' },
    { id: 'workspace', icon: Layers, label: 'Workspace' },
    { id: 'settings', icon: Settings, label: 'Configurações' },
  ];

  const handlePrevMonth = () => {
    if (globalMonth === 0) {
      setGlobalMonth(11);
      setGlobalYear(globalYear - 1);
    } else {
      setGlobalMonth(globalMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (globalMonth === 11) {
      setGlobalMonth(0);
      setGlobalYear(globalYear + 1);
    } else {
      setGlobalMonth(globalMonth + 1);
    }
  };

  const renderPageContent = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardView profile={profile} />;
      case 'transactions':
        return <TransactionsView profile={profile} />;
      case 'finance':
        return <FinanceHubView profile={profile} />;
      case 'planning':
        return <PlanningHubView profile={profile} />;
      case 'analytics':
        return <AnalyticsHubView profile={profile} />;
      case 'workspace':
        return <WorkspaceHubView profile={profile} />;
      case 'settings':
        return <SettingsHubView profile={profile} />;
      default:
        return (
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-8 text-center text-slate-400">
            <p>Conteúdo da página {currentPage} em desenvolvimento...</p>
          </div>
        );
    }
  };

  return (
    <div className={`flex h-screen bg-slate-900 text-slate-200 font-sans antialiased ${profile === 'PF' ? 'theme-pf' : 'theme-pj'}`}>
      {/* SIDEBAR */}
      <nav className="flex flex-col w-64 bg-slate-800 shadow-2xl h-full flex-shrink-0 border-r border-slate-700/50 z-20">
        <div className="p-6 text-center border-b border-slate-700/50 relative">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent mb-4 cursor-pointer">
            Financeiro Hub
          </h1>
          
          {/* PROFILE TOGGLE */}
          <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-700 mb-2">
            <button 
              onClick={() => { setProfile('PJ'); setCurrentPage('dashboard'); }} 
              className={`flex-1 py-2 text-xs font-bold rounded transition-all ${profile === 'PJ' ? 'text-white bg-blue-600 shadow' : 'text-slate-400 hover:text-white'}`}
            >
              Empresa (PJ)
            </button>
            <button 
              onClick={() => { setProfile('PF'); setCurrentPage('dashboard'); }} 
              className={`flex-1 py-2 text-xs font-bold rounded transition-all ${profile === 'PF' ? 'text-white bg-purple-600 shadow' : 'text-slate-400 hover:text-white'}`}
            >
              Pessoal (PF)
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4 custom-scrollbar">
          <ul className="flex flex-col px-3 space-y-1">
            {navItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <li key={index}>
                  <button
                    onClick={() => setCurrentPage(item.id as Page)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all ${
                      isActive 
                        ? (profile === 'PJ' ? 'bg-blue-600 text-white shadow-md' : 'bg-purple-600 text-white shadow-md')
                        : 'text-slate-400 hover:bg-slate-700/50 hover:text-slate-200'
                    }`}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
        
        <div className="p-4 border-t border-slate-700/50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 overflow-hidden">
              {user?.photoURL ? (
                <img src={user.photoURL} alt="User" className="w-8 h-8 rounded-full" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold">
                  {user?.displayName?.charAt(0) || 'U'}
                </div>
              )}
              <span className="text-xs text-slate-400 truncate">{user?.displayName || user?.email}</span>
            </div>
            <button onClick={signOut} className="text-slate-500 hover:text-red-400 transition-colors" title="Sair">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <main className="flex-1 h-full overflow-y-auto p-4 md:p-8 relative bg-slate-900 custom-scrollbar">
        <div className="max-w-7xl mx-auto pb-24">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <h2 className="text-3xl font-bold text-white tracking-tight capitalize">
              {navItems.find(i => i.id === currentPage)?.label || 'Dashboard'}
            </h2>
            
            {/* TOP BAR CONTROLS */}
            <div className="flex items-center gap-4 bg-slate-800 p-2 rounded-xl border border-slate-700">
              <div className="flex items-center gap-2 px-2">
                <button onClick={handlePrevMonth} className="text-slate-400 hover:text-white transition-colors">
                  <ChevronLeft size={20} />
                </button>
                <span className="text-sm font-bold text-white w-32 text-center">
                  {MONTHS[globalMonth]} {globalYear}
                </span>
                <button onClick={handleNextMonth} className="text-slate-400 hover:text-white transition-colors">
                  <ChevronRight size={20} />
                </button>
              </div>
              <div className="w-px h-6 bg-slate-700"></div>
              <button 
                onClick={togglePrivacyMode}
                className={`p-2 rounded-lg transition-colors ${privacyMode ? 'bg-blue-600/20 text-blue-400' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
                title={privacyMode ? "Mostrar Valores" : "Ocultar Valores"}
              >
                {privacyMode ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          
          <motion.div
            key={currentPage + profile}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {renderPageContent()}
          </motion.div>
        </div>
      </main>
    </div>
  );
};
