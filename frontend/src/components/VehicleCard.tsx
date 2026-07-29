import type { Vehicle } from '../api/types';

interface Props {
  vehicle: Vehicle;
  onPurchase: (id: number) => void;
  purchasing: boolean;
}

export default function VehicleCard({ vehicle, onPurchase, purchasing }: Props) {
  const outOfStock = vehicle.quantity === 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-slate-800">
          {vehicle.make} {vehicle.model}
        </h3>
        <span
          className={`text-xs font-medium px-2 py-1 rounded-full ${
            outOfStock ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
          }`}
        >
          {outOfStock ? 'Out of stock' : `${vehicle.quantity} in stock`}
        </span>
      </div>
      <p className="text-sm text-slate-500 mb-3">{vehicle.category}</p>
      <p className="text-lg font-bold text-slate-900 mb-4">
        ${Number(vehicle.price).toLocaleString()}
      </p>
      <button
        onClick={() => onPurchase(vehicle.id)}
        disabled={outOfStock || purchasing}
        className="w-full bg-slate-900 text-white py-2 rounded-lg font-medium hover:bg-slate-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {purchasing ? 'Processing...' : outOfStock ? 'Unavailable' : 'Purchase'}
      </button>
    </div>
  );
}