import { api } from './client';
import type { User } from '../types';
import type { UserRole } from '../types';

export interface LoginResponse {
  token: string;
  user: User;
}

export interface RegisterResponse {
  token: string;
  user: User;
  patient: {
    id: string;
    patientId: string;
    name: string;
    idNumber: string;
    email: string;
  };
}

export interface MeResponse {
  user: User;
}

export function login(email: string, password: string): Promise<LoginResponse> {
  return api.post<LoginResponse>('/api/auth/login', { email, password });
}

export function getMe(): Promise<MeResponse> {
  return api.get<MeResponse>('/api/auth/me');
}

export function register(data: {
  fullName: string;
  nationalId: string;
  email: string;
  password: string;
  phone?: string;
}): Promise<RegisterResponse> {
  return api.post<RegisterResponse>('/api/register', data);
}

export type { UserRole };
