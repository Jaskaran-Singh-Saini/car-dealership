import { useState } from 'react';
import type { FormEvent } from 'react';
import toast from 'react-hot-toast';
import * as api from '../api/vehicles';
import type { Vehicle, VehicleInput } from '../api/types';

const emptyForm: VehicleInput = { make: '', model: '', category: '', price: 0, quantity: 0 };

interface Props {
  vehicles: Vehicle[];
  onChange: () => void;
}

export default function AdminPanel({ vehicles, onChange }: Props) {
  const [form, setForm] = useState<VehicleInput>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [restockAmounts, setRestockAmounts] = useState<Record<number, string>>({});
  const [error, setError] = useState('');

  function startEdit(vehicle: Vehicle) {
    setEditingId(vehicle.id);
    setForm({
      make: vehicle.make,
      model: vehicle.model,
      category: vehicle.category,
      price: Number(vehicle.price),
      quantity: vehicle.quantity,
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    try {
      if (editingId) {
        await api.updateVehicle(editingId, form);
        toast.success('Vehicle updated.');
      } else {
        await api.addVehicle(form);
        toast.success('Vehicle added.');
      }
      cancelEdit();
      onChange();
    } catch {
      setError('Could not save vehicle. Check the fields and try again.');
      toast.error('Could not save vehicle.');
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete this vehicle?')) return;
    try {
      await api.deleteVehicle(id);
      onChange();
      toast.success('Vehicle deleted.');
    } catch {
      setError('Could not delete vehicle.');
      toast.error('Could not delete vehicle.');
    }
  }

  async function handleRestock(id: number) {
    const amount = Number(restockAmounts[id] || 0);
    if (amount <= 0) return;
    try {
      await api.restockVehicle(id, amount);
      setRestockAmounts((prev) => ({ ...prev, [id]: '' }));
      onChange();
      toast.success(`Restocked +${amount}.`);
    } catch {
      setError('Could not restock vehicle.');
      toast.error('Could not restock vehicle.');
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
      <h2 className="text-lg font-bold text-slate-800 mb-4">Admin Panel</h2>

      <form onSubmit={handleSubmit} className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        <input
          placeholder="Make"
          value={form.make}
          onChange={(e) => setForm({ ...form, make: e.target.value })}
          required
          className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm"
        />
        <input
          placeholder="Model"
          value={form.model}
          onChange={(e) => setForm({ ...form, model: e.target.value })}
          required
          className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm"
        />
        <input
          placeholder="Category"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          required
          className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm"
        />
        <input
          type="number"
          placeholder="Price"
          value={form.price || ''}
          onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
          required
          className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm"
        />
        <input
          type="number"
          placeholder="Quantity"
          value={form.quantity || ''}
          onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
          required
          className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm"
        />
        <div className="col-span-2 sm:col-span-5 flex gap-2">
          <button type="submit" className="bg-emerald-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-emerald-700">
            {editingId ? 'Update Vehicle' : 'Add Vehicle'}
          </button>
          {editingId && (
            <button type="button" onClick={cancelEdit} className="text-slate-500 text-sm underline">
              Cancel
            </button>
          )}
        </div>
      </form>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500 border-b border-slate-200">
              <th className="pb-2">Vehicle</th>
              <th className="pb-2">Qty</th>
              <th className="pb-2">Restock</th>
              <th className="pb-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map((v) => (
              <tr key={v.id} className="border-b border-slate-100">
                <td className="py-2">{v.make} {v.model}</td>
                <td className="py-2">{v.quantity}</td>
                <td className="py-2">
                  <div className="flex gap-1">
                    <input
                      type="number"
                      value={restockAmounts[v.id] || ''}
                      onChange={(e) => setRestockAmounts((prev) => ({ ...prev, [v.id]: e.target.value }))}
                      className="w-16 border border-slate-300 rounded px-2 py-1 text-xs"
                    />
                    <button onClick={() => handleRestock(v.id)} className="text-emerald-600 text-xs font-medium underline">
                      Restock
                    </button>
                  </div>
                </td>
                <td className="py-2">
                  <div className="flex gap-3">
                    <button onClick={() => startEdit(v)} className="text-blue-600 text-xs font-medium underline">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(v.id)} className="text-red-600 text-xs font-medium underline">
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}