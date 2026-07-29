import { useState } from 'react';
import type { FormEvent } from 'react';
import type { SearchParams } from '../api/types';

interface Props {
  onSearch: (params: SearchParams) => void;
  onReset: () => void;
}

export default function SearchBar({ onSearch, onReset }: Props) {
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [category, setCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const params: SearchParams = {};
    if (make) params.make = make;
    if (model) params.model = model;
    if (category) params.category = category;
    if (minPrice) params.min_price = Number(minPrice);
    if (maxPrice) params.max_price = Number(maxPrice);
    onSearch(params);
  }

  function handleReset() {
    setMake('');
    setModel('');
    setCategory('');
    setMinPrice('');
    setMaxPrice('');
    onReset();
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6 flex flex-wrap gap-3 items-end">
      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1">Make</label>
        <input
          value={make}
          onChange={(e) => setMake(e.target.value)}
          className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm w-32"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1">Model</label>
        <input
          value={model}
          onChange={(e) => setModel(e.target.value)}
          className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm w-32"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1">Category</label>
        <input
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm w-32"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1">Min price</label>
        <input
          type="number"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
          className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm w-24"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1">Max price</label>
        <input
          type="number"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm w-24"
        />
      </div>
      <button type="submit" className="bg-emerald-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-emerald-700 transition">
        Search
      </button>
      <button type="button" onClick={handleReset} className="text-slate-500 text-sm underline">
        Reset
      </button>
    </form>
  );
}