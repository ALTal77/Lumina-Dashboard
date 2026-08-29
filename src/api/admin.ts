import { api } from './client';
import type { Doctor, Department, User, Appointment, Payment, SystemSettings } from '../types';

export interface OverviewResponse {
  doctors: number;
  departments: number;
  patients: number;
  appointments: number;
  pendingAppointments: number;
  grossRevenue: number;
}

export interface DoctorsListResponse {
  doctors: Doctor[];
}

export interface DoctorResponse {
  doctor: Doctor;
}

export interface DoctorCreateResponse {
  doctor: Doctor;
  temporaryPassword: string;
}

export interface DoctorUpdateRequest {
  name?: string;
  email?: string;
  specialty?: string;
  departmentId?: string;
  yearsExperience?: number;
  consultationFee?: number;
  phone?: string;
  languages?: string[];
  bio?: string;
  profilePicture?: string;
  availableDays?: string[];
  status?: string;
}

export interface DepartmentsListResponse {
  departments: Department[];
}

export interface DepartmentRequest {
  name: string;
  status?: string;
  description?: string;
  icon?: string;
}

export interface DepartmentResponse {
  department: Department;
}

export interface PatientsListResponse {
  patients: User[];
}

export interface PatientResponse {
  patient: User;
}

export interface AppointmentsListResponse {
  appointments: Appointment[];
}

export interface AppointmentResponse {
  appointment: Appointment;
}

export interface PaymentsListResponse {
  payments: Payment[];
}

export interface SettingsResponse {
  settings: SystemSettings;
}

export interface AdminOverviewResponse {
  doctors: number;
  departments: number;
  patients: number;
  appointments: number;
  pendingAppointments: number;
  grossRevenue: number;
}

export function getAdminOverview(): Promise<AdminOverviewResponse> {
  return api.get<AdminOverviewResponse>('/api/admin/overview');
}

export function getAdminDoctors(): Promise<DoctorsListResponse> {
  return api.get<DoctorsListResponse>('/api/admin/doctors');
}

export function createAdminDoctor(data: DoctorUpdateRequest): Promise<DoctorCreateResponse> {
  return api.post<DoctorCreateResponse>('/api/admin/doctors', data);
}

export function updateAdminDoctor(id: string, data: DoctorUpdateRequest): Promise<DoctorResponse> {
  return api.put<DoctorResponse>(`/api/admin/doctors/${id}`, data);
}

export function deleteAdminDoctor(id: string): Promise<{ message: string }> {
  return api.delete<{ message: string }>(`/api/admin/doctors/${id}`);
}

export function getAdminDepartments(): Promise<DepartmentsListResponse> {
  return api.get<DepartmentsListResponse>('/api/admin/departments');
}

export function createAdminDepartment(data: DepartmentRequest): Promise<DepartmentResponse> {
  return api.post<DepartmentResponse>('/api/admin/departments', data);
}

export function updateAdminDepartment(id: string, data: Partial<DepartmentRequest>): Promise<DepartmentResponse> {
  return api.put<DepartmentResponse>(`/api/admin/departments/${id}`, data);
}

export function toggleDepartmentStatus(id: string, status: string): Promise<DepartmentResponse> {
  return api.patch<DepartmentResponse>(`/api/admin/departments/${id}/status`, { status });
}

export function deleteAdminDepartment(id: string): Promise<{ message: string }> {
  return api.delete<{ message: string }>(`/api/admin/departments/${id}`);
}

export function getAdminPatients(): Promise<PatientsListResponse> {
  return api.get<PatientsListResponse>('/api/admin/patients');
}

export function suspendPatient(id: string): Promise<PatientResponse> {
  return api.patch<PatientResponse>(`/api/admin/patients/${id}/suspend`);
}

export function deleteAdminPatient(id: string): Promise<{ message: string }> {
  return api.delete<{ message: string }>(`/api/admin/patients/${id}`);
}

export function getAdminAppointments(params?: { status?: string; search?: string }): Promise<AppointmentsListResponse> {
  const qs = new URLSearchParams();
  if (params?.status && params.status !== 'all') qs.set('status', params.status);
  if (params?.search) qs.set('search', params.search);
  const suffix = qs.toString() ? `?${qs.toString()}` : '';
  return api.get<AppointmentsListResponse>(`/api/admin/appointments${suffix}`);
}

export function approveAdminAppointment(id: string): Promise<AppointmentResponse> {
  return api.patch<AppointmentResponse>(`/api/admin/appointments/${id}/approve`);
}

export function cancelAdminAppointment(id: string, reason?: string): Promise<AppointmentResponse> {
  return api.patch<AppointmentResponse>(`/api/admin/appointments/${id}/cancel`, { reason });
}

export function getAdminPayments(): Promise<PaymentsListResponse> {
  return api.get<PaymentsListResponse>('/api/admin/payments');
}

export function getAdminSettings(): Promise<SettingsResponse> {
  return api.get<SettingsResponse>('/api/admin/settings');
}

export function updateAdminSettings(data: Partial<SystemSettings>): Promise<SettingsResponse> {
  return api.put<SettingsResponse>('/api/admin/settings', data);
}
