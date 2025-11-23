
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Consumption, Reservation, Member, Item } from '../types';

// Configuración estricta de Supabase: sin fallback local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase env vars missing. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
}

const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey);

export const StorageService = {
  // --- Members ---
  getMembers: async (): Promise<Member[]> => {
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .order('last_name', { ascending: true });
      
    if (error) {
      console.error('Error fetching members:', error);
      return [];
    }
    
    return data.map((m: any) => ({
      id: m.id,
      firstName: m.first_name || m.firstName,
      lastName: m.last_name || m.lastName,
      phone: m.phone
    }));
  },

  addMember: async (member: Member): Promise<void> => {
    const payload = {
      id: member.id,
      first_name: member.firstName,
      last_name: member.lastName,
      phone: member.phone
    };

    const { error } = await supabase.from('members').insert(payload);
    if (error) console.error('Error adding member:', error);
  },

  updateMember: async (member: Member): Promise<void> => {
    const payload = {
      first_name: member.firstName,
      last_name: member.lastName,
      phone: member.phone
    };

    const { error } = await supabase.from('members').update(payload).eq('id', member.id);
    if (error) console.error('Error updating member:', error);
  },

  deleteMember: async (memberId: number): Promise<void> => {
    const { error } = await supabase.from('members').delete().eq('id', memberId);
    if (error) console.error('Error deleting member:', error);
  },

  // --- Reservations ---
  getReservations: async (): Promise<Reservation[]> => {
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
      spaces: r.spaces || (r.space ? [r.space] : []),
      kitchenServices: r.kitchen_services,
      lightIncluded: r.light_included,
      createdAt: r.created_at
    }));
  },

  addReservation: async (res: Reservation): Promise<void> => {
    const dbPayload = {
      id: res.id,
      member_id: res.memberId,
      date: res.date,
      start_time: res.startTime,
      type: res.type,
      diners: res.diners,
      member_diners: res.memberDiners,
      space: res.spaces?.[0] || null, // compat con columna previa
      spaces: res.spaces,
      kitchen_services: res.kitchenServices,
      light_included: res.lightIncluded,
      created_at: res.createdAt
    };

    const { error } = await supabase.from('reservations').insert(dbPayload);
    if (error) console.error('Error adding reservation:', error);
  },

  removeReservation: async (id: string): Promise<void> => {
    const { error } = await supabase.from('reservations').delete().eq('id', id);
    if (error) console.error('Error removing reservation:', error);
  },

  // --- Consumptions ---
  getConsumptions: async (): Promise<Consumption[]> => {
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
    const { error } = await supabase.from('consumptions').delete().eq('id', id);
    if (error) console.error('Error removing consumption:', error);
  },

  // --- Items ---
  getItems: async (): Promise<Item[]> => {
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Error fetching items:', error);
      return [];
    }

    return data.map((it: any) => ({
      id: it.id,
      name: it.name,
      icon: it.icon,
      price: Number(it.price),
      category: it.category,
      sortOrder: it.sort_order,
      createdAt: it.created_at
    }));
  },

  addItem: async (item: Item): Promise<void> => {
    const payload = {
      id: item.id,
      name: item.name,
      icon: item.icon,
      price: item.price,
      category: item.category,
      sort_order: item.sortOrder ?? 0
    };
    const { error } = await supabase.from('items').insert(payload);
    if (error) console.error('Error adding item:', error);
  },

  updateItem: async (item: Item): Promise<void> => {
    const payload = {
      name: item.name,
      icon: item.icon,
      price: item.price,
      category: item.category,
      sort_order: item.sortOrder ?? 0
    };
    const { error } = await supabase.from('items').update(payload).eq('id', item.id);
    if (error) console.error('Error updating item:', error);
  },

  deleteItem: async (itemId: string): Promise<void> => {
    const { error } = await supabase.from('items').delete().eq('id', itemId);
    if (error) console.error('Error deleting item:', error);
  }
};
