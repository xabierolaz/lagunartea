import React, { useState } from 'react';
import { Reservation, ResourceType } from '../types';

interface Props {
  reservations: Reservation[];
  onSelectDate: (date: string) => void;
}

export const CalendarView: React.FC<Props> = ({ reservations, onSelectDate }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Utilities
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => {
    const day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1; // Monday = 0
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  // Date Limits Logic
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize to midnight

  const maxBookableDate = new Date(today);
  maxBookableDate.setDate(today.getDate() + 30); // Max 30 days ahead

  const handlePrev = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNext = () => setCurrentDate(new Date(year, month + 1, 1));

  const getResForDay = (d: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    return {
      dateStr,
      items: reservations.filter(r => r.date === dateStr)
    };
  };

  const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50">
        <button onClick={handlePrev} className="p-2 hover:bg-gray-200 rounded-full text-gray-600">←</button>
        <h2 className="text-lg font-bold text-gray-800 capitalize">{months[month]} {year}</h2>
        <button onClick={handleNext} className="p-2 hover:bg-gray-200 rounded-full text-gray-600">→</button>
      </div>

      {/* Days Header */}
      <div className="grid grid-cols-7 text-center py-2 text-xs font-semibold text-gray-400 border-b border-gray-100">
        {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map(d => <div key={d}>{d}</div>)}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 auto-rows-fr bg-gray-100 gap-px">
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} className="bg-white min-h-[80px]" />
        ))}
        
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const d = i + 1;
          const { dateStr, items } = getResForDay(d);
          
          // Calculate constraints
          const cellDate = new Date(year, month, d);
          cellDate.setHours(0, 0, 0, 0); // Normalize

          const isToday = cellDate.getTime() === today.getTime();
          const isPast = cellDate < today;
          const isTooFar = cellDate > maxBookableDate;
          const isDisabled = isPast || isTooFar;

          // Count types
          const comedorCount = items.filter(r => r.type === ResourceType.Comedor).length;
          const frontonCount = items.filter(r => r.type === ResourceType.Fronton).length;

          return (
            <div 
              key={d} 
              onClick={() => !isDisabled && onSelectDate(dateStr)}
              className={`min-h-[80px] p-1 relative flex flex-col transition-colors
                ${isDisabled 
                  ? 'bg-gray-50 opacity-50 cursor-not-allowed' 
                  : 'bg-white cursor-pointer hover:bg-blue-50'
                }
              `}
            >
              <span className={`text-sm font-bold w-6 h-6 flex items-center justify-center rounded-full mb-1 ${isToday ? 'bg-primary text-white' : 'text-gray-700'}`}>
                {d}
              </span>
              
              <div className="flex flex-col gap-1 mt-auto">
                {comedorCount > 0 && (
                  <div className="text-[10px] bg-green-100 text-green-800 px-1 rounded border border-green-200 truncate">
                    🍽️ {comedorCount}
                  </div>
                )}
                {frontonCount > 0 && (
                  <div className="text-[10px] bg-blue-100 text-blue-800 px-1 rounded border border-blue-200 truncate">
                    ⚾ {frontonCount}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};