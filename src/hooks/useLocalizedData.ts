import { useTranslation } from 'react-i18next';
import {
  SystemSettings,
  User,
  Department,
  Doctor,
  TimeSlot,
  Appointment,
  Payment,
  Message,
  Conversation,
  MedicalRecord,
  Rating,
  AppNotification,
} from '../types';
import {
  mockSystemSettings,
  mockPatients,
  mockDepartments,
  mockDoctors,
  mockTimeSlots,
  mockAppointments,
  mockPayments,
  mockConversations,
  mockMessages,
  mockMedicalRecords,
  mockRatings,
  mockNotifications,
} from '../data/mockData';
import {
  mockSystemSettingsAr,
  mockPatientsAr,
  mockDepartmentsAr,
  mockDoctorsAr,
  mockTimeSlotsAr,
  mockAppointmentsAr,
  mockPaymentsAr,
  mockConversationsAr,
  mockMessagesAr,
  mockMedicalRecordsAr,
  mockRatingsAr,
  mockNotificationsAr,
} from '../data/mockData-ar';

export function useLocalizedData() {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  return {
    mockSystemSettings: (isAr ? mockSystemSettingsAr : mockSystemSettings) as SystemSettings,
    mockPatients: (isAr ? mockPatientsAr : mockPatients) as User[],
    mockDepartments: (isAr ? mockDepartmentsAr : mockDepartments) as Department[],
    mockDoctors: (isAr ? mockDoctorsAr : mockDoctors) as Doctor[],
    mockTimeSlots: (isAr ? mockTimeSlotsAr : mockTimeSlots) as TimeSlot[],
    mockAppointments: (isAr ? mockAppointmentsAr : mockAppointments) as Appointment[],
    mockPayments: (isAr ? mockPaymentsAr : mockPayments) as Payment[],
    mockConversations: (isAr ? mockConversationsAr : mockConversations) as Conversation[],
    mockMessages: (isAr ? mockMessagesAr : mockMessages) as Message[],
    mockMedicalRecords: (isAr ? mockMedicalRecordsAr : mockMedicalRecords) as MedicalRecord[],
    mockRatings: (isAr ? mockRatingsAr : mockRatings) as Rating[],
    mockNotifications: (isAr ? mockNotificationsAr : mockNotifications) as AppNotification[],
  };
}
