import React, { useState } from 'react';
import { AccountsView } from './AccountsView';
import { CardsView } from './CardsView';
import { RecurringView } from './RecurringView';
import { BudgetView } from './BudgetView';
import { GoalsView } from './GoalsView';
import { ReportsView } from './ReportsView';
import { DREView } from './DREView';
import { BalanceView } from './BalanceView';
import { ProjectionsView } from './ProjectionsView';
import { CalendarView } from './CalendarView';
import { ChecklistView } from './ChecklistView';
import { StackView } from './StackView';
import { CategoriesView } from './CategoriesView';
import { AutomationView } from './AutomationView';
import { DistributionView } from './DistributionView';
import { DigitalToolsView } from './DigitalToolsView';

const TabButton = ({ active, onClick, children }: any) => (
  <button 
    onClick={onClick} 
    className={`px-4 py-2 font-medium text-sm rounded-t-lg transition-colors ${active ? 'bg-slate-800 text-blue-400 border-t border-l border-r border-slate-700' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}
  >
    {children}
  </button>
);

const TabContainer = ({ children }: any) => (
  <div className="flex gap-1 border-b border-slate-700 mb-6 px-2 pt-2 bg-slate-900/50 rounded-t-xl overflow-x-auto custom-scrollbar">
    {children}
  </div>
);

export const FinanceHubView: React.FC<{ profile: 'PJ' | 'PF' }> = ({ profile }) => {
  const [tab, setTab] = useState('accounts');
  return (
    <div>
      <TabContainer>
        <TabButton active={tab === 'accounts'} onClick={() => setTab('accounts')}>Contas Bancárias</TabButton>
        <TabButton active={tab === 'cards'} onClick={() => setTab('cards')}>Cartões de Crédito</TabButton>
        <TabButton active={tab === 'recurring'} onClick={() => setTab('recurring')}>Recorrências</TabButton>
      </TabContainer>
      {tab === 'accounts' && <AccountsView profile={profile} />}
      {tab === 'cards' && <CardsView profile={profile} />}
      {tab === 'recurring' && <RecurringView profile={profile} />}
    </div>
  );
};

export const PlanningHubView: React.FC<{ profile: 'PJ' | 'PF' }> = ({ profile }) => {
  const [tab, setTab] = useState('budget');
  return (
    <div>
      <TabContainer>
        <TabButton active={tab === 'budget'} onClick={() => setTab('budget')}>Orçamento</TabButton>
        <TabButton active={tab === 'goals'} onClick={() => setTab('goals')}>{profile === 'PJ' ? 'Potes Financeiros' : 'Sonhos & Metas'}</TabButton>
      </TabContainer>
      {tab === 'budget' && <BudgetView profile={profile} />}
      {tab === 'goals' && <GoalsView profile={profile} />}
    </div>
  );
};

export const AnalyticsHubView: React.FC<{ profile: 'PJ' | 'PF' }> = ({ profile }) => {
  const [tab, setTab] = useState('reports');
  return (
    <div>
      <TabContainer>
        <TabButton active={tab === 'reports'} onClick={() => setTab('reports')}>Visão Geral</TabButton>
        {profile === 'PJ' && <TabButton active={tab === 'dre'} onClick={() => setTab('dre')}>DRE Gerencial</TabButton>}
        <TabButton active={tab === 'balance'} onClick={() => setTab('balance')}>Balanço Patrimonial</TabButton>
        <TabButton active={tab === 'projections'} onClick={() => setTab('projections')}>Projeções</TabButton>
      </TabContainer>
      {tab === 'reports' && <ReportsView profile={profile} />}
      {tab === 'dre' && profile === 'PJ' && <DREView profile={profile} />}
      {tab === 'balance' && <BalanceView profile={profile} />}
      {tab === 'projections' && <ProjectionsView profile={profile} />}
    </div>
  );
};

export const WorkspaceHubView: React.FC<{ profile: 'PJ' | 'PF' }> = ({ profile }) => {
  const [tab, setTab] = useState('calendar');
  return (
    <div>
      <TabContainer>
        <TabButton active={tab === 'calendar'} onClick={() => setTab('calendar')}>Calendário</TabButton>
        {profile === 'PJ' && <TabButton active={tab === 'checklist'} onClick={() => setTab('checklist')}>Checklist Mensal</TabButton>}
        <TabButton active={tab === 'stack'} onClick={() => setTab('stack')}>{profile === 'PJ' ? 'Stack & Assinaturas' : 'Assinaturas'}</TabButton>
        {profile === 'PJ' && <TabButton active={tab === 'digital-tools'} onClick={() => setTab('digital-tools')}>Ferramentas Digitais</TabButton>}
      </TabContainer>
      {tab === 'calendar' && <CalendarView profile={profile} />}
      {tab === 'checklist' && profile === 'PJ' && <ChecklistView profile={profile} />}
      {tab === 'stack' && <StackView profile={profile} />}
      {tab === 'digital-tools' && profile === 'PJ' && <DigitalToolsView profile={profile} />}
    </div>
  );
};

export const SettingsHubView: React.FC<{ profile: 'PJ' | 'PF' }> = ({ profile }) => {
  const [tab, setTab] = useState('categories');
  return (
    <div>
      <TabContainer>
        <TabButton active={tab === 'categories'} onClick={() => setTab('categories')}>Categorias</TabButton>
        {profile === 'PJ' && <TabButton active={tab === 'distribution'} onClick={() => setTab('distribution')}>Distribuição de Lucros</TabButton>}
        <TabButton active={tab === 'automation'} onClick={() => setTab('automation')}>Automações</TabButton>
      </TabContainer>
      {tab === 'categories' && <CategoriesView profile={profile} />}
      {tab === 'distribution' && profile === 'PJ' && <DistributionView profile={profile} />}
      {tab === 'automation' && <AutomationView profile={profile} />}
    </div>
  );
};
