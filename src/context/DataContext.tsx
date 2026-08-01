import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from './AuthContext';
import {
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
  SystemSettings,
  AppointmentStatus,
} from '../types';

import {
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
  mockSystemSettings,
} from '../data/mockData';
import {
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
  mockSystemSettingsAr,
} from '../data/mockData-ar';

interface DataContextType {
  patients: User[];
  departments: Department[];
  doctors: Doctor[];
  timeSlots: TimeSlot[];
  appointments: Appointment[];
  payments: Payment[];
  conversations: Conversation[];
  messages: Message[];
  medicalRecords: MedicalRecord[];
  ratings: Rating[];
  notifications: AppNotification[];
  systemSettings: SystemSettings;

  // Actions
  bookAppointment: (data: {
    patientId: string;
    patientName: string;
    doctorId: string;
    date: string;
    timeSlot: string;
    notes?: string;
    consultationFee: number;
    paymentMethod: Payment['paymentMethod'];
  }) => Promise<{ appointmentId: string; paymentId: string }>;

  cancelAppointment: (appointmentId: string, reason?: string) => void;
  modifyAppointment: (appointmentId: string, newDate: string, newTimeSlot: string) => void;
  confirmAppointment: (appointmentId: string) => void;
  approveAppointment: (appointmentId: string) => void;
  rejectAppointment: (appointmentId: string, reason: string) => void;
  completeAppointment: (appointmentId: string) => void;

  addDoctor: (doctor: Omit<Doctor, 'id' | 'rating' | 'reviewCount'>) => void;
  updateDoctor: (doctorOrId: Doctor | string, data?: Partial<Omit<Doctor, 'id' | 'rating' | 'reviewCount'>>) => void;
  deleteDoctor: (doctorId: string) => void;

  addDepartment: (department: Omit<Department, 'id' | 'doctorCount' | 'createdAt'>) => void;
  updateDepartment: (departmentOrId: Department | string, data?: Partial<Omit<Department, 'id' | 'doctorCount' | 'createdAt'>>) => void;
  toggleDepartmentStatus: (departmentId: string, status: Department['status']) => void;
  deleteDepartment: (departmentId: string) => void;

  suspendPatient: (patientId: string) => void;
  deletePatient: (patientId: string) => void;

