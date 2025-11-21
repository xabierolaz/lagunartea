
import React, { useEffect, useState } from 'react';
import { CalendarView } from './components/CalendarView';
import { ConsumptionView } from './components/ConsumptionView';
import { ReservationForm } from './components/ReservationForm';
import { Modal } from './components/Modal';
import { Logo } from './components/Logo';
import { StorageService } from './services/storage';
import { Consumption, Reservation, ResourceType, ViewState, Member } from './types';
import { MEMBERS as STATIC_MEMBERS } from './constants';

const App: React.FC = () => {
  // State
  const [view, setView] = useState<ViewState>('CALENDAR');
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [consumptions, setConsumptions] = useState<Consumption[]>([]);
  const [members, setMembers] = useState<Member[]>(STATIC_MEMBERS);
  
  // UI State
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Data Fetching
  const refreshData = async () => {
    const [res, cons, mems] = await Promise.all([
      StorageService.getReservations(),
      StorageService.getConsumptions(),
      StorageService.getMembers()
    ]);
    setReservations(res);
    setConsumptions(cons);
    if (mems && mems.length > 0) setMembers(mems);
  };

  useEffect(() => {
    refreshData();
    
    // Opcional: Polling simple para "tiempo real" rudimentario si no se usan suscripciones
    const interval = setInterval(refreshData, 30000); // Refrescar cada 30s
    return () => clearInterval(interval);
  }, []);

  // Handlers
  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
  };

  const handleSaveReservation = async (res: Reservation, consumption?: Consumption) => {
    const promises = [StorageService.addReservation(res)];
    if (consumption) {
      promises.push(StorageService.addConsumption(consumption));
    }
    
    await Promise.all(promises);
    
    setIsBookingModalOpen(false);
    refreshData();
    
    if (consumption) {
      alert('Reserva confirmada. Se ha añadido el cargo de los comensales a Gastos.');
    }
  };

  const handleDeleteReservation = async (id: string) => {
    if(confirm("¿Estás seguro de eliminar esta reserva?")) {
      await StorageService.removeReservation(id);
      refreshData();
    }
  };

  const handleAddConsumption = async (c: Consumption) => {
    await StorageService.addConsumption(c);
    refreshData();
  };

  const toggleAdmin = () => {
    if (isAdmin) {
      setIsAdmin(false);
    } else {
      const pass = prompt("Contraseña de administrador:");
      if (pass === "1218") setIsAdmin(true); 
      else alert("Incorrecto");
    }
  };

  // Helpers for sorting reservations logically (Meals first, then times)
  const getSortableTime = (t: string) => {
    const map: Record<string, string> = {
      'Almuerzo': '10:00',
      'Comida': '14:00',
      'Cena': '21:00'
    };
    return map[t] || t;
  };

  // Filter reservations for modal details
  const selectedDateReservations = reservations
    .filter(r => r.date === selectedDate)
    .sort((a, b) => getSortableTime(a.startTime).localeCompare(getSortableTime(b.startTime)));

  const getMemberName = (id: number) => {
    const m = members.find(x => x.id === id);
    return m ? `${m.firstName} ${m.lastName}` : 'Desconocido';
  };

  const getKitchenServicesText = (res: Reservation) => {
    if (!res.kitchenServices || res.kitchenServices.length === 0) return '';
    // Shorten names for display
    const shortNames = res.kitchenServices.map(s => s.replace('Barbacoa', 'BBQ').replace('Horno', 'H'));
    return ` + 🔥 ${shortNames.join(', ')}`;
  };

  return (
    <div className="min-h-screen pb-20 relative">
      {/* Background Logo */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden">
        <Logo className="w-[120vw] h-[120vw] opacity-[0.03] text-primary transform -translate-y-10" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto">
        {/* Header */}
        <header className="bg-white shadow-sm sticky top-0 z-20 px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold">L</div>
            <h1 className="font-bold text-xl text-gray-800 tracking-tight">LAGUNARTEA</h1>
          </div>
          <button 
            onClick={toggleAdmin}
            className={`text-xs px-2 py-1 rounded border ${isAdmin ? 'bg-red-50 border-red-200 text-red-600' : 'border-gray-200 text-gray-400'}`}
          >
            {isAdmin ? 'Admin ON' : 'Admin'}
          </button>
        </header>

        {/* Content */}
        <main className="p-4">
          {view === 'CALENDAR' && (
            <div className="animate-fade-in">
              <CalendarView reservations={reservations} onSelectDate={handleDateSelect} isAdmin={isAdmin} />
              <div className="mt-6 text-center text-sm text-gray-500">
                Selecciona un día para ver detalles o reservar.
              </div>
            </div>
          )}

          {view === 'CONSUMPTION' && (
            <div className="animate-fade-in">
              <ConsumptionView consumptions={consumptions} onAdd={handleAddConsumption} />
            </div>
          )}
        </main>

        {/* Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-3 flex justify-around z-30 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <button 
            onClick={() => setView('CALENDAR')}
            className={`flex flex-col items-center gap-1 transition-colors ${view === 'CALENDAR' ? 'text-primary' : 'text-gray-400'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-[10px] font-bold uppercase">Reservas</span>
          </button>
          <button 
            onClick={() => setView('CONSUMPTION')}
            className={`flex flex-col items-center gap-1 transition-colors ${view === 'CONSUMPTION' ? 'text-primary' : 'text-gray-400'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-[10px] font-bold uppercase">Gastos</span>
          </button>
        </nav>
      </div>

      {/* Day Details Modal */}
      <Modal 
        isOpen={!!selectedDate && !isBookingModalOpen} 
        onClose={() => setSelectedDate(null)}
        title={selectedDate ? new Date(selectedDate).toLocaleDateString('es-ES', { dateStyle: 'full' }) : ''}
      >
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-semibold text-gray-700">Reservas del día</h4>
            <button 
              onClick={() => setIsBookingModalOpen(true)}
              className="bg-primary text-white px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-opacity-90 shadow-sm"
            >
              + Nueva
            </button>
          </div>

          {selectedDateReservations.length === 0 ? (
            <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-lg border border-dashed border-gray-200">
              No hay reservas para este día.
            </div>
          ) : (
            <div className="space-y-2">
              {selectedDateReservations.map(r => {
                const member = members.find(x => x.id === r.memberId);
                const memberName = member ? `${member.firstName} ${member.lastName}` : 'Desconocido';
                
                return (
                  <div key={r.id} className="bg-gray-50 p-3 rounded-lg border border-gray-100 flex justify-between items-center">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900 text-sm">{r.startTime}</span>
                        <span className={`text-xs px-1.5 py-0.5 rounded border ${r.type === ResourceType.Comedor ? 'bg-green-100 text-green-700 border-green-200' : 'bg-blue-100 text-blue-700 border-blue-200'}`}>
                          {r.type === ResourceType.Comedor ? 'Comedor' : 'Frontón'}
                        </span>
                      </div>
                      <div className="text-sm text-gray-800 font-medium mt-1 flex items-center flex-wrap gap-x-2">
                        <span>{memberName}</span>
                        {member?.phone && (
                          <a href={`tel:${member.phone.replace(/\s/g, '')}`} className="text-gray-400 text-xs font-normal hover:text-primary transition-colors flex items-center gap-0.5">
                            <span>📞</span> {member.phone}
                          </a>
                        )}
                      </div>
                      {r.type === ResourceType.Comedor && (
                        <div className="text-xs text-gray-500 mt-0.5">
                          {r.space} · {r.diners} pers. {r.memberDiners ? `(${r.memberDiners} socios)` : ''}
                          {getKitchenServicesText(r)}
                        </div>
                      )}
                    </div>
                    {isAdmin && (
                      <button 
                        onClick={() => handleDeleteReservation(r.id)}
                        className="text-red-500 hover:text-red-700 text-xs font-semibold px-2 py-1 border border-red-200 rounded bg-white"
                      >
                        Eliminar
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Modal>

      {/* Booking Modal */}
      <Modal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        title="Nueva Reserva"
      >
        {selectedDate && (
          <ReservationForm 
            date={selectedDate} 
            onSave={handleSaveReservation}
            onCancel={() => setIsBookingModalOpen(false)}
          />
        )}
      </Modal>
    </div>
  );
};

export default App;
