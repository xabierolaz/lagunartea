import React, { useEffect, useMemo, useState } from 'react';
import { Item, Member } from '../types';

interface Props {
  members: Member[];
  items: Item[];
  onMemberSave: (member: Member) => Promise<void>;
  onMemberAdd: (member: Member) => Promise<void>;
  onMemberDelete: (memberId: number) => Promise<void>;
  onItemSave: (item: Item) => Promise<void>;
  onItemAdd: (item: Item) => Promise<void>;
  onItemDelete: (itemId: string) => Promise<void>;
}

export const AdminPanel: React.FC<Props> = ({
  members,
  items,
  onMemberSave,
  onMemberAdd,
  onMemberDelete,
  onItemSave,
  onItemAdd,
  onItemDelete
}) => {
  const [memberEdits, setMemberEdits] = useState<Member[]>(members);
  const [itemEdits, setItemEdits] = useState<Item[]>(items);

  const [newMember, setNewMember] = useState<{ firstName: string; lastName: string; phone: string }>({
    firstName: '',
    lastName: '',
    phone: ''
  });
  const [newItem, setNewItem] = useState<{ id: string; name: string; icon: string; price: string; category: string; sortOrder: string }>({
    id: '',
    name: '',
    icon: '',
    price: '',
    category: 'bebida',
    sortOrder: '0'
  });

  useEffect(() => {
    setMemberEdits(members);
  }, [members]);

  useEffect(() => {
    setItemEdits(items);
  }, [items]);

  const nextMemberId = useMemo(() => {
    if (members.length === 0) return 1;
    return Math.max(...members.map(m => m.id)) + 1;
  }, [members]);

  const slugify = (text: string) =>
    text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_]/g, '');

  const handleMemberFieldChange = (id: number, field: keyof Member, value: string) => {
    setMemberEdits(prev => prev.map(m => (m.id === id ? { ...m, [field]: field === 'phone' ? value : value } : m)));
  };

  const handleItemFieldChange = (id: string, field: keyof Item | 'sortOrder', value: string) => {
    setItemEdits(prev => prev.map(it => (it.id === id ? { ...it, [field]: field === 'price' ? Number(value) : field === 'sortOrder' ? Number(value) : value } : it)));
  };

  const handleAddMemberSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMember.firstName || !newMember.lastName) {
      alert('Rellena nombre y apellidos');
      return;
    }
    await onMemberAdd({
      id: nextMemberId,
      firstName: newMember.firstName,
      lastName: newMember.lastName,
      phone: newMember.phone || null
    });
    setNewMember({ firstName: '', lastName: '', phone: '' });
  };

  const handleAddItemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = newItem.id || slugify(newItem.name);
    if (!id || !newItem.name || !newItem.price) {
      alert('Rellena ID, nombre y precio');
      return;
    }
    await onItemAdd({
      id,
      name: newItem.name,
      icon: newItem.icon || null,
      price: Number(newItem.price),
      category: newItem.category,
      sortOrder: Number(newItem.sortOrder) || 0
    });
    setNewItem({ id: '', name: '', icon: '', price: '', category: 'bebida', sortOrder: '0' });
  };

  return (
    <div className="space-y-10">
      <section className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-bold text-gray-800">Socios</h3>
          <span className="text-xs text-gray-400">Editar, añadir o eliminar</span>
        </div>

        <form onSubmit={handleAddMemberSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-2 mb-4 items-end">
          <div>
            <label className="text-xs text-gray-500">Nombre</label>
            <input className="w-full border px-3 py-2 rounded" value={newMember.firstName} onChange={e => setNewMember(prev => ({ ...prev, firstName: e.target.value }))} />
          </div>
          <div>
            <label className="text-xs text-gray-500">Apellidos</label>
            <input className="w-full border px-3 py-2 rounded" value={newMember.lastName} onChange={e => setNewMember(prev => ({ ...prev, lastName: e.target.value }))} />
          </div>
          <div>
            <label className="text-xs text-gray-500">Teléfono</label>
            <input className="w-full border px-3 py-2 rounded" value={newMember.phone} onChange={e => setNewMember(prev => ({ ...prev, phone: e.target.value }))} />
          </div>
          <button type="submit" className="bg-primary text-white px-3 py-2 rounded font-bold">Añadir socio</button>
        </form>

        <div className="divide-y divide-gray-100">
          {memberEdits
            .slice()
            .sort((a, b) => a.lastName.localeCompare(b.lastName))
            .map(m => (
              <div key={m.id} className="py-3 grid grid-cols-1 sm:grid-cols-5 gap-2 items-center">
                <input className="border px-2 py-1 rounded" value={m.firstName} onChange={e => handleMemberFieldChange(m.id, 'firstName', e.target.value)} />
                <input className="border px-2 py-1 rounded" value={m.lastName} onChange={e => handleMemberFieldChange(m.id, 'lastName', e.target.value)} />
                <input className="border px-2 py-1 rounded" value={m.phone || ''} onChange={e => handleMemberFieldChange(m.id, 'phone', e.target.value)} />
                <button onClick={() => onMemberSave(m)} className="bg-primary text-white px-3 py-1 rounded text-sm font-semibold">Guardar</button>
                <button onClick={() => onMemberDelete(m.id)} className="text-red-600 border border-red-200 px-3 py-1 rounded text-sm font-semibold bg-red-50">Eliminar</button>
              </div>
            ))}
        </div>
      </section>

      <section className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-bold text-gray-800">Items y precios</h3>
          <span className="text-xs text-gray-400">Bebidas, servicios, cuotas</span>
        </div>

        <form onSubmit={handleAddItemSubmit} className="grid grid-cols-1 sm:grid-cols-6 gap-2 mb-4 items-end">
          <div>
            <label className="text-xs text-gray-500">ID (opcional)</label>
            <input className="w-full border px-2 py-1 rounded" value={newItem.id} onChange={e => setNewItem(prev => ({ ...prev, id: e.target.value }))} />
          </div>
          <div>
            <label className="text-xs text-gray-500">Nombre</label>
            <input className="w-full border px-2 py-1 rounded" value={newItem.name} onChange={e => setNewItem(prev => ({ ...prev, name: e.target.value }))} />
          </div>
          <div>
            <label className="text-xs text-gray-500">Icono</label>
            <input className="w-full border px-2 py-1 rounded" value={newItem.icon} onChange={e => setNewItem(prev => ({ ...prev, icon: e.target.value }))} />
          </div>
          <div>
            <label className="text-xs text-gray-500">Precio</label>
            <input type="number" step="0.01" className="w-full border px-2 py-1 rounded" value={newItem.price} onChange={e => setNewItem(prev => ({ ...prev, price: e.target.value }))} />
          </div>
          <div>
            <label className="text-xs text-gray-500">Categoría</label>
            <select className="w-full border px-2 py-1 rounded" value={newItem.category} onChange={e => setNewItem(prev => ({ ...prev, category: e.target.value }))}>
              <option value="bebida">Bebida</option>
              <option value="servicio">Servicio</option>
              <option value="cuota">Cuota</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500">Orden</label>
            <input type="number" className="w-full border px-2 py-1 rounded" value={newItem.sortOrder} onChange={e => setNewItem(prev => ({ ...prev, sortOrder: e.target.value }))} />
          </div>
          <div className="sm:col-span-6">
            <button type="submit" className="bg-primary text-white px-3 py-2 rounded font-bold w-full sm:w-auto">Añadir item</button>
          </div>
        </form>

        <div className="space-y-3">
          {itemEdits.map(it => (
            <div key={it.id} className="border border-gray-100 rounded-lg p-3 grid grid-cols-1 sm:grid-cols-7 gap-2 items-center">
              <input className="border px-2 py-1 rounded" value={it.id} disabled />
              <input className="border px-2 py-1 rounded" value={it.name} onChange={e => handleItemFieldChange(it.id, 'name', e.target.value)} />
              <input className="border px-2 py-1 rounded" value={it.icon || ''} onChange={e => handleItemFieldChange(it.id, 'icon', e.target.value)} />
              <input type="number" step="0.01" className="border px-2 py-1 rounded" value={it.price} onChange={e => handleItemFieldChange(it.id, 'price', e.target.value)} />
              <select className="border px-2 py-1 rounded" value={it.category} onChange={e => handleItemFieldChange(it.id, 'category', e.target.value)}>
                <option value="bebida">Bebida</option>
                <option value="servicio">Servicio</option>
                <option value="cuota">Cuota</option>
              </select>
              <input type="number" className="border px-2 py-1 rounded" value={it.sortOrder ?? 0} onChange={e => handleItemFieldChange(it.id, 'sortOrder', e.target.value)} />
              <div className="flex gap-2">
                <button onClick={() => onItemSave(it)} className="bg-primary text-white px-3 py-1 rounded text-sm font-semibold">Guardar</button>
                <button onClick={() => onItemDelete(it.id)} className="text-red-600 border border-red-200 px-3 py-1 rounded text-sm font-semibold bg-red-50">Eliminar</button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
