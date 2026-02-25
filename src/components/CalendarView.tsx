import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { formatCurrency } from '../utils/format';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

export const CalendarView: React.FC<{ profile: 'PJ' | 'PF' }> = ({ profile }) => {
  const { data } = useData();
  const state = data?.[profile];
  const [currentDate, setCurrentDate] = useState(new Date());

  if (!state) return null;

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const transactions = state.transactions.filter(tx => {
    const txDate = new Date(tx.date);
    return txDate.getMonth() === currentDate.getMonth() && txDate.getFullYear() === currentDate.getFullYear();
  });

  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));

  const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-slate-800 p-4 rounded-xl border border-slate-700">
        <button onClick={prevMonth} className="p-2 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors">
          <ChevronLeft size={24} />
        </button>
        <div className="flex items-center gap-3">
          <CalendarIcon className="text-blue-500" size={24} />
          <h3 className="text-xl font-bold text-white">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h3>
        </div>
        <button onClick={nextMonth} className="p-2 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors">
          <ChevronRight size={24} />
        </button>
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <div className="grid grid-cols-7 border-b border-slate-700">
          {weekDays.map(day => (
            <div key={day} className="p-3 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 auto-rows-fr">
          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div key={`empty-${i}`} className="min-h-[100px] p-2 border-b border-r border-slate-700/50 bg-slate-800/50"></div>
          ))}
          
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dayTxs = transactions.filter(tx => {
              const txDate = new Date(tx.date);
              // Note: using UTC day to avoid timezone shifts if dates are stored as YYYY-MM-DD
              return parseInt(tx.date.split('-')[2]) === day;
            });

            const isToday = new Date().getDate() === day && new Date().getMonth() === currentDate.getMonth() && new Date().getFullYear() === currentDate.getFullYear();

            return (
              <div key={day} className={`min-h-[100px] p-2 border-b border-r border-slate-700/50 transition-colors hover:bg-slate-700/30 ${isToday ? 'bg-blue-900/20' : ''}`}>
                <div className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full mb-2 ${isToday ? 'bg-blue-500 text-white' : 'text-slate-400'}`}>
                  {day}
                </div>
                <div className="space-y-1">
                  {dayTxs.map(tx => (
                    <div key={tx.id} className={`text-xs px-2 py-1 rounded truncate ${tx.type === 'receita' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`} title={`${tx.description}: ${formatCurrency(tx.amount)}`}>
                      {tx.type === 'receita' ? '+' : '-'}{formatCurrency(tx.amount)}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
