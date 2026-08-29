import { api } from './client';
import type { Appointment } from '../types';

export interface CreateBookingRequest {
  doctorId: string;
  patientName: string;
  phone?: string;
  date: string;
  timeSlot: string;
  notes?: string;
  paymentMethod?: string;
  consultationFee?: number;
}

export interface CreateBookingResponse {
  appointment: Appointment;
  appointmentId: string;
  paymentId: string;
}

export interface BookingResponse {
  appointment: Appointment;
}

export function createBooking(data: CreateBookingRequest): Promise<CreateBookingResponse> {
  return api.post<CreateBookingResponse>('/api/bookings', data);
}

export function getBookingByReference(reference: string): Promise<BookingResponse> {
  return api.get<BookingResponse>(`/api/bookings/${reference}`);
}
