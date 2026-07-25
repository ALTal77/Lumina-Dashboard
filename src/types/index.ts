export type UserRole = "patient" | "doctor" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  phone?: string;
  dob?: string;
  gender?: "Male" | "Female" | "Other";
  address?: string;
  status: "active" | "suspended";
}

export interface Patient extends User {
  bloodGroup?: string;
  isSuspended?: boolean;
  emergencyContact?: string;
  medicalHistory?: string[];
  allergies?: string[];
}

export interface Department {
  id: string;
  name: string;
  description: string;
  icon: string;
  status: "active" | "maintenance" | "closed";
  doctorCount: number;
  createdAt: string;
}

export interface Doctor {
  id: string;
  userId?: string;
  name: string;
  specialty: string;
  departmentId: string;
  departmentName?: string;
  phone: string;
  email: string;
  bio: string;
  profilePicture: string;
  yearsExperience: number;
  rating: number;
  reviewCount: number;
  languages: string[];
  consultationFee: number;
  availableDays: string[];
  isAvailableToday?: boolean;
}

export interface TimeSlot {
  id: string;
  doctorId: string;
  day:
    | "Monday"
    | "Tuesday"
    | "Wednesday"
    | "Thursday"
    | "Friday"
    | "Saturday"
    | "Sunday";
  dateStr?: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  isLocked?: boolean;
}

export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "rejected"
  | "completed"
  | "cancelled";

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  patientAvatar?: string;
  patientPhone?: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  doctorAvatar?: string;
  departmentName: string;
  date: string;
  timeSlot: string;
  status: AppointmentStatus;
  notes?: string;
  rejectionReason?: string;
  consultationFee: number;
  paymentStatus: "unpaid" | "paid" | "refunded";
  createdAt: string;
  isRated?: boolean;
}

export interface Payment {
  id: string;
  appointmentId: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  amount: number;
  paymentMethod:
    | "Credit Card"
    | "Debit Card"
    | "Apple Pay"
    | "Digital Wallet"
    | "Insurance";
  status: "completed" | "pending" | "failed" | "refunded";
  transactionId: string;
  createdAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  senderAvatar: string;
  receiverId: string;
  receiverName: string;
  content: string;
  isRead: boolean;
  appointmentId?: string;
  sentAt: string;
}

export interface Conversation {
  id: string;
  participantId: string;
  participantName: string;
  participantRole: UserRole;
  participantAvatar: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  date: string;
  diagnosis: string;
  note: string;
  prescription?: string;
  attachments?: string[];
}

export interface Rating {
  id: string;
  patientId: string;
  patientName: string;
  patientAvatar?: string;
  doctorId: string;
  stars: number;
  comment: string;
  date: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  type: "appointment" | "payment" | "system" | "message";
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  link?: string;
}

export interface SystemSettings {
  hospitalName: string;
  contactEmail: string;
  contactPhone: string;
  allowCancellationHours: number;
  maxBookingDaysInAdvance: number;
  currencySymbol: string;
  enableEmailNotifications: boolean;
  enableSmsNotifications: boolean;
  autoConfirmBookings: boolean;
  maxActiveBookingsPerPatient: number;
  defaultConsultationFee: number;
  emergencyNoticeBanner: string;
}
