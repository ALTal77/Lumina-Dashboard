import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
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
  UserRole,
} from '../types';

import { getAllDoctors, getPublicDepartments, getDoctorSlots } from '../api/doctors';
import { createBooking } from '../api/bookings';
import * as adminApi from '../api/admin';
import * as doctorApi from '../api/doctorPortal';
import * as patientApi from '../api/patientPortal';
import { getPublicSettings } from '../api/contact';
import { mockNotifications } from '../data/mockData';
import { mockNotificationsAr } from '../data/mockData-ar';
import { ApiError } from '../api/client';

interface DataContextType {
  isLoading: boolean;
  error: string | null;
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

  refresh: () => Promise<void>;

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

  cancelAppointment: (appointmentId: string, reason?: string) => Promise<void>;
  modifyAppointment: (appointmentId: string, newDate: string, newTimeSlot: string) => Promise<void>;
  confirmAppointment: (appointmentId: string) => Promise<void>;
  approveAppointment: (appointmentId: string) => Promise<void>;
  rejectAppointment: (appointmentId: string, reason: string) => Promise<void>;
  completeAppointment: (appointmentId: string) => Promise<void>;

  addDoctor: (doctor: Omit<Doctor, 'id' | 'rating' | 'reviewCount'>) => Promise<void>;
  updateDoctor: (doctorOrId: Doctor | string, data?: Partial<Omit<Doctor, 'id' | 'rating' | 'reviewCount'>>) => Promise<void>;
  deleteDoctor: (doctorId: string) => Promise<void>;

  addDepartment: (department: Omit<Department, 'id' | 'doctorCount' | 'createdAt'>) => Promise<void>;
  updateDepartment: (departmentOrId: Department | string, data?: Partial<Omit<Department, 'id' | 'doctorCount' | 'createdAt'>>) => Promise<void>;
  toggleDepartmentStatus: (departmentId: string, status: Department['status']) => Promise<void>;
  deleteDepartment: (departmentId: string) => Promise<void>;

  suspendPatient: (patientId: string) => Promise<void>;
  deletePatient: (patientId: string) => Promise<void>;

