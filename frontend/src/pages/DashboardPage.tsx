import { useEffect, useState } from 'react';
import * as api from '../api/vehicles';
import type { Vehicle, SearchParams } from '../api/types';
import VehicleCard from '../components/VehicleCard';
import SearchBar from '../components/SearchBar';

export default function DashboardPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [purchasingId, setPurchasingId] = useState<number | null>(null);

  async function loadVehicles() {
    setLoading(true);
    setError('');
    try {
      const data = await api.getVehicles();
      setVehicles(data);
    } catch {
      setError('Could not load vehicles.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadVehicles();
  }, []);

  async function handleSearch(params: SearchParams) {
    setLoading(true);
    setError('');
    try {
      const data = await api.searchVehicles(params);
      setVehicles(data);
    } catch {
      setError('Search failed.');
    } finally {
      setLoading(false);
    }
  }

  async function handlePurchase(id: number) {
    setPurchasingId(id);
    try {
      const updated = await api.purchaseVehicle(id);
      setVehicles((prev) => prev.map((v) => (v.id === id ? updated : v)));
    } catch {
      setError('Purchase failed.');
    } finally {
      setPurchasingId(null);
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Available Vehicles</h1>
      <SearchBar onSearch={handleSearch} onReset={loadVehicles} />

      {error && <p className="text-red-600 mb-4">{error}</p>}

      {loading ? (
        <p className="text-slate-500">Loading vehicles...</p>
      ) : vehicles.length === 0 ? (
        <p className="text-slate-500">No vehicles found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {vehicles.map((vehicle) => (
            <VehicleCard
              key={vehicle.id}
              vehicle={vehicle}
              onPurchase={handlePurchase}
              purchasing={purchasingId === vehicle.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}