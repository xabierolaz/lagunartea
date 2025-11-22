
export interface Member {
  id: number;
  firstName: string;
  lastName: string;
  phone: string | null;
}

export enum ResourceType {
  Comedor = 'COMEDOR',
  Fronton = 'FRONTON'
}

export enum ComedorSpace {
  Abajo = 'Abajo',
  Arriba = 'Arriba',
  Exterior = 'Exterior'
}

export enum KitchenService {
  Barbacoa1 = 'Barbacoa 1',
  Barbacoa2 = 'Barbacoa 2',
  Horno1 = 'Horno 1',
  Horno2 = 'Horno 2'
}

export interface Reservation {
  id: string;
  memberId: number;
  date: string; // ISO Date string YYYY-MM-DD
  startTime: string; // HH:mm
  type: ResourceType;
  // Comedor specific
  diners?: number;
  memberDiners?: number; // Cuántos de los diners son socios
  spaces?: ComedorSpace[];
  kitchenServices?: KitchenService[];
  // Fronton specific
  lightIncluded?: boolean;
  // Metadata
  createdAt: number;
}

export interface Consumption {
  id: string;
  memberId: number;
  date: string;
  amount: number;
  description: string; // e.g. "Vino y Café"
  createdAt: number;
}

export type ViewState = 'CALENDAR' | 'CONSUMPTION' | 'ADMIN';
