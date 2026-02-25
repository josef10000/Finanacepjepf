import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { DashboardView } from './DashboardView';
import { AccountsView } from './AccountsView';
import { CategoriesView } from './CategoriesView';
import { TransactionsView } from './TransactionsView';
import { CardsView } from './CardsView';
import { GoalsView } from './GoalsView';
import { CalendarView } from './CalendarView';
import { RecurringView } from './RecurringView';
import { ReportsView } from './ReportsView';
import { BudgetView } from './BudgetView';
import { BalanceView } from './BalanceView';
import { StackView } from './StackView';
import { DREView } from './DREView';
import { DistributionView } from './DistributionView';
import { ChecklistView } from './ChecklistView';
import { DigitalToolsView } from './DigitalToolsView';
import { AutomationView } from './AutomationView';
import { ProjectionsView } from './ProjectionsView';
import { 
  PieChart, List, CreditCard, Calendar, TrendingUp, CheckSquare, 
  Layers, Rocket, Calculator, Share2, Flag, Archive, Book, 
  BarChart2, Tags, Zap, Wallet, Repeat, LogOut
} from 'lucide-react';

type Profile = 'PJ' | 'PF';
type Page = 'dashboard' | 'transactions' | 'cards' | 'calendar' | 'projections' | 'checklist' | 'stack' | 'digital-tools' | 'dre' | 'distribution' | 'goals' | 'budget' | 'balance' | 'reports' | 'categories' | 'automation' | 'accounts' | 'recurring';

export const Dashboard: React.FC = () => {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<Profile>('PJ');
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');

  const navItems = [
    { id: 'dashboard', icon: PieChart, label: 'Dashboard', common: true },
    { id: 'transactions', icon: List, label: 'Lançamentos', common: true },
    { id: 'cards', icon: CreditCard, label: 'Cartões', common: true },
    { id: 'calendar', icon: Calendar, label: 'Calendário', common: true },
    
    // PJ Specific
    { id: 'projections', icon: TrendingUp, label: 'Fluxo de Caixa', pjOnly: true },
    { id: 'checklist', icon: CheckSquare, label: 'Checklist', pjOnly: true },
    { id: 'stack', icon: Layers, label: 'Stack', pjOnly: true },
    { id: 'digital-tools', icon: Rocket, label: 'Ferramentas', pjOnly: true },
    { id: 'dre', icon: Calculator, label: 'DRE', pjOnly: true },
    { id: 'distribution', icon: Share2, label: 'Distribuição', pjOnly: true },
    
    // PF Specific
    { id: 'projections', icon: TrendingUp, label: 'FIRE', pfOnly: true },
    { id: 'stack', icon: Layers, label: 'Assinaturas', pfOnly: true },
    
    // Strategy
    { id: 'goals', icon: Flag, label: profile === 'PJ' ? 'Potes' : 'Sonhos', common: true },
    { id: 'budget', icon: Archive, label: 'Orçamento', common: true },
    { id: 'balance', icon: Book, label: profile === 'PJ' ? 'Balanço' : 'Patrimônio', common: true },
    { id: 'reports', icon: BarChart2, label: 'Relatórios', common: true },
    
    // Config
    { id: 'categories', icon: Tags, label: 'Categorias', common: true },
    { id: 'automation', icon: Zap, label: 'Automação', common: true },
    { id: 'accounts', icon: Wallet, label: 'Contas', common: true },
    { id: 'recurring', icon: Repeat, label: 'Recorrências', common: true },
  ];

  const visibleNavItems = navItems.filter(item => 
    item.common || (profile === 'PJ' && item.pjOnly) || (profile === 'PF' && item.pfOnly)
  );

  const renderPageContent = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardView profile={profile} />;
      case 'accounts':
        return <AccountsView profile={profile} />;
      case 'categories':
        return <CategoriesView profile={profile} />;
      case 'transactions':
        return <TransactionsView profile={profile} />;
      case 'cards':
        return <CardsView profile={profile} />;
      case 'goals':
        return <GoalsView profile={profile} />;
      case 'calendar':
        return <CalendarView profile={profile} />;
      case 'recurring':
        return <RecurringView profile={profile} />;
      case 'reports':
        return <ReportsView profile={profile} />;
      case 'budget':
        return <BudgetView profile={profile} />;
      case 'balance':
        return <BalanceView profile={profile} />;
      case 'stack':
        return <StackView profile={profile} />;
      case 'dre':
        return <DREView profile={profile} />;
      case 'distribution':
        return <DistributionView profile={profile} />;
      case 'checklist':
        return <ChecklistView profile={profile} />;
      case 'digital-tools':
        return <DigitalToolsView profile={profile} />;
      case 'automation':
        return <AutomationView profile={profile} />;
      case 'projections':
        return <ProjectionsView profile={profile} />;
      default:
        return (
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-8 text-center text-slate-400">
            <p>Conteúdo da página {currentPage} em desenvolvimento...</p>
            <p className="mt-2 text-sm">Os dados serão sincronizados com Firebase Realtime Database.</p>
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
            {visibleNavItems.map((item, index) => {
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
      <main className="flex-1 h-full overflow-y-auto p-4 md:p-8 relative bg-slate-900">
        <div className="max-w-7xl mx-auto pb-24">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <h2 className="text-3xl font-bold text-white tracking-tight capitalize">
              {visibleNavItems.find(i => i.id === currentPage)?.label || 'Dashboard'}
            </h2>
          </div>
          
          {renderPageContent()}
        </div>
      </main>
    </div>
  );
};