  toggleSlotLock: (slotId: string) => void;
  togglePatientSuspension: (patientId: string) => void;
  sendMessage: (conversationId: string, senderId: string, senderRole: 'patient' | 'doctor' | 'admin', receiverId: string, content: string) => void;
  addMedicalNote: (record: Omit<MedicalRecord, 'id'>) => void;
  addRating: (rating: Omit<Rating, 'id' | 'date'>) => void;
  updateDoctorSchedule: (doctorId: string, slots: TimeSlot[]) => void;
  updateSystemSettings: (settings: Partial<SystemSettings>) => void;
  markNotificationRead: (notificationId: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { i18n } = useTranslation();
  const { user: currentUser } = useAuth();
  const isAr = i18n.language === 'ar';

  const [patients, setPatients] = useState<User[]>(isAr ? mockPatientsAr : mockPatients);
  const [departments, setDepartments] = useState<Department[]>(isAr ? mockDepartmentsAr : mockDepartments);
  const [doctors, setDoctors] = useState<Doctor[]>(isAr ? mockDoctorsAr : mockDoctors);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>(isAr ? mockTimeSlotsAr : mockTimeSlots);
  const [appointments, setAppointments] = useState<Appointment[]>(isAr ? mockAppointmentsAr : mockAppointments);
  const [payments, setPayments] = useState<Payment[]>(isAr ? mockPaymentsAr : mockPayments);
  const [conversations, setConversations] = useState<Conversation[]>(isAr ? mockConversationsAr : mockConversations);
  const [messages, setMessages] = useState<Message[]>(isAr ? mockMessagesAr : mockMessages);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>(isAr ? mockMedicalRecordsAr : mockMedicalRecords);
  const [ratings, setRatings] = useState<Rating[]>(isAr ? mockRatingsAr : mockRatings);
  const [notifications, setNotifications] = useState<AppNotification[]>(isAr ? mockNotificationsAr : mockNotifications);
  const [systemSettings, setSystemSettings] = useState<SystemSettings>(isAr ? mockSystemSettingsAr : mockSystemSettings);

  useEffect(() => {
    const ar = i18n.language === 'ar';
    setPatients(ar ? mockPatientsAr : mockPatients);
    setDepartments(ar ? mockDepartmentsAr : mockDepartments);
    setDoctors(ar ? mockDoctorsAr : mockDoctors);
    setTimeSlots(ar ? mockTimeSlotsAr : mockTimeSlots);
    setAppointments(ar ? mockAppointmentsAr : mockAppointments);
    setPayments(ar ? mockPaymentsAr : mockPayments);
    setConversations(ar ? mockConversationsAr : mockConversations);
    setMessages(ar ? mockMessagesAr : mockMessages);
    setMedicalRecords(ar ? mockMedicalRecordsAr : mockMedicalRecords);
    setRatings(ar ? mockRatingsAr : mockRatings);
    setNotifications(ar ? mockNotificationsAr : mockNotifications);
    setSystemSettings(ar ? mockSystemSettingsAr : mockSystemSettings);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i18n.language]);

  // 1. Book Appointment
  const bookAppointment: DataContextType['bookAppointment'] = async (data) => {
    // TODO: connect to Express API (POST /api/appointments & POST /api/payments)
    const doctor = doctors.find((d) => d.id === data.doctorId);
    const aptId = `apt-${Date.now().toString().slice(-6)}`;
    const payId = `pay-${Date.now().toString().slice(-6)}`;
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);

    const newAppointment: Appointment = {
      id: aptId,
      patientId: data.patientId,
      patientName: data.patientName,
      patientAvatar: patients.find((p) => p.id === data.patientId)?.avatar,
      patientPhone: patients.find((p) => p.id === data.patientId)?.phone,
      doctorId: data.doctorId,
      doctorName: doctor ? doctor.name : 'Doctor',
      doctorSpecialty: doctor ? doctor.specialty : 'Specialist',
      doctorAvatar: doctor?.profilePicture,
      departmentName: doctor?.departmentName || 'General',
      date: data.date,
      timeSlot: data.timeSlot,
      status: 'pending',
      notes: data.notes,
      consultationFee: data.consultationFee,
      paymentStatus: 'paid',
      createdAt: now,
      isRated: false,
    };

    const newPayment: Payment = {
      id: payId,
      appointmentId: aptId,
      patientId: data.patientId,
      patientName: data.patientName,
      doctorId: data.doctorId,
      doctorName: doctor ? doctor.name : 'Doctor',
      amount: data.consultationFee,
      paymentMethod: data.paymentMethod,
      status: 'completed',
      transactionId: `TXN-${Math.floor(10000000 + Math.random() * 90000000)}`,
      createdAt: now,
    };

    const patientNotif: AppNotification = {
      id: `notif-${Date.now()}`,
      userId: data.patientId,
      type: 'appointment',
      title: 'Appointment Request Submitted',
      message: `Your booking with ${doctor?.name} on ${data.date} at ${data.timeSlot} is pending doctor confirmation.`,
      isRead: false,
      createdAt: now,
    };

    const doctorNotif: AppNotification = {
      id: `notif-doc-${Date.now()}`,
      userId: data.doctorId,
      type: 'appointment',
      title: 'New Pending Booking',
      message: `${data.patientName} requested an appointment for ${data.date} at ${data.timeSlot}.`,
      isRead: false,
      createdAt: now,
    };

    setAppointments((prev) => [newAppointment, ...prev]);
    setPayments((prev) => [newPayment, ...prev]);
    setNotifications((prev) => [patientNotif, doctorNotif, ...prev]);

    return { appointmentId: aptId, paymentId: payId };
  };

