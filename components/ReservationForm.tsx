
import React, { useState, useEffect } from 'react';
import { ComedorSpace, KitchenService, Reservation, ResourceType, Consumption } from '../types';
import { MEMBERS, BEVERAGES } from '../constants';

interface Props {
  date: string; // YYYY-MM-DD
  onSave: (res: Reservation, consumption?: Consumption) => void;
  onCancel: () => void;
}

const MEAL_TYPES = ['Almuerzo', 'Comida', 'Cena'];

export const ReservationForm: React.FC<Props> = ({ date, onSave, onCancel }) => {
  const [type, setType] = useState<ResourceType>(ResourceType.Comedor);
  const [memberId, setMemberId] = useState<number | ''>('');
  // Para Comedor usamos el nombre del turno, para Frontón la hora
  const [time, setTime] = useState('Comida'); 
  
  // Diners logic
  const [diners, setDiners] = useState<number>(4);
  const [memberDiners, setMemberDiners] = useState<number>(1);
  const [lightIncluded, setLightIncluded] = useState(false);
  
  const [spaces, setSpaces] = useState<ComedorSpace[]>([]);
  const [selectedServices, setSelectedServices] = useState<KitchenService[]>([]);

  // Validar que los comensales socios no superen el total
  useEffect(() => {
    if (memberDiners > diners) {
      setMemberDiners(diners);
    }
  }, [diners, memberDiners]);

  const calculateCost = () => {
    let total = 0;

    // Coste Comedor
    if (type === ResourceType.Comedor) {
      const itemSocio = BEVERAGES.find(b => b.id === 'comensal_socio');
      const itemNoSocio = BEVERAGES.find(b => b.id === 'comensal_no_socio');
      
      const priceSocio = itemSocio?.price || 0;
      const priceNoSocio = itemNoSocio?.price || 0;
      
      const nonMembers = Math.max(0, diners - memberDiners);
      total += (memberDiners * priceSocio) + (nonMembers * priceNoSocio);
    }

    // Coste Luz Frontón
    if (type === ResourceType.Fronton && lightIncluded) {
      const itemLuz = BEVERAGES.find(b => b.id === 'luz_fronton');
      total += itemLuz?.price || 0;
    }
    
    return total;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberId) return alert('Selecciona un socio');
    if (type === ResourceType.Comedor && spaces.length === 0) return alert('Selecciona al menos un espacio');
    if (type === ResourceType.Comedor && memberDiners < 1) return alert('Debe haber al menos un socio.');

    const newRes: Reservation = {
      id: Math.random().toString(36).slice(2),
      memberId: Number(memberId),
      date,
      startTime: time,
      type,
      diners: type === ResourceType.Comedor ? diners : undefined,
      memberDiners: type === ResourceType.Comedor ? memberDiners : undefined,
      spaces: type === ResourceType.Comedor ? spaces : undefined,
      kitchenServices: type === ResourceType.Comedor ? selectedServices : undefined,
      lightIncluded: type === ResourceType.Fronton ? lightIncluded : undefined,
      createdAt: Date.now()
    };

    // Crear consumo asociado
    let consumption: Consumption | undefined;
    const cost = calculateCost();
    
    if (cost > 0) {
      let desc = '';
      if (type === ResourceType.Comedor) {
        const nonMembers = Math.max(0, diners - memberDiners);
        desc = `Reserva Comedor: ${memberDiners} Socio(s), ${nonMembers} No Socio(s)`;
      } else if (type === ResourceType.Fronton && lightIncluded) {
        desc = `Reserva Frontón: Luz`;
      }

      consumption = {
        id: Math.random().toString(36).slice(2),
        memberId: Number(memberId),
        date: new Date().toISOString(),
        amount: cost,
        description: desc,
        createdAt: Date.now()
      };
    }

    onSave(newRes, consumption);
  };

  const handleTypeChange = (newType: ResourceType) => {
    setType(newType);
    if (newType === ResourceType.Comedor) {
      setTime('Comida');
    } else {
      setTime('18:00');
    }
  };

  const toggleService = (service: KitchenService) => {
    setSelectedServices(prev => 
      prev.includes(service) 
        ? prev.filter(s => s !== service) 
        : [...prev, service]
    );
  };

  const toggleSpace = (space: ComedorSpace) => {
    setSpaces(prev =>
      prev.includes(space)
        ? prev.filter(s => s !== space)
        : [...prev, space]
    );
  };

  const cost = calculateCost();

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Resource Type Switch */}
      <div className="grid grid-cols-2 gap-2 bg-gray-100 p-1 rounded-lg">
        <button
          type="button"
          onClick={() => handleTypeChange(ResourceType.Comedor)}
          className={`py-2 text-sm font-bold rounded-md transition-all ${
            type === ResourceType.Comedor 
              ? 'bg-white text-primary shadow-sm' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          🍽️ Comedor
        </button>
        <button
          type="button"
          onClick={() => handleTypeChange(ResourceType.Fronton)}
          className={`py-2 text-sm font-bold rounded-md transition-all ${
            type === ResourceType.Fronton
              ? 'bg-white text-primary shadow-sm' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          ⚾ Frontón
        </button>
      </div>

      {/* Member Select */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Socio Titular</label>
        <select
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-white"
          value={memberId}
          onChange={e => setMemberId(Number(e.target.value))}
          required
        >
          <option value="" disabled>Seleccionar socio...</option>
          {MEMBERS.sort((a,b) => a.lastName.localeCompare(b.lastName)).map(m => (
            <option key={m.id} value={m.id}>
              {m.lastName}, {m.firstName}
            </option>
          ))}
        </select>
      </div>

      {/* Time Selection Logic */}
      {type === ResourceType.Comedor ? (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Turno</label>
          <div className="grid grid-cols-3 gap-2">
            {MEAL_TYPES.map(meal => (
              <button
                key={meal}
                type="button"
                onClick={() => setTime(meal)}
                className={`py-2 px-3 text-sm font-semibold rounded-lg border transition-colors ${
                  time === meal
                    ? 'bg-primary text-white border-primary'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                }`}
              >
                {meal}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hora de inicio</label>
            <input 
              type="time" 
              value={time} 
              onChange={e => setTime(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-primary"
              required 
            />
          </div>
          
          {/* Fronton Light Option */}
          <div 
            onClick={() => setLightIncluded(!lightIncluded)}
            className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
              lightIncluded ? 'bg-yellow-50 border-yellow-300' : 'bg-white border-gray-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-xl">💡</span>
              <span className={`text-sm font-medium ${lightIncluded ? 'text-yellow-800' : 'text-gray-600'}`}>
                Necesita Luz (+6€)
              </span>
            </div>
            <div className={`w-5 h-5 rounded border flex items-center justify-center ${lightIncluded ? 'bg-yellow-400 border-yellow-500' : 'bg-white border-gray-300'}`}>
              {lightIncluded && <span className="text-white text-xs">✓</span>}
            </div>
          </div>
        </div>
      )}

      {/* Comedor Specifics */}
      {type === ResourceType.Comedor && (
        <div className="space-y-5 p-4 bg-primary/5 rounded-lg border border-primary/10">
          
          {/* Espacio */}
          <div>
            <label className="block text-sm font-medium text-primary mb-2">Espacio</label>
            <div className="grid grid-cols-3 gap-2">
              {Object.values(ComedorSpace).map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleSpace(s)}
                  className={`px-2 py-2 text-xs font-semibold rounded border transition-colors flex items-center justify-center gap-1 ${
                    spaces.includes(s) 
                      ? 'bg-primary text-white border-primary shadow-sm' 
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {spaces.includes(s) && <span>✓</span>}
                  <span className="whitespace-nowrap">{s}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Comensales Calculator */}
          <div className="bg-white p-3 rounded border border-gray-200 shadow-sm">
            <label className="block text-sm font-bold text-gray-800 mb-3 border-b border-gray-100 pb-1">Comensales</label>
            
            {/* Total Slider */}
            <div className="mb-4">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-600 font-medium">Total Personas</span>
                <span className="text-primary font-bold text-lg">{diners}</span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="50" 
                step="1" 
                value={diners} 
                onChange={e => setDiners(Number(e.target.value))}
                className="w-full accent-primary h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Breakdown */}
            <div className="grid grid-cols-2 gap-4 mb-2">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Socios</label>
                <input 
                  type="number" 
                  min="1"
                  max={diners}
                  value={memberDiners}
                  onChange={e => setMemberDiners(Math.max(1, Math.min(diners, Number(e.target.value))))}
                  className="w-full border border-gray-300 rounded px-2 py-1 text-center font-bold text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">No Socios</label>
                <div className="w-full bg-gray-100 border border-gray-200 rounded px-2 py-1 text-center font-bold text-gray-600 text-sm">
                  {Math.max(0, diners - memberDiners)}
                </div>
              </div>
            </div>

            {/* Cost Preview */}
            <div className="mt-3 pt-2 border-t border-dashed border-gray-200 flex justify-between items-center">
              <span className="text-xs text-gray-500">Coste cuotas:</span>
              <span className="text-lg font-black text-primary">{cost.toFixed(2)}€</span>
            </div>
            <p className="text-[10px] text-gray-400 mt-1 text-center">Se añadirá automáticamente a Gastos.</p>
          </div>

          {/* Servicios de Cocina (Multi-select) */}
          <div>
            <label className="block text-sm font-medium text-primary mb-2">
              Servicios de Cocina <span className="text-gray-400 font-normal text-xs">(Opcional)</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {Object.values(KitchenService).map(service => {
                const isSelected = selectedServices.includes(service);
                return (
                  <button
                    key={service}
                    type="button"
                    onClick={() => toggleService(service)}
                    className={`px-2 py-2 text-xs font-semibold rounded border transition-all flex items-center justify-center gap-1 ${
                      isSelected 
                        ? 'bg-accent text-white border-accent shadow-sm' 
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {isSelected && <span>✓</span>}
                    {service}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {type === ResourceType.Fronton && cost > 0 && (
        <div className="p-3 bg-yellow-50 border border-yellow-100 rounded-lg flex justify-between items-center">
           <span className="text-xs text-yellow-800 font-medium">Coste adicional (Luz):</span>
           <span className="text-lg font-black text-yellow-800">{cost.toFixed(2)}€</span>
        </div>
      )}

      <div className="pt-2 flex gap-3">
        <button 
          type="button" 
          onClick={onCancel}
          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50"
        >
          Cancelar
        </button>
        <button 
          type="submit"
          className="flex-1 px-4 py-2 bg-primary text-white font-bold rounded-lg hover:bg-opacity-90 shadow-md"
        >
          Confirmar
        </button>
      </div>
    </form>
  );
};
