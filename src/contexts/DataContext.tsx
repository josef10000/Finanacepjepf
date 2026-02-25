import React, { createContext, useContext, useEffect, useState } from 'react';
import { ref, onValue, set } from 'firebase/database';
import { db } from '../lib/firebase';
import { useAuth } from './AuthContext';
import { DBState, AppState, Category } from '../types';

const SYSTEM_TRANSFER_ID = 'sys-transfer-cat';
const PJ_CATS: Category[] = [
  { id: 'c1', name: 'Vendas', type: 'receita', dre: 'receita_bruta' }, 
  { id: 'c2', name: 'Salários', type: 'despesa', dre: 'despesas_op' }, 
  { id: 'c3', name: 'Impostos', type: 'despesa', dre: 'impostos' }, 
  { id: SYSTEM_TRANSFER_ID, name: 'Transferência', type: 'transfer', dre: 'none' }
];
const PF_CATS: Category[] = [
  { id: 'pf1', name: 'Salário/Pró-labore', type: 'receita', sub: 'renda' }, 
  { id: 'pf2', name: 'Aluguel/Moradia', type: 'despesa', sub: 'essencial' }, 
  { id: 'pf3', name: 'Mercado', type: 'despesa', sub: 'essencial' }, 
  { id: 'pf4', name: 'Lazer', type: 'despesa', sub: 'estilo' }, 
  { id: 'pf5', name: 'Investimentos', type: 'despesa', sub: 'objetivos' }, 
  { id: SYSTEM_TRANSFER_ID, name: 'Transferência', type: 'transfer', sub: 'none' }
];

function createEmptyState(type: 'PJ' | 'PF'): AppState { 
  return { 
    transactions: [], 
    accounts: [], 
    categories: type === 'PJ' ? [...PJ_CATS] : [...PF_CATS], 
    goals: [], 
    budgets: [], 
    recurring: [], 
    tags: [], 
    rules: [], 
    stack: [], 
    checklist: [], 
    launchEvents: [], 
    capTable: [], 
    taxRate: 6.0, 
    warRate: 10.0, 
    checklistMonth: '' 
  }; 
}

interface DataContextType {
  data: DBState | null;
  updateData: (newData: DBState) => Promise<void>;
  loading: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [data, setData] = useState<DBState | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setData(null);
      setLoading(false);
      return;
    }

    const userRef = ref(db, `users/${user.uid}`);
    const unsubscribe = onValue(userRef, (snapshot) => {
      const val = snapshot.val();
      if (val) {
        const sanitizeState = (state: any, type: 'PJ' | 'PF'): AppState => ({
          ...createEmptyState(type),
          ...state,
          transactions: state.transactions || [],
          accounts: state.accounts || [],
          categories: state.categories || (type === 'PJ' ? PJ_CATS : PF_CATS),
          goals: state.goals || [],
          budgets: state.budgets || [],
          recurring: state.recurring || [],
          tags: state.tags || [],
          rules: state.rules || [],
          stack: state.stack || [],
          checklist: state.checklist || [],
          launchEvents: state.launchEvents || [],
          capTable: state.capTable || [],
        });

        setData({
          PJ: sanitizeState(val.PJ || {}, 'PJ'),
          PF: sanitizeState(val.PF || {}, 'PF')
        });
      } else {
        const initialData: DBState = {
          PJ: createEmptyState('PJ'),
          PF: createEmptyState('PF')
        };
        setData(initialData);
        set(userRef, initialData);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const updateData = async (newData: DBState) => {
    if (!user) return;
    setData(newData); // Optimistic update
    await set(ref(db, `users/${user.uid}`), newData);
  };

  return (
    <DataContext.Provider value={{ data, updateData, loading }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
