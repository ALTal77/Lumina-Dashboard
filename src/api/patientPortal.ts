import { api } from './client';
import type { User, Appointment, MedicalRecord, Rating, Conversation, Message } from '../types';

export interface PatientProfileResponse {
  patient: User;
}

export interface AppointmentsListResponse {
  appointments: Appointment[];
}

export interface AppointmentResponse {
  appointment: Appointment;
}

export interface RecordsListResponse {
  records: MedicalRecord[];
}

export interface RatingResponse {
  rating: Rating;
}

export interface RatingsListResponse {
  ratings: Rating[];
}

export interface ConversationResponse {
  conversation: Conversation;
}

export interface ConversationsListResponse {
  conversations: Conversation[];
}

export interface MessagesListResponse {
  messages: Message[];
}

export interface MessageResponse {
  message: Message;
}

export function getPatientMe(): Promise<PatientProfileResponse> {
  return api.get<PatientProfileResponse>('/api/patient/me');
}

export function updatePatientMe(data: { name?: string; phone?: string; avatar?: string; dob?: string; address?: string }): Promise<PatientProfileResponse> {
  return api.put<PatientProfileResponse>('/api/patient/me', data);
}

export function getPatientAppointments(): Promise<AppointmentsListResponse> {
  return api.get<AppointmentsListResponse>('/api/patient/appointments');
}

export function cancelPatientAppointment(id: string, reason?: string): Promise<AppointmentResponse> {
  return api.patch<AppointmentResponse>(`/api/patient/appointments/${id}/cancel`, { reason });
}

export function modifyPatientAppointment(id: string, data: { date?: string; timeSlot?: string }): Promise<AppointmentResponse> {
  return api.patch<AppointmentResponse>(`/api/patient/appointments/${id}/modify`, data);
}

export function getPatientRecords(): Promise<RecordsListResponse> {
  return api.get<RecordsListResponse>('/api/patient/records');
}

export function addPatientRating(data: { appointmentId: number | string; stars: number; comment?: string }): Promise<RatingResponse> {
  return api.post<RatingResponse>('/api/patient/ratings', data);
}

export function getPatientRatings(): Promise<RatingsListResponse> {
  return api.get<RatingsListResponse>('/api/patient/ratings');
}

export function getPatientConversations(): Promise<ConversationsListResponse> {
  return api.get<ConversationsListResponse>('/api/patient/conversations');
}

export function createPatientConversation(doctorId: string): Promise<ConversationResponse> {
  return api.post<ConversationResponse>('/api/patient/conversations', { doctorId });
}

export function getPatientConversationMessages(id: string): Promise<MessagesListResponse> {
  return api.get<MessagesListResponse>(`/api/patient/conversations/${id}/messages`);
}

export function sendPatientMessage(id: string, content: string): Promise<MessageResponse> {
  return api.post<MessageResponse>(`/api/patient/conversations/${id}/messages`, { content });
}
