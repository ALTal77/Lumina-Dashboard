import { api } from './client';
import type { SystemSettings } from '../types';

export interface ContactResponse {
  message: string;
  id: number;
}

export interface SettingsResponse {
  settings: SystemSettings;
}

export function sendContactMessage(data: { name: string; email: string; subject?: string; message: string }): Promise<ContactResponse> {
  return api.post<ContactResponse>('/api/contact', data);
}

export function getPublicSettings(): Promise<SettingsResponse> {
  return api.get<SettingsResponse>('/api/settings');
}
