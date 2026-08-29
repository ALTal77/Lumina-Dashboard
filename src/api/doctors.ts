import { api } from './client';
import type { Doctor, Department, TimeSlot } from '../types';

export interface DoctorsResponse {
  doctors: Doctor[];
  total: number;
}

export interface DoctorResponse {
  doctor: Doctor;
}

export interface DepartmentsResponse {
  departments: Department[];
}

export interface DepartmentResponse {
  department: Department;
}

export interface SpecialtiesResponse {
  specialtiesEn: string[];
  specialtiesAr: string[];
}

export interface SlotsResponse {
  slots: TimeSlot[];
}

export function getAllDoctors(): Promise<DoctorsResponse> {
  return api.get<DoctorsResponse>('/api/doctors');
}

export function getDoctor(id: string): Promise<DoctorResponse> {
  return api.get<DoctorResponse>(`/api/doctors/${id}`);
}

export function getDoctorSlots(id: string): Promise<SlotsResponse> {
  return api.get<SlotsResponse>(`/api/doctors/${id}/slots`);
}

export function getSpecialties(): Promise<SpecialtiesResponse> {
  return api.get<SpecialtiesResponse>('/api/doctors/specialties');
}

export function getPublicDepartments(): Promise<DepartmentsResponse> {
  return api.get<DepartmentsResponse>('/api/doctors/departments');
}
