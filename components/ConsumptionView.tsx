import React, { useState, useMemo } from 'react';
import { Consumption, Item, Member } from '../types';

interface Props {
  consumptions: Consumption[];
  onAdd: (c: Consumption) => void;
  items: Item[];
  members?: Member[];
  onDelete?: (id: string) => void;
  isAdmin?: boolean;
}

export const ConsumptionView: React.FC<Props> = ({ consumptions, onAdd, items, members = [], onDelete, isAdmin = false }) => {
  const [memberId, setMemberId] = useState<number | ''>('');
  const [cart, setCart] = useState<Record<string, number>>({});
  const generateId = () => (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2));
  
  const handleIncrement = (id: string) => {
    setCart(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  const handleDecrement = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCart(prev => {
      const next = { ...prev };
      const current = next[id] || 0;
      if (current > 0) {
        next[id] = current - 1;
      }
      if (next[id] <= 0) {
        delete next[id];
      }
      return next;
    });
  };

  const totalAmount = Object.entries(cart).reduce((sum, [id, count]) => {
    const item = items.find(b => b.id === id);
    return sum + (item?.price || 0) * (count as number);
  }, 0);

  const handleSubmit = () => {
    if (!memberId) return alert('Por favor, selecciona un socio.');
    if (totalAmount === 0) return alert('No has seleccionado ninguna bebida ni cuota.');

    // Generate Description
    const descriptionItems = Object.entries(cart).map(([id, count]) => {
      const item = items.find(b => b.id === id);
      return `${count}x ${item?.name}`;
    });
    
    const description = descriptionItems.join(', ');

    onAdd({
      id: generateId(),
      memberId: Number(memberId),
      amount: totalAmount,
      description,
      date: new Date().toISOString(),
      createdAt: Date.now()
    });

    // Reset
    setCart({});
    // We keep the member selected so they can see their new entry immediately
    window.scrollTo({ top: 0, behavior: 'smooth' });
    alert('Gasto guardado correctamente');
  };

  // History & Filter Logic (Grouped)
  const { groupedHistory, memberTotal } = useMemo(() => {
    // Sort by newest first
    const sorted = [...consumptions].sort((a, b) => b.createdAt - a.createdAt);
    
    let filtered = sorted;
    let total = 0;

    if (memberId) {
      filtered = sorted.filter(c => c.memberId === Number(memberId));
      total = filtered.reduce((sum, c) => sum + c.amount, 0);
    } else {
      total = sorted.reduce((sum, c) => sum + c.amount, 0); 
    }

    // Grouping Logic: Key = "YYYY-MM-DD_MemberID"
    const groups: Record<string, {
      dateKey: string;
      dateObj: Date;
      memberId: number;
      totalAmount: number;
      items: Consumption[];
    }> = {};

    filtered.forEach(c => {
      const dateObj = new Date(c.createdAt);
      const dateKey = dateObj.toLocaleDateString();
      const groupKey = `${dateKey}_${c.memberId}`;

      if (!groups[groupKey]) {
        groups[groupKey] = {
          dateKey,
          dateObj,
          memberId: c.memberId,
          totalAmount: 0,
          items: []
        };
      }
      
      groups[groupKey].items.push(c);
      groups[groupKey].totalAmount += c.amount;
    });

    // Convert back to array and sort by date (newest group first)
    // We use the timestamp of the *most recent item* in the group for sorting
    const groupedArray = Object.values(groups).sort((a, b) => {
        const timeA = Math.max(...a.items.map(i => i.createdAt));
        const timeB = Math.max(...b.items.map(i => i.createdAt));
        return timeB - timeA;
    });

    return { groupedHistory: groupedArray, memberTotal: total };
  }, [consumptions, memberId]);

  // Separate grid items: Fees (Cuotas) vs Drinks
  const feeItems = items.filter(b => b.category === 'servicio' && !['luz_fronton'].includes(b.id));
  const excludeIds = ['comensal_socio', 'comensal_no_socio', 'luz_fronton'];
  const drinkItems = items.filter(b => b.category === 'bebida' && !excludeIds.includes(b.id));

  return (
    <div className="space-y-6 pb-24">
      {/* Member Selection */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 sticky top-16 z-10">
        <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-wide">Socio Consumidor</label>
        <select
          className="w-full border border-gray-300 rounded-lg px-3 py-3 bg-gray-50 focus:ring-2 focus:ring-primary focus:bg-white outline-none transition-colors text-lg"
          value={memberId}
          onChange={e => setMemberId(Number(e.target.value))}
        >
          <option value="" disabled>Seleccionar socio...</option>
          {members.sort((a,b) => a.lastName.localeCompare(b.lastName)).map(m => (
            <option key={m.id} value={m.id}>{m.lastName}, {m.firstName}</option>
          ))}
        </select>
      </div>

      {/* Fees & Services Grid */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Servicios y Otros</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {feeItems.map(item => renderCard(item, cart, handleIncrement, handleDecrement))}
        </div>
      </div>

      {/* Drinks Grid */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Bebida</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {drinkItems.map(item => renderCard(item, cart, handleIncrement, handleDecrement))}
        </div>
      </div>

      {/* Summary Footer */}
      {Object.keys(cart).length > 0 && (
        <div className="fixed bottom-16 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-20 animate-slide-up">
          <div className="max-w-3xl mx-auto flex flex-col gap-3">
            <div className="flex justify-between items-end">
              <div>
                <span className="text-xs text-gray-500 uppercase font-bold">Total a pagar</span>
                <div className="text-3xl font-black text-gray-900">{totalAmount.toFixed(2)}€</div>
              </div>
              <div className="text-right text-sm text-gray-500 max-w-[60%] truncate">
                {Object.entries(cart).map(([id, c]) => `${c} ${items.find(b=>b.id===id)?.name}`).join(', ')}
              </div>
            </div>
            <button 
              onClick={handleSubmit}
              className="w-full btn-primary py-3.5 rounded-xl font-bold text-lg shadow-md active:transform active:translate-y-0.5 transition-all bg-primary text-white hover:bg-opacity-90"
            >
              Confirmar Gasto
            </button>
          </div>
        </div>
      )}

      {/* History List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 mt-8 overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">
            {memberId ? 'Historial de Socio' : 'Historial Completo de Consumos'}
          </h3>
          {memberId !== '' && (
            <div className="text-right">
              <span className="text-[10px] text-gray-500 uppercase block">Total Acumulado</span>
              <span className="font-black text-lg text-primary">{memberTotal.toFixed(2)}€</span>
            </div>
          )}
        </div>
        
        <div className="divide-y divide-gray-100">
          {groupedHistory.length === 0 ? (
            <p className="text-gray-400 text-sm py-8 text-center italic">No hay registros.</p>
          ) : (
            groupedHistory.map(group => {
              const m = members.find(x => x.id === group.memberId);
              
              return (
                <div key={`${group.dateKey}-${group.memberId}`} className="p-4 hover:bg-gray-50 transition-colors border-l-4 border-transparent hover:border-primary/20">
                  {/* Header: Date + Member + Total */}
                  <div className="flex justify-between items-center mb-3">
                    <div>
                      {!memberId && (
                        <p className="font-bold text-sm text-gray-900 leading-tight">
                          {m?.lastName}, {m?.firstName}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 font-medium capitalize">
                        {group.dateObj.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                    </div>
                    <div className="text-right bg-gray-50 px-2 py-1 rounded">
                       <span className="block text-[10px] text-gray-400 uppercase tracking-wider">Total Día</span>
                       <span className="font-black text-lg text-gray-900">{group.totalAmount.toFixed(2)}€</span>
                    </div>
                  </div>

                  {/* List of Items */}
                  <div className="space-y-2 pl-2">
                    {group.items.map(c => (
                      <div key={c.id} className="flex justify-between items-start text-sm border-l-2 border-gray-200 pl-3 py-0.5">
                        <div className="text-gray-600 flex-1 pr-4">
                          {c.description ? (
                             <span className="text-gray-800">{c.description}</span>
                          ) : (
                             <span className="italic text-gray-400">Sin detalles</span>
                          )}
                          <div className="text-[10px] text-gray-400 mt-0.5">
                            {new Date(c.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                           <span className="font-semibold text-gray-700 whitespace-nowrap text-xs">
                             {c.amount.toFixed(2)}€
                           </span>
                           {isAdmin && onDelete && (
                            <button
                              onClick={() => onDelete(c.id)}
                              className="text-[10px] text-red-400 hover:text-red-600 underline mt-1"
                            >
                              Eliminar
                            </button>
                           )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

// Helper Component for Grid Cards
const renderCard = (
  item: { id: string; name: string; icon?: string | null; price: number },
  cart: Record<string, number>,
  onInc: (id: string) => void,
  onDec: (id: string, e: React.MouseEvent) => void
) => {
  const count = cart[item.id] || 0;
  return (
    <div 
      key={item.id}
      onClick={() => onInc(item.id)}
      className={`relative p-3 rounded-xl border-2 transition-all cursor-pointer select-none flex flex-col items-center justify-center gap-1.5 shadow-sm hover:shadow-md active:scale-95 ${
        count > 0 ? 'border-primary bg-primary/5' : 'border-gray-100 bg-white hover:border-primary/30'
      }`}
    >
      <div className="text-3xl mb-1">{item.icon}</div>
      <div className="text-center">
        <div className="font-bold text-gray-800 text-xs leading-tight line-clamp-2 h-8 flex items-center justify-center">{item.name}</div>
        <div className="text-xs text-gray-500 font-medium mt-1">{item.price.toFixed(2)}€</div>
      </div>

      {count > 0 && (
        <div className="absolute -top-2 -right-2 bg-primary text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full shadow-lg z-10 animate-bounce-in">
          {count}
        </div>
      )}
      
      {count > 0 && (
        <div className="flex items-center gap-3 mt-1 w-full justify-center" onClick={e => e.stopPropagation()}>
          <button 
            onClick={(e) => onDec(item.id, e)}
            className="w-7 h-7 flex items-center justify-center bg-white border border-gray-300 text-gray-700 rounded-full hover:bg-gray-100 font-bold text-md"
          >
            −
          </button>
          <button 
            onClick={() => onInc(item.id)}
            className="w-7 h-7 flex items-center justify-center bg-primary text-white rounded-full hover:bg-primary/90 font-bold text-md"
          >
            +
          </button>
        </div>
      )}
    </div>
  );
};