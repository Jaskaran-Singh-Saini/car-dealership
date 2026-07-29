export interface Vehicle {
  id: number;
  make: string;
  model: string;
  category: string;
  price: string;
  quantity: number;
  created_at: string;
  updated_at: string;
}

export interface VehicleInput {
  make: string;
  model: string;
  category: string;
  price: number;
  quantity: number;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  username: string;
  password: string;
}

export interface AuthUser {
  username: string;
  role: 'USER' | 'ADMIN';
}

export interface SearchParams {
  make?: string;
  model?: string;
  category?: string;
  min_price?: number;
  max_price?: number;
}