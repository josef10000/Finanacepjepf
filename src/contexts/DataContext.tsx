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
    digitalTools: [],
    automations: [],
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
  privacyMode: boolean;
  togglePrivacyMode: () => void;
  globalMonth: number;
  setGlobalMonth: (month: number) => void;
  globalYear: number;
  setGlobalYear: (year: number) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [data, setData] = useState<DBState | null>(null);
  const [loading, setLoading] = useState(true);
  const [privacyMode, setPrivacyMode] = useState(false);
  const [globalMonth, setGlobalMonth] = useState(new Date().getMonth());
  const [globalYear, setGlobalYear] = useState(new Date().getFullYear());

  const togglePrivacyMode = () => setPrivacyMode(prev => !prev);

  useEffect(() => {
    let isMounted = true;

    if (!user) {
      setData(null);
      setLoading(false);
      return;
    }

    const userRef = ref(db, `users/${user.uid}`);
    
    // Safety timeout to ensure app loads even if Firebase DB is unresponsive
    const timeout = setTimeout(() => {
      if (isMounted && loading) {
        console.warn("Firebase DB timeout. Using local state.");
        const initialData: DBState = {
          PJ: createEmptyState('PJ'),
          PF: createEmptyState('PF')
        };
        setData(initialData);
        setLoading(false);
      }
    }, 5000);

    const unsubscribe = onValue(userRef, (snapshot) => {
      if (!isMounted) return;
      clearTimeout(timeout);
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
          digitalTools: state.digitalTools || [],
          automations: state.automations || [],
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
        set(userRef, initialData).catch(err => console.error("Failed to init DB:", err));
      }
      setLoading(false);
    }, (error) => {
      if (!isMounted) return;
      clearTimeout(timeout);
      console.error("Firebase DB Error:", error);
      // Fallback to local state so the app doesn't hang on permission denied
      const initialData: DBState = {
        PJ: createEmptyState('PJ'),
        PF: createEmptyState('PF')
      };
      setData(initialData);
      setLoading(false);
    });

    return () => {
      isMounted = false;
      clearTimeout(timeout);
      unsubscribe();
    };
  }, [user, loading]);

  const updateData = async (newData: DBState) => {
    if (!user) return;
    setData(newData); // Optimistic update
    try {
      await set(ref(db, `users/${user.uid}`), newData);
    } catch (error) {
      console.error("Failed to save data to Firebase:", error);
    }
  };

  return (
    <DataContext.Provider value={{ 
      data, 
      updateData, 
      loading,
      privacyMode,
      togglePrivacyMode,
      globalMonth,
      setGlobalMonth,
      globalYear,
      setGlobalYear
    }}>
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