  toggleSlotLock: (slotId: string) => Promise<void>;
  togglePatientSuspension: (patientId: string) => Promise<void>;
  sendMessage: (conversationId: string, senderId: string, senderRole: 'patient' | 'doctor' | 'admin', receiverId: string, content: string) => Promise<void>;
  addMedicalNote: (record: Omit<MedicalRecord, 'id'>) => Promise<void>;
  addRating: (rating: Omit<Rating, 'id' | 'date'> & { appointmentId?: string | number }) => Promise<void>;
  updateDoctorSchedule: (doctorId: string, slots: TimeSlot[]) => Promise<void>;
  updateSystemSettings: (settings: Partial<SystemSettings>) => Promise<void>;
  markNotificationRead: (notificationId: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { i18n } = useTranslation();
  const { user: currentUser, role, isAuthenticated } = useAuth();
  const isAr = i18n.language === 'ar';
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [patients, setPatients] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>(isAr ? mockNotificationsAr : mockNotifications);
  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    hospitalName: 'Lumina Health',
    contactEmail: 'care@luminahealth.sy',
    contactPhone: '+963 11 333 4400',
    allowCancellationHours: 24,
    maxBookingDaysInAdvance: 60,
    currencySymbol: '$',
    enableEmailNotifications: true,
    enableSmsNotifications: false,
    autoConfirmBookings: false,
    maxActiveBookingsPerPatient: 3,
    defaultConsultationFee: 120,
    emergencyNoticeBanner: 'Hospital operations normal. No emergency alerts.',
  });

  const loadedForRef = useRef<string | null>(null);

  interface LoadedData {
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
    systemSettings: SystemSettings;
  }

  const loadDataForRole = useCallback(async (r: UserRole): Promise<Partial<LoadedData>> => {
    const result: Partial<LoadedData> = {};

    const [docRes, deptRes, settingsRes] = await Promise.all([
      getAllDoctors(),
      getPublicDepartments(),
      getPublicSettings().catch(() => null),
    ]);
    result.doctors = docRes.doctors;
    result.departments = deptRes.departments;
    if (settingsRes) result.systemSettings = settingsRes.settings;

    if (r === 'patient') {
      const [aptRes, recRes, ratRes, convRes, slotRes] = await Promise.all([
        patientApi.getPatientAppointments(),
        patientApi.getPatientRecords(),
        patientApi.getPatientRatings(),
        patientApi.getPatientConversations(),
        Promise.all(docRes.doctors.map((d) => getDoctorSlots(d.id).catch(() => ({ slots: [] as TimeSlot[] })))),
      ]);
      result.appointments = aptRes.appointments;
      result.medicalRecords = recRes.records;
      result.ratings = ratRes.ratings;
      result.conversations = convRes.conversations;
      result.timeSlots = slotRes.flatMap((s) => s.slots);

      const msgPromises = convRes.conversations.map((c) =>
        patientApi.getPatientConversationMessages(c.id).catch(() => ({ messages: [] as Message[] })),
      );
      const msgRes = await Promise.all(msgPromises);
      result.messages = msgRes.flatMap((m) => m.messages);
    } else if (r === 'doctor') {
      const [meRes, aptRes, schRes, patRes, recRes, convRes] = await Promise.all([
        doctorApi.getDoctorMe(),
        doctorApi.getDoctorAppointments(),
        doctorApi.getDoctorSchedule(),
        doctorApi.getDoctorPatients(),
        doctorApi.getDoctorRecords(),
        doctorApi.getDoctorConversations(),
      ]);
      result.appointments = aptRes.appointments;
      result.timeSlots = schRes.slots;
      result.patients = patRes.patients;
      result.medicalRecords = recRes.records;
      result.conversations = convRes.conversations;

      const msgPromises = convRes.conversations.map((c) =>
        doctorApi.getDoctorConversationMessages(c.id).catch(() => ({ messages: [] as Message[] })),
      );
      const msgRes = await Promise.all(msgPromises);
      // Backend returns the doctor's numeric user id as senderId; the dashboard compares
      // msg.senderId === user.id where user.id is the doctor profile id (doc-N). Normalize
      // doctor-sent messages so they render on the correct side.
      const doctorId = meRes.doctor.id;
      const normalized = msgRes.flatMap((m) =>
        m.messages.map((msg) =>
          msg.senderRole === 'doctor' ? { ...msg, senderId: doctorId } : msg,
        ),
      );
      result.messages = normalized;
    } else if (r === 'admin') {
      const [patRes, aptRes, payRes, adminDoctors, adminDepts, adminSettings] = await Promise.all([
        adminApi.getAdminPatients(),
        adminApi.getAdminAppointments(),
        adminApi.getAdminPayments(),
        adminApi.getAdminDoctors(),
        adminApi.getAdminDepartments(),
        adminApi.getAdminSettings(),
      ]);
      result.patients = patRes.patients;
      result.appointments = aptRes.appointments;
      result.payments = payRes.payments;
      result.doctors = adminDoctors.doctors;
      result.departments = adminDepts.departments;
      result.systemSettings = adminSettings.settings;
      result.conversations = [];
      result.messages = [];
      result.timeSlots = [];
      result.medicalRecords = [];
      result.ratings = [];
    }

    return result;
  }, []);

  const applyData = useCallback((data: Partial<LoadedData>) => {
    if (data.patients !== undefined) setPatients(data.patients);
    if (data.departments !== undefined) setDepartments(data.departments);
    if (data.doctors !== undefined) setDoctors(data.doctors);
    if (data.timeSlots !== undefined) setTimeSlots(data.timeSlots);
    if (data.appointments !== undefined) setAppointments(data.appointments);
    if (data.payments !== undefined) setPayments(data.payments);
    if (data.conversations !== undefined) setConversations(data.conversations);
    if (data.messages !== undefined) setMessages(data.messages);
    if (data.medicalRecords !== undefined) setMedicalRecords(data.medicalRecords);
    if (data.ratings !== undefined) setRatings(data.ratings);
    if (data.systemSettings !== undefined) setSystemSettings(data.systemSettings);
  }, []);

  const load = useCallback(async () => {
    if (!isAuthenticated || !role) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await loadDataForRole(role);
      applyData(data);
      loadedForRef.current = role;
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, role, loadDataForRole, applyData]);

  useEffect(() => {
    if (isAuthenticated && role) {
      load();
    }
  }, [isAuthenticated, role, load]);

  const refresh = useCallback(async () => {
    await load();
  }, [load]);

  const isAdmin = role === 'admin';
  const isDoctor = role === 'doctor';
  const isPatient = role === 'patient';

  // 1. Book Appointment (public endpoint - creates booking linked to logged-in patient)
  const bookAppointment: DataContextType['bookAppointment'] = async (data) => {
    const res = await createBooking({
      doctorId: data.doctorId,
      patientName: data.patientName,
      phone: currentUser?.phone || undefined,
      date: data.date,
      timeSlot: data.timeSlot,
      notes: data.notes,
      paymentMethod: data.paymentMethod,
      consultationFee: data.consultationFee,
    });
    setAppointments((prev) => [res.appointment, ...prev.filter((a) => a.id !== res.appointment.id)]);
    if (isPatient) {
      setPayments((prev) => [
        ...prev,
        {
          id: res.paymentId,
          appointmentId: res.appointmentId,
          patientId: res.appointment.patientId,
          patientName: res.appointment.patientName,
          doctorId: res.appointment.doctorId,
          doctorName: res.appointment.doctorName,
          amount: res.appointment.consultationFee,
          paymentMethod: (data.paymentMethod as Payment['paymentMethod']) || 'Credit Card',
          status: 'completed',
          transactionId: res.paymentId,
          createdAt: res.appointment.createdAt,
        },
      ]);
    }
    return { appointmentId: res.appointmentId, paymentId: res.paymentId };
  };

  // 2. Cancel Appointment
  const cancelAppointment: DataContextType['cancelAppointment'] = async (appointmentId, reason) => {
    let appointment: Appointment;
    if (isPatient) {
      const res = await patientApi.cancelPatientAppointment(appointmentId, reason);
      appointment = res.appointment;
    } else if (isAdmin) {
      const res = await adminApi.cancelAdminAppointment(appointmentId, reason);
      appointment = res.appointment;
    } else {
      throw new ApiError(403, 'You do not have permission to cancel this appointment');
    }
    setAppointments((prev) => prev.map((a) => (a.id === appointment.id ? appointment : a)));
  };

  // 3. Modify Appointment (patient)
  const modifyAppointment: DataContextType['modifyAppointment'] = async (appointmentId, newDate, newTimeSlot) => {
    if (!isPatient) throw new ApiError(403, 'Only patients can reschedule appointments');
    const res = await patientApi.modifyPatientAppointment(appointmentId, { date: newDate, timeSlot: newTimeSlot });
    setAppointments((prev) => prev.map((a) => (a.id === res.appointment.id ? res.appointment : a)));
  };

  // 4. Confirm/Approve Appointment
  const confirmAppointment: DataContextType['confirmAppointment'] = async (appointmentId) => {
    let appointment: Appointment;
    if (isDoctor) {
      const res = await doctorApi.approveDoctorAppointment(appointmentId);
      appointment = res.appointment;
    } else if (isAdmin) {
      const res = await adminApi.approveAdminAppointment(appointmentId);
      appointment = res.appointment;
    } else {
      throw new ApiError(403, 'You do not have permission to approve appointments');
    }
    setAppointments((prev) => prev.map((a) => (a.id === appointment.id ? appointment : a)));
  };

  // 4b. Approve Appointment (alias)
  const approveAppointment: DataContextType['approveAppointment'] = confirmAppointment;

  // 5. Reject Appointment (doctor)
  const rejectAppointment: DataContextType['rejectAppointment'] = async (appointmentId, reason) => {
    if (!isDoctor) throw new ApiError(403, 'Only doctors can reject appointments');
    const res = await doctorApi.rejectDoctorAppointment(appointmentId, reason);
    setAppointments((prev) => prev.map((a) => (a.id === res.appointment.id ? res.appointment : a)));
  };

  // 6. Complete Appointment (doctor)
  const completeAppointment: DataContextType['completeAppointment'] = async (appointmentId) => {
    if (!isDoctor) throw new ApiError(403, 'Only doctors can complete appointments');
    const res = await doctorApi.completeDoctorAppointment(appointmentId);
    setAppointments((prev) => prev.map((a) => (a.id === res.appointment.id ? res.appointment : a)));
  };

  // 7. Manage Doctors (admin)
  const addDoctor: DataContextType['addDoctor'] = async (doctorData) => {
    if (!isAdmin) throw new ApiError(403, 'Admin access required');
    const res = await adminApi.createAdminDoctor({
      name: doctorData.name,
      email: doctorData.email,
      specialty: doctorData.specialty,
      departmentId: doctorData.departmentId,
      yearsExperience: doctorData.yearsExperience,
      consultationFee: doctorData.consultationFee,
      phone: doctorData.phone,
      languages: doctorData.languages,
      bio: doctorData.bio,
      profilePicture: doctorData.profilePicture,
      availableDays: doctorData.availableDays,
    });
    setDoctors((prev) => [res.doctor, ...prev.filter((d) => d.id !== res.doctor.id)]);
    await refresh();
  };

  const updateDoctor: DataContextType['updateDoctor'] = async (doctorOrId, data) => {
    if (!isAdmin) throw new ApiError(403, 'Admin access required');
    const id = typeof doctorOrId === 'string' ? doctorOrId : doctorOrId.id;
    const updates = typeof doctorOrId === 'string' ? data : doctorOrId;
    if (!updates) throw new ApiError(400, 'No updates provided');
    const payload: adminApi.DoctorUpdateRequest = {};
    if (updates.name) payload.name = updates.name;
    if (updates.email) payload.email = updates.email;
    if (updates.specialty) payload.specialty = updates.specialty;
    if (updates.departmentId) payload.departmentId = updates.departmentId;
    if (updates.yearsExperience != null) payload.yearsExperience = updates.yearsExperience;
    if (updates.consultationFee != null) payload.consultationFee = updates.consultationFee;
    if (updates.phone) payload.phone = updates.phone;
    if (updates.languages) payload.languages = updates.languages;
    if (updates.bio) payload.bio = updates.bio;
    if (updates.profilePicture) payload.profilePicture = updates.profilePicture;
    if (updates.availableDays) payload.availableDays = updates.availableDays;
    const res = await adminApi.updateAdminDoctor(id, payload);
    setDoctors((prev) => prev.map((d) => (d.id === res.doctor.id ? res.doctor : d)));
    await refresh();
  };

  const deleteDoctor: DataContextType['deleteDoctor'] = async (doctorId) => {
    if (!isAdmin) throw new ApiError(403, 'Admin access required');
    await adminApi.deleteAdminDoctor(doctorId);
    setDoctors((prev) => prev.filter((d) => d.id !== doctorId));
    await refresh();
  };

  // 8. Manage Departments (admin)
  const addDepartment: DataContextType['addDepartment'] = async (depData) => {
    if (!isAdmin) throw new ApiError(403, 'Admin access required');
    const res = await adminApi.createAdminDepartment({
      name: depData.name,
      description: depData.description,
      icon: depData.icon,
      status: depData.status,
    });
    setDepartments((prev) => [...prev.filter((d) => d.id !== res.department.id), res.department]);
    await refresh();
  };

  const updateDepartment: DataContextType['updateDepartment'] = async (departmentOrId, data) => {
    if (!isAdmin) throw new ApiError(403, 'Admin access required');
    const id = typeof departmentOrId === 'string' ? departmentOrId : departmentOrId.id;
    const updates = typeof departmentOrId === 'string' ? data : departmentOrId;
    if (!updates) throw new ApiError(400, 'No updates provided');
    const payload: Partial<adminApi.DepartmentRequest> = {};
    if (updates.name) payload.name = updates.name;
    if (updates.description !== undefined) payload.description = updates.description;
    if (updates.icon) payload.icon = updates.icon;
    if (updates.status) payload.status = updates.status;
    const res = await adminApi.updateAdminDepartment(id, payload);
    setDepartments((prev) => prev.map((d) => (d.id === res.department.id ? res.department : d)));
    await refresh();
  };

  const toggleDepartmentStatus: DataContextType['toggleDepartmentStatus'] = async (departmentId, status) => {
    if (!isAdmin) throw new ApiError(403, 'Admin access required');
    const res = await adminApi.toggleDepartmentStatus(departmentId, status);
    setDepartments((prev) => prev.map((d) => (d.id === res.department.id ? res.department : d)));
    await refresh();
  };

  const deleteDepartment: DataContextType['deleteDepartment'] = async (departmentId) => {
    if (!isAdmin) throw new ApiError(403, 'Admin access required');
    await adminApi.deleteAdminDepartment(departmentId);
    setDepartments((prev) => prev.filter((d) => d.id !== departmentId));
    await refresh();
  };

  // 9. Manage Patients (admin)
  const suspendPatient: DataContextType['suspendPatient'] = async (patientId) => {
    if (!isAdmin) throw new ApiError(403, 'Admin access required');
    const res = await adminApi.suspendPatient(patientId);
    setPatients((prev) => prev.map((p) => (p.id === res.patient.id ? res.patient : p)));
  };

  const togglePatientSuspension: DataContextType['togglePatientSuspension'] = suspendPatient;

  const deletePatient: DataContextType['deletePatient'] = async (patientId) => {
    if (!isAdmin) throw new ApiError(403, 'Admin access required');
    await adminApi.deleteAdminPatient(patientId);
    setPatients((prev) => prev.filter((p) => p.id !== patientId));
  };

  // 10. Messages
  const sendMessage: DataContextType['sendMessage'] = async (conversationId, senderId, senderRole, receiverId, content) => {
    let message: Message;
    if (isPatient && senderRole === 'patient') {
      const res = await patientApi.sendPatientMessage(conversationId, content);
      message = res.message;
    } else if (isDoctor && senderRole === 'doctor') {
      const res = await doctorApi.sendDoctorMessage(conversationId, content);
      // Normalize doctor senderId to the doctor profile id so the UI sides it correctly.
      message = res.message.senderRole === 'doctor' && currentUser ? { ...res.message, senderId: currentUser.id } : res.message;
    } else {
      // TODO: BACKEND-MISSING — admin messaging requires an admin messaging endpoint.
      throw new ApiError(501, 'Messaging for this role is not yet implemented on the backend');
    }
    setMessages((prev) => [...prev, message]);
    setConversations((prev) =>
      prev.map((c) =>
        c.id === conversationId
          ? {
              ...c,
              lastMessage: message.content,
              lastMessageTime: message.sentAt,
              unreadCount: 0,
            }
          : c,
      ),
    );
  };

  // 11. Add Medical Note (doctor)
  const addMedicalNote: DataContextType['addMedicalNote'] = async (record) => {
    if (!isDoctor) throw new ApiError(403, 'Only doctors can add medical records');
    const res = await doctorApi.addDoctorRecord(record.patientId, {
      diagnosis: record.diagnosis,
      prescription: record.prescription,
      note: record.note,
    });
    setMedicalRecords((prev) => [res.record, ...prev]);
  };

  // 12. Add Doctor Rating (patient)
  const addRating: DataContextType['addRating'] = async (ratingData) => {
    if (!isPatient) throw new ApiError(403, 'Only patients can rate appointments');
    if (ratingData.appointmentId == null) {
      // TODO: BACKEND-MISSING — the patient ratings endpoint requires appointmentId, but the
      // current rating UI does not always pass it. Backend needs an endpoint that rates by
      // doctor without an associated booking, OR callers must supply appointmentId.
      throw new ApiError(400, 'appointmentId is required to submit a rating');
    }
    const res = await patientApi.addPatientRating({
      appointmentId: ratingData.appointmentId,
      stars: ratingData.stars,
      comment: ratingData.comment,
    });
    setRatings((prev) => [res.rating, ...prev]);
    setAppointments((prev) =>
      prev.map((a) =>
        a.doctorId === ratingData.doctorId && a.patientId === ratingData.patientId
          ? { ...a, isRated: true }
          : a,
      ),
    );
  };

  // 13. Update Doctor Schedule
  const updateDoctorSchedule: DataContextType['updateDoctorSchedule'] = async () => {
    // TODO: BACKEND-MISSING — there is no bulk schedule update endpoint. Only per-slot
    // toggling is supported via PATCH /api/doctor/schedule/:slotId/toggle-lock.
    throw new ApiError(501, 'Bulk schedule editing is not yet implemented on the backend. Use individual slot lock/unlock instead.');
  };

  // 14. Toggle Slot Lock (doctor)
  const toggleSlotLock: DataContextType['toggleSlotLock'] = async (slotId) => {
    if (!isDoctor) throw new ApiError(403, 'Only doctors can manage their schedule');
    const res = await doctorApi.toggleSlotLock(slotId);
    setTimeSlots((prev) =>
      prev.map((s) => (s.id === res.slot.id ? res.slot : s)),
    );
  };

  // 16. System Settings (admin)
  const updateSystemSettings: DataContextType['updateSystemSettings'] = async (settings) => {
    if (!isAdmin) throw new ApiError(403, 'Admin access required');
    const res = await adminApi.updateAdminSettings(settings);
    setSystemSettings(res.settings);
  };

  // 15. Notification (local only — no backend endpoint yet)
  const markNotificationRead = (notifId: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === notifId ? { ...n, isRead: true } : n)));
  };

  const value: DataContextType = {
    isLoading,
    error,
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
    // No backend notifications endpoint exists yet; keep the mock so the bell UI works.
    notifications,
    systemSettings,
    refresh,
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
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
