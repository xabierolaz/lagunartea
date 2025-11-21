
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Consumption, Reservation, Member } from '../types';
import { MEMBERS as STATIC_MEMBERS } from '../constants';

// Configuración de Supabase
// NOTA: En un proyecto real, estas variables deben estar en un archivo .env.local
// NEXT_PUBLIC_SUPABASE_URL
// NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Cliente (si no hay claves, no se inicializa para evitar errores)
let supabase: SupabaseClient | null = null;

if (supabaseUrl && supabaseKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey);
  } catch (e) {
    console.warn('Supabase client could not be initialized. Falling back to local storage.');
  }
}

export const StorageService = {
  // --- Members ---
  getMembers: async (): Promise<Member[]> => {
    if (!supabase) return STATIC_MEMBERS;
    
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .order('last_name', { ascending: true });
      
    if (error) {
      console.error('Error fetching members:', error);
      return STATIC_MEMBERS;
    }
    
    return data.map((m: any) => ({
      id: m.id,
      firstName: m.first_name || m.firstName,
      lastName: m.last_name || m.lastName,
      phone: m.phone
    }));
  },

  // --- Reservations ---
  getReservations: async (): Promise<Reservation[]> => {
    if (!supabase) return JSON.parse(localStorage.getItem('lagunartea_reservations') || '[]');

    const { data, error } = await supabase
      .from('reservations')
      .select('*');

    if (error) {
      console.error('Error getting reservations:', error);
      // Fallback to local storage on error or if empty logic needed
      return [];
    }

    return data.map((r: any) => ({
      id: r.id,
      memberId: r.member_id,
      date: r.date,
      startTime: r.start_time,
      type: r.type,
      diners: r.diners,
      memberDiners: r.member_diners,
      space: r.space,
      kitchenServices: r.kitchen_services,
      lightIncluded: r.light_included,
      createdAt: r.created_at
    }));
  },

  addReservation: async (res: Reservation): Promise<void> => {
    if (!supabase) {
      const current = JSON.parse(localStorage.getItem('lagunartea_reservations') || '[]');
      current.push(res);
      localStorage.setItem('lagunartea_reservations', JSON.stringify(current));
      return;
    }

    const dbPayload = {
      id: res.id,
      member_id: res.memberId,
      date: res.date,
      start_time: res.startTime,
      type: res.type,
      diners: res.diners,
      member_diners: res.memberDiners,
      space: res.space,
      kitchen_services: res.kitchenServices,
      light_included: res.lightIncluded,
      created_at: res.createdAt
    };

    const { error } = await supabase.from('reservations').insert(dbPayload);
    if (error) console.error('Error adding reservation:', error);
  },

  removeReservation: async (id: string): Promise<void> => {
    if (!supabase) {
      const current = JSON.parse(localStorage.getItem('lagunartea_reservations') || '[]');
      const filtered = current.filter((r: Reservation) => r.id !== id);
      localStorage.setItem('lagunartea_reservations', JSON.stringify(filtered));
      return;
    }

    const { error } = await supabase.from('reservations').delete().eq('id', id);
    if (error) console.error('Error removing reservation:', error);
  },

  // --- Consumptions ---
  getConsumptions: async (): Promise<Consumption[]> => {
    if (!supabase) return JSON.parse(localStorage.getItem('lagunartea_consumptions') || '[]');

    const { data, error } = await supabase
      .from('consumptions')
      .select('*');

    if (error) {
      console.error('Error getting consumptions:', error);
      return [];
    }

    return data.map((c: any) => ({
      id: c.id,
      memberId: c.member_id,
      date: c.date,
      amount: c.amount,
      description: c.description,
      createdAt: c.created_at
    }));
  },

  addConsumption: async (con: Consumption): Promise<void> => {
    if (!supabase) {
      const current = JSON.parse(localStorage.getItem('lagunartea_consumptions') || '[]');
      current.push(con);
      localStorage.setItem('lagunartea_consumptions', JSON.stringify(current));
      return;
    }

    const dbPayload = {
      id: con.id,
      member_id: con.memberId,
      date: con.date,
      amount: con.amount,
      description: con.description,
      created_at: con.createdAt
    };

    const { error } = await supabase.from('consumptions').insert(dbPayload);
    if (error) console.error('Error adding consumption:', error);
  },

  removeConsumption: async (id: string): Promise<void> => {
    if (!supabase) {
      const current = JSON.parse(localStorage.getItem('lagunartea_consumptions') || '[]');
      const filtered = current.filter((c: Consumption) => c.id !== id);
      localStorage.setItem('lagunartea_consumptions', JSON.stringify(filtered));
      return;
    }

    const { error } = await supabase.from('consumptions').delete().eq('id', id);
    if (error) console.error('Error removing consumption:', error);
  }
};
