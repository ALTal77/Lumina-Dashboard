import { api } from './client';
import type { Doctor, Appointment, TimeSlot, MedicalRecord, Conversation, Message, User } from '../types';

export interface DoctorProfileResponse {
  doctor: Doctor;
}

export interface AppointmentsListResponse {
  appointments: Appointment[];
}

export interface AppointmentResponse {
  appointment: Appointment;
}

export interface ScheduleResponse {
  slots: TimeSlot[];
}

export interface SlotResponse {
  slot: TimeSlot;
}

export interface PatientsListResponse {
  patients: User[];
}

export interface RecordsListResponse {
  records: MedicalRecord[];
}

export interface RecordResponse {
  record: MedicalRecord;
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

export function getDoctorMe(): Promise<DoctorProfileResponse> {
  return api.get<DoctorProfileResponse>('/api/doctor/me');
}

export function updateDoctorMe(data: { bio?: string; phone?: string }): Promise<DoctorProfileResponse> {
  return api.put<DoctorProfileResponse>('/api/doctor/me', data);
}

export function getDoctorAppointments(): Promise<AppointmentsListResponse> {
  return api.get<AppointmentsListResponse>('/api/doctor/appointments');
}

export function approveDoctorAppointment(id: string): Promise<AppointmentResponse> {
  return api.patch<AppointmentResponse>(`/api/doctor/appointments/${id}/approve`);
}

export function rejectDoctorAppointment(id: string, reason?: string): Promise<AppointmentResponse> {
  return api.patch<AppointmentResponse>(`/api/doctor/appointments/${id}/reject`, { reason });
}

export function completeDoctorAppointment(id: string): Promise<AppointmentResponse> {
  return api.patch<AppointmentResponse>(`/api/doctor/appointments/${id}/complete`);
}

export function getDoctorSchedule(): Promise<ScheduleResponse> {
  return api.get<ScheduleResponse>('/api/doctor/schedule');
}

export function toggleSlotLock(slotId: string): Promise<SlotResponse> {
  return api.patch<SlotResponse>(`/api/doctor/schedule/${slotId}/toggle-lock`);
}

export function getDoctorPatients(): Promise<PatientsListResponse> {
  return api.get<PatientsListResponse>('/api/doctor/patients');
}

export function getDoctorRecords(): Promise<RecordsListResponse> {
  return api.get<RecordsListResponse>('/api/doctor/records');
}

export function addDoctorRecord(patientUserId: string, data: { diagnosis: string; prescription?: string; note?: string }): Promise<RecordResponse> {
  return api.post<RecordResponse>(`/api/doctor/patients/${patientUserId}/records`, data);
}

export function getDoctorConversations(): Promise<ConversationsListResponse> {
  return api.get<ConversationsListResponse>('/api/doctor/conversations');
}

export function getDoctorConversationMessages(id: string): Promise<MessagesListResponse> {
  return api.get<MessagesListResponse>(`/api/doctor/conversations/${id}/messages`);
}

export function sendDoctorMessage(id: string, content: string): Promise<MessageResponse> {
  return api.post<MessageResponse>(`/api/doctor/conversations/${id}/messages`, { content });
}
