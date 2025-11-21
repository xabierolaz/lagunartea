
import { Member } from './types';

export const APP_NAME = "LAGUNARTEA";

export const BEVERAGES = [
  // Cuotas y Servicios
  { id: 'luz_fronton', name: 'Luz Frontón', icon: '💡', price: 6.00 }, // Uso interno para Reservas
  { id: 'lena', name: 'Leña', icon: '🪵', price: 4.00 },
  { id: 'descorche', name: 'Descorche', icon: '🍾', price: 2.00 },
  { id: 'comensal_socio', name: 'Comensal Socio', icon: '👤', price: 1.75 },
  { id: 'comensal_no_socio', name: 'Comensal No Socio', icon: '👥', price: 3.00 },
  
  // Bebidas
  { id: 'cerveza', name: 'Cerveza', icon: '🍺', price: 1.80 },
  { id: 'refresco', name: 'Refresco/Gaseosa', icon: '🥤', price: 1.80 },
  { id: 'vino_blanco', name: 'Vino Blanco (Bornos)', icon: '🥂', price: 7.50 },
  { id: 'vino_rosado', name: 'Vino Rosado (Sarria)', icon: '🍷', price: 6.00 },
  { id: 'vino_tinto', name: 'Vino Tinto (Sarria)', icon: '🍷', price: 6.00 },
  { id: 'vino_lopez_haro', name: 'Vino López de Haro', icon: '🍷', price: 8.00 },
  { id: 'sidra', name: 'Sidra', icon: '🍾', price: 5.00 },
];

// Parsed from the provided SQL
export const MEMBERS: Member[] = [
  { id: 1, lastName: 'Alfonso', firstName: 'Ignacio', phone: '671271927' },
  { id: 2, lastName: 'Alfonso', firstName: 'Luis', phone: '646143396' },
  { id: 3, lastName: 'Amatriain', firstName: 'Domingo', phone: '666444940' },
  { id: 4, lastName: 'Araujo', firstName: 'Rafael', phone: '627953993' },
  { id: 5, lastName: 'Arbeloa', firstName: 'Joaquin Miguel', phone: '656910513' },
  { id: 6, lastName: 'Arenaza', firstName: 'Miguel A.', phone: '635970169' },
  { id: 7, lastName: 'Arguedas', firstName: 'Alberto', phone: null },
  { id: 8, lastName: 'Asiain', firstName: 'Jesus Javier', phone: '600387412' },
  { id: 9, lastName: 'Berrade', firstName: 'Xabi', phone: '646905200' },
  { id: 10, lastName: 'Beunza', firstName: 'Carlos', phone: '685266274' },
  { id: 11, lastName: 'Camats', firstName: 'Jorge', phone: '609414447' },
  { id: 12, lastName: 'Cruceira', firstName: 'Jose Antonio', phone: '661802707' },
  { id: 13, lastName: 'Cruz', firstName: 'Miguel Angel', phone: '667523500' },
  { id: 14, lastName: 'Cruz', firstName: 'Benedicto', phone: '659776890' },
  { id: 15, lastName: 'Domeño', firstName: 'Javier', phone: '629471633' },
  { id: 16, lastName: 'Echavarren', firstName: 'Alfonso', phone: '636730484' },
  { id: 17, lastName: 'Echavarren', firstName: 'Juan', phone: '659298087' },
  { id: 18, lastName: 'Echavarren', firstName: 'Enrique', phone: '620546198' },
  { id: 19, lastName: 'Echavarren', firstName: 'Guillermo', phone: '678535407' },
  { id: 20, lastName: 'Echeverria', firstName: 'Joaquin', phone: '629778966' },
  { id: 21, lastName: 'Echeverria', firstName: 'Miguel', phone: '645434410' },
  { id: 22, lastName: 'Echeverria', firstName: 'Juan Mi.', phone: '609477661' },
  { id: 23, lastName: 'Egaña', firstName: 'Fco. Javier', phone: '620239024' },
  { id: 24, lastName: 'Egaña', firstName: 'Pedro', phone: '625688036' },
  { id: 25, lastName: 'Elizalde', firstName: 'Mikel', phone: '660268680' },
  { id: 26, lastName: 'Erro', firstName: 'Jesus Alberto', phone: '630066604' },
  { id: 27, lastName: 'Erroz', firstName: 'Juan', phone: '609859013' },
  { id: 28, lastName: 'Fernandez', firstName: 'Miki', phone: '660801211' },
  { id: 29, lastName: 'Fernandez', firstName: 'Mitxel', phone: '616684132' },
  { id: 30, lastName: 'Goñi', firstName: 'Santiago', phone: '656906031' },
  { id: 31, lastName: 'Itarte', firstName: 'Alberto', phone: '616085101' },
  { id: 32, lastName: 'Lopez', firstName: 'Jose Manuel', phone: '649235107' },
  { id: 33, lastName: 'Mendioroz', firstName: 'Juan Simon', phone: '616480019' },
  { id: 34, lastName: 'Moriones', firstName: 'Iñaki', phone: '629853485' },
  { id: 35, lastName: 'Murillo', firstName: 'Carlos', phone: '660321525' },
  { id: 36, lastName: 'Nagore', firstName: 'Jesus', phone: '618937153' },
  { id: 37, lastName: 'Percaz', firstName: 'Joaquin', phone: '637460019' },
  { id: 38, lastName: 'Ramos', firstName: 'Daniel', phone: '618241092' },
  { id: 39, lastName: 'Purroy', firstName: 'Asier', phone: '609380289' },
  { id: 40, lastName: 'Rodriguez', firstName: 'Antonio', phone: '948228928' },
  { id: 41, lastName: 'Rodriguez', firstName: 'Fco. Javier', phone: '669866706' },
  { id: 42, lastName: 'Rodriguez', firstName: 'Santiago', phone: '679502580' },
  { id: 43, lastName: 'Saralegui', firstName: 'Fermin', phone: '606984831' },
  { id: 44, lastName: 'Tirapu', firstName: 'Fermin', phone: '646079980' },
  { id: 45, lastName: 'Tirapu', firstName: 'Javier', phone: '619984954' },
  { id: 46, lastName: 'Tirapu', firstName: 'Iñaki', phone: '692698947' },
  { id: 47, lastName: 'Zoco', firstName: 'Pedro Mª', phone: '659334324' },
  { id: 48, lastName: 'Zunzarren', firstName: 'Raul', phone: '670533166' },
  { id: 49, lastName: 'Zaratiegui', firstName: 'Fernando', phone: '629662229' },
  { id: 50, lastName: 'Urdiroz', firstName: 'Martin Jesus', phone: '629454796' },
  { id: 51, lastName: 'Urdiroz', firstName: 'Pablo', phone: '628173287' }
];