  // 2. Cancel Appointment
  const cancelAppointment = (appointmentId: string, reason?: string) => {
    // TODO: connect to Express API (PUT /api/appointments/:id/cancel)
    const apt = appointments.find((a) => a.id === appointmentId);
    if (!apt) return;

    setAppointments((prev) =>
      prev.map((a) =>
        a.id === appointmentId
          ? { ...a, status: 'cancelled', rejectionReason: reason || 'Cancelled by user', paymentStatus: 'refunded' }
          : a
      )
    );

    // Auto refund payment
    setPayments((prev) =>
      prev.map((p) => (p.appointmentId === appointmentId ? { ...p, status: 'refunded' } : p))
    );

    const notif: AppNotification = {
      id: `notif-${Date.now()}`,
      userId: apt.patientId,
      type: 'appointment',
      title: 'Appointment Cancelled',
      message: `Appointment #${apt.id} with ${apt.doctorName} was cancelled. Refund processed.`,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  // 3. Modify Appointment
  const modifyAppointment = (appointmentId: string, newDate: string, newTimeSlot: string) => {
    // TODO: connect to Express API (PUT /api/appointments/:id/reschedule)
    setAppointments((prev) =>
      prev.map((a) => (a.id === appointmentId ? { ...a, date: newDate, timeSlot: newTimeSlot, status: 'pending' } : a))
    );
  };

  // 4. Confirm Appointment
  const confirmAppointment = (appointmentId: string) => {
    // TODO: connect to Express API (PUT /api/appointments/:id/confirm)
    const apt = appointments.find((a) => a.id === appointmentId);
    setAppointments((prev) =>
      prev.map((a) => (a.id === appointmentId ? { ...a, status: 'confirmed' } : a))
    );

    if (apt) {
      const notif: AppNotification = {
        id: `notif-${Date.now()}`,
        userId: apt.patientId,
        type: 'appointment',
        title: 'Appointment Confirmed',
        message: `Dr. ${apt.doctorName} confirmed your appointment for ${apt.date} at ${apt.timeSlot}.`,
        isRead: false,
        createdAt: new Date().toISOString(),
      };
      setNotifications((prev) => [notif, ...prev]);
    }
  };

  // 4b. Approve Appointment (alias)
  const approveAppointment = (appointmentId: string) => {
    confirmAppointment(appointmentId);
  };

  // 5. Reject Appointment
  const rejectAppointment = (appointmentId: string, reason: string) => {
    // TODO: connect to Express API (PUT /api/appointments/:id/reject)
    const apt = appointments.find((a) => a.id === appointmentId);
    setAppointments((prev) =>
      prev.map((a) =>
        a.id === appointmentId
          ? { ...a, status: 'rejected', rejectionReason: reason, paymentStatus: 'refunded' }
          : a
      )
    );

    setPayments((prev) =>
      prev.map((p) => (p.appointmentId === appointmentId ? { ...p, status: 'refunded' } : p))
    );

    if (apt) {
      const notif: AppNotification = {
        id: `notif-${Date.now()}`,
        userId: apt.patientId,
        type: 'appointment',
        title: 'Appointment Rejected',
        message: `Dr. ${apt.doctorName} rejected your booking request. Reason: ${reason}. Refund issued.`,
        isRead: false,
        createdAt: new Date().toISOString(),
      };
      setNotifications((prev) => [notif, ...prev]);
    }
  };

  // 6. Complete Appointment
  const completeAppointment = (appointmentId: string) => {
    // TODO: connect to Express API (PUT /api/appointments/:id/complete)
    setAppointments((prev) =>
      prev.map((a) => (a.id === appointmentId ? { ...a, status: 'completed' } : a))
    );
  };

  // 7. Manage Doctors
  const addDoctor = (doctorData: Omit<Doctor, 'id' | 'rating' | 'reviewCount'>) => {
    // TODO: connect to Express API (POST /api/doctors)
    const newDoc: Doctor = {
      ...doctorData,
      id: `doc-${Date.now().toString().slice(-4)}`,
      rating: 0,
      reviewCount: 0,
    };
    setDoctors((prev) => [newDoc, ...prev]);

    // Update department doctor count
    setDepartments((prev) =>
      prev.map((d) => (d.id === doctorData.departmentId ? { ...d, doctorCount: d.doctorCount + 1 } : d))
    );
  };

  const updateDoctor = (doctorOrId: Doctor | string, data?: Partial<Omit<Doctor, 'id' | 'rating' | 'reviewCount'>>) => {
    // TODO: connect to Express API (PUT /api/doctors/:id)
    if (typeof doctorOrId === 'string' && data) {
      setDoctors((prev) =>
        prev.map((d) => (d.id === doctorOrId ? { ...d, ...data } : d))
      );
    } else if (typeof doctorOrId !== 'string') {
      setDoctors((prev) => prev.map((d) => (d.id === doctorOrId.id ? doctorOrId : d)));
    }
  };

  const deleteDoctor = (doctorId: string) => {
    // TODO: connect to Express API (DELETE /api/doctors/:id)
    const docToDelete = doctors.find((d) => d.id === doctorId);
    setDoctors((prev) => prev.filter((d) => d.id !== doctorId));

    // Auto cancel active appointments for this doctor
    setAppointments((prev) =>
      prev.map((a) =>
        a.doctorId === doctorId
          ? { ...a, status: 'cancelled', rejectionReason: 'Doctor profile was removed', paymentStatus: 'refunded' }
          : a
      )
    );

    if (docToDelete?.departmentId) {
      setDepartments((prev) =>
        prev.map((d) => (d.id === docToDelete.departmentId ? { ...d, doctorCount: Math.max(0, d.doctorCount - 1) } : d))
      );
    }
  };

  // 8. Manage Departments
  const addDepartment = (depData: Omit<Department, 'id' | 'doctorCount' | 'createdAt'>) => {
    // TODO: connect to Express API (POST /api/departments)
    const newDep: Department = {
      ...depData,
      id: `dep-${Date.now().toString().slice(-4)}`,
      doctorCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setDepartments((prev) => [newDep, ...prev]);
  };

  const updateDepartment = (departmentOrId: Department | string, data?: Partial<Omit<Department, 'id' | 'doctorCount' | 'createdAt'>>) => {
    // TODO: connect to Express API (PUT /api/departments/:id)
    if (typeof departmentOrId === 'string' && data) {
      setDepartments((prev) =>
        prev.map((d) => (d.id === departmentOrId ? { ...d, ...data } : d))
      );
    } else if (typeof departmentOrId !== 'string') {
      setDepartments((prev) => prev.map((d) => (d.id === departmentOrId.id ? departmentOrId : d)));
    }
  };

  const toggleDepartmentStatus = (depId: string, status: Department['status']) => {
    // TODO: connect to Express API (PATCH /api/departments/:id/status)
    setDepartments((prev) => prev.map((d) => (d.id === depId ? { ...d, status } : d)));
  };

  // 9. Manage Patients
  const suspendPatient = (patientId: string) => {
    // TODO: connect to Express API (PATCH /api/patients/:id/suspend)
    setPatients((prev) =>
      prev.map((p) => (p.id === patientId ? { ...p, status: p.status === 'suspended' ? 'active' : 'suspended' } : p))
    );
  };

  const deletePatient = (patientId: string) => {
    // TODO: connect to Express API (DELETE /api/patients/:id)
    setPatients((prev) => prev.filter((p) => p.id !== patientId));
  };

  // 10. Messages
  const sendMessage = (conversationId: string, senderId: string, senderRole: 'patient' | 'doctor' | 'admin', receiverId: string, content: string) => {
    // TODO: connect to Express API (POST /api/messages)
    const conv = conversations.find((c) => c.id === conversationId);
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      conversationId,
      senderId,
      senderName: currentUser.name,
      senderRole,
      senderAvatar: currentUser.avatar,
      receiverId,
      receiverName: conv?.participantName || 'Recipient',
      content,
      isRead: false,
      sentAt: now,
    };

    setMessages((prev) => [...prev, newMsg]);

    // Update the conversation preview (last message + timestamp)
    setConversations((prev) =>
      prev.map((c) =>
        c.id === conversationId
          ? { ...c, lastMessage: content, lastMessageTime: now }
          : c
      )
    );
  };

  // 11. Add Medical Note
  const addMedicalNote = (record: Omit<MedicalRecord, 'id'>) => {
    // TODO: connect to Express API (POST /api/medical-records)
    const newRecord: MedicalRecord = {
      ...record,
      id: `rec-${Date.now()}`,
    };
    setMedicalRecords((prev) => [newRecord, ...prev]);
  };

  // 12. Add Doctor Rating
  const addRating = (ratingData: Omit<Rating, 'id' | 'date'>) => {
    // TODO: connect to Express API (POST /api/ratings)
    const newRating: Rating = {
      ...ratingData,
      id: `rat-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
    };
    setRatings((prev) => [newRating, ...prev]);

    // Recalculate doctor rating
    const docRatings = [...ratings, newRating].filter((r) => r.doctorId === ratingData.doctorId);
    const avg = docRatings.reduce((sum, r) => sum + r.stars, 0) / docRatings.length;

    setDoctors((prev) =>
      prev.map((d) => (d.id === ratingData.doctorId ? { ...d, rating: Number(avg.toFixed(1)), reviewCount: docRatings.length } : d))
    );

    // Mark appointment as rated
    setAppointments((prev) =>
      prev.map((a) => (a.doctorId === ratingData.doctorId && a.patientId === ratingData.patientId ? { ...a, isRated: true } : a))
    );
  };

  // 13. Update Doctor Schedule
  const updateDoctorSchedule = (doctorId: string, slots: TimeSlot[]) => {
    // TODO: connect to Express API (PUT /api/doctors/:id/schedule)
    setTimeSlots((prev) => {
      const remaining = prev.filter((s) => s.doctorId !== doctorId);
      return [...remaining, ...slots];
    });
  };

  // 14. Toggle Slot Lock
  const toggleSlotLock = (slotId: string) => {
    setTimeSlots((prev) =>
      prev.map((s) => (s.id === slotId ? { ...s, isLocked: !s.isLocked } : s))
    );
  };

  // 15. Toggle Patient Suspension
  const togglePatientSuspension = (patientId: string) => {
    setPatients((prev) =>
      prev.map((p) => (p.id === patientId ? { ...p, status: p.status === 'suspended' ? 'active' : 'suspended' } : p))
    );
  };

  // 16. Delete Department
  const deleteDepartment = (departmentId: string) => {
    setDepartments((prev) => prev.filter((d) => d.id !== departmentId));
  };

  // 17. System Settings
  const updateSystemSettings = (settings: Partial<SystemSettings>) => {
    // TODO: connect to Express API (PUT /api/admin/settings)
    setSystemSettings((prev) => ({ ...prev, ...settings }));
  };

  // 15. Notification
  const markNotificationRead = (notifId: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === notifId ? { ...n, isRead: true } : n)));
  };

  return (
    <DataContext.Provider
      value={{
        patients,
        departments,
        doctors,
        timeSlots,
        appointments,
        payments,
        conversations,
        messages,
        medicalRecords,
        ratings,
        notifications,
        systemSettings,
        bookAppointment,
        cancelAppointment,
        modifyAppointment,
        confirmAppointment,
        approveAppointment,
        rejectAppointment,
        completeAppointment,
        addDoctor,
        updateDoctor,
        deleteDoctor,
        addDepartment,
        updateDepartment,
        toggleDepartmentStatus,
        suspendPatient,
        deletePatient,
        sendMessage,
        addMedicalNote,
        addRating,
        updateDoctorSchedule,
        toggleSlotLock,
        togglePatientSuspension,
        deleteDepartment,
        updateSystemSettings,
        markNotificationRead,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
