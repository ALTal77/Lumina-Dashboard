// `row` = doctors row, optionally joined with department_name, available_days.
function mapDoctor(row) {
  const availableDays = row.available_days ? [...new Set(row.available_days.split(","))] : [];
  const todayEn = new Date().toLocaleDateString("en-US", { weekday: "long" });

  return {
    id: row.id,
    userId: row.user_id ? String(row.user_id) : undefined,
    name: row.name_en,
    specialty: row.specialty_en,
    departmentId: row.department_id,
    departmentName: row.department_name || undefined,
    phone: row.phone,
    email: row.email,
    bio: row.bio,
    profilePicture: row.image,
    yearsExperience: row.experience,
    rating: row.rating,
    reviewCount: row.reviews_count,
    languages: row.languages ? row.languages.split(",").map((l) => l.trim()) : [],
    consultationFee: row.fee,
    availableDays,
    isAvailableToday: availableDays.includes(todayEn),
    status: row.status,
    // Legacy bilingual fields, used by the public marketing site components.
    nameEn: row.name_en,
    nameAr: row.name_ar,
    specialtyEn: row.specialty_en,
    specialtyAr: row.specialty_ar,
    hospitalEn: row.hospital_en,
    hospitalAr: row.hospital_ar,
    image: row.image,
    reviewsCount: row.reviews_count,
    experience: row.experience,
    nextSlotEn: row.next_slot_en,
    nextSlotAr: row.next_slot_ar,
  };
}

function deriveDisplayPaymentStatus(row) {
  if (row.status === "cancelled" || row.status === "rejected") return "refunded";
  return row.payment_status === "paid" ? "paid" : "unpaid";
}

// `row` = bookings row, optionally joined with doctor_name, doctor_specialty,
// doctor_image, department_name, patient_name/avatar/phone.
function mapAppointment(row) {
  return {
    id: String(row.id),
    patientId: row.patient_user_id ? String(row.patient_user_id) : "",
    patientName: row.patient_name,
    patientAvatar: row.patient_avatar || undefined,
    patientPhone: row.phone,
    doctorId: row.doctor_id,
    doctorName: row.doctor_name || "",
    doctorSpecialty: row.doctor_specialty || "",
    doctorAvatar: row.doctor_image || undefined,
    departmentName: row.department_name || "General",
    date: row.date,
    timeSlot: row.time_slot,
    status: row.status,
    notes: row.notes || undefined,
    rejectionReason: row.rejection_reason || undefined,
    consultationFee: row.fee,
    paymentStatus: deriveDisplayPaymentStatus(row),
    createdAt: row.created_at,
    isRated: !!row.is_rated,
    // Also expose the raw booking reference/paymentId for receipts.
    reference: row.reference,
    paymentId: row.payment_id,
  };
}

function mapPayment(row) {
  let status = "pending";
  if (row.status === "cancelled" || row.status === "rejected") status = "refunded";
  else if (row.payment_status === "paid") status = "completed";

  return {
    id: row.payment_id,
    appointmentId: String(row.id),
    patientId: row.patient_user_id ? String(row.patient_user_id) : "",
    patientName: row.patient_name,
    doctorId: row.doctor_id,
    doctorName: row.doctor_name || "",
    amount: row.fee,
    paymentMethod: row.payment_method,
    status,
    transactionId: row.payment_id,
    createdAt: row.created_at,
  };
}

function mapDepartment(row) {
  return {
    id: row.id,
    name: row.name,
    description: row.description || "",
    icon: row.icon,
    status: row.status,
    doctorCount: row.doctor_count || 0,
    createdAt: row.created_at,
  };
}

function mapTimeSlot(row) {
  return {
    id: String(row.id),
    doctorId: row.doctor_id,
    day: row.day,
    startTime: row.start_time,
    endTime: row.end_time,
    isAvailable: !row.is_locked,
    isLocked: !!row.is_locked,
  };
}

function mapPatient(row) {
  return {
    id: String(row.id),
    name: row.full_name,
    email: row.email,
    role: "patient",
    avatar: row.avatar,
    phone: row.phone,
    dob: row.dob || undefined,
    address: row.address || undefined,
    status: row.status,
    // Extra fields the dashboard's Patient type allows.
    patientCode: row.patient_code,
    nationalId: row.national_id,
  };
}

function mapRecord(row) {
  return {
    id: String(row.id),
    patientId: row.patient_user_id ? String(row.patient_user_id) : "",
    patientName: row.patient_name || undefined,
    doctorId: row.doctor_id,
    doctorName: row.doctor_name || undefined,
    doctorSpecialty: row.doctor_specialty || undefined,
    date: row.created_at,
    diagnosis: row.diagnosis,
    note: row.notes || "",
    prescription: row.prescription || undefined,
  };
}

function mapRating(row) {
  return {
    id: String(row.id),
    patientId: row.patient_user_id ? String(row.patient_user_id) : "",
    patientName: row.patient_name || undefined,
    patientAvatar: row.patient_avatar || undefined,
    doctorId: row.doctor_id,
    stars: row.stars,
    comment: row.comment || "",
    date: row.created_at,
  };
}

function mapConversation(row) {
  return {
    id: String(row.id),
    participantId: row.participant_id != null ? String(row.participant_id) : "",
    participantName: row.participant_name || "",
    participantRole: row.participant_role,
    participantAvatar: row.participant_avatar || "",
    lastMessage: row.last_message || "",
    lastMessageTime: row.last_message_time || row.created_at,
    unreadCount: row.unread_count || 0,
  };
}

function mapMessage(row) {
  return {
    id: String(row.id),
    conversationId: String(row.conversation_id),
    senderId: String(row.sender_user_id),
    senderName: row.sender_name || "",
    senderRole: row.sender_role,
    senderAvatar: row.sender_avatar || "",
    receiverId: row.receiver_id != null ? String(row.receiver_id) : "",
    receiverName: row.receiver_name || "",
    content: row.body,
    isRead: !!row.is_read,
    createdAt: row.created_at,
    sentAt: row.created_at,
  };
}

function mapSettings(row) {
  return {
    hospitalName: row.hospital_name,
    contactEmail: row.contact_email,
    contactPhone: row.contact_phone,
    allowCancellationHours: row.allow_cancellation_hours,
    maxBookingDaysInAdvance: row.max_booking_days_in_advance,
    currencySymbol: row.currency_symbol,
    enableEmailNotifications: !!row.enable_email_notifications,
    enableSmsNotifications: !!row.enable_sms_notifications,
    autoConfirmBookings: !!row.auto_confirm_bookings,
    maxActiveBookingsPerPatient: row.max_active_bookings_per_patient,
    defaultConsultationFee: row.default_consultation_fee,
    emergencyNoticeBanner: row.emergency_notice_banner,
  };
}

module.exports = {
  mapDoctor,
  mapAppointment,
  mapPayment,
  mapDepartment,
  mapTimeSlot,
  mapPatient,
  mapRecord,
  mapRating,
  mapConversation,
  mapMessage,
  mapSettings,
};
