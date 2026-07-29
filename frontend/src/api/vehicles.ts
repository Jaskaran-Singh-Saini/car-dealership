import client from './client';
import type {
  Vehicle,
  VehicleInput,
  AuthTokens,
  RegisterPayload,
  LoginPayload,
  AuthUser,
  SearchParams,
} from './types';

export async function register(payload: RegisterPayload): Promise<{ tokens: AuthTokens; user: AuthUser }> {
  const { data } = await client.post('/auth/register', payload);
  return { tokens: data.tokens, user: { username: data.user.username, role: data.user.role } };
}

export async function login(payload: LoginPayload): Promise<{ tokens: AuthTokens; user: AuthUser }> {
  const { data } = await client.post('/auth/login', payload);
  return { tokens: data.tokens, user: { username: data.username, role: data.role } };
}

export async function getVehicles(): Promise<Vehicle[]> {
  const { data } = await client.get('/vehicles/');
  return data;
}

export async function searchVehicles(params: SearchParams): Promise<Vehicle[]> {
  const { data } = await client.get('/vehicles/search', { params });
  return data;
}

export async function addVehicle(payload: VehicleInput): Promise<Vehicle> {
  const { data } = await client.post('/vehicles/', payload);
  return data;
}

export async function updateVehicle(id: number, payload: VehicleInput): Promise<Vehicle> {
  const { data } = await client.put(`/vehicles/${id}`, payload);
  return data;
}

export async function deleteVehicle(id: number): Promise<void> {
  await client.delete(`/vehicles/${id}`);
}

export async function purchaseVehicle(id: number): Promise<Vehicle> {
  const { data } = await client.post(`/vehicles/${id}/purchase`);
  return data;
}

export async function restockVehicle(id: number, amount: number): Promise<Vehicle> {
  const { data } = await client.post(`/vehicles/${id}/restock`, { amount });
  return data;
}