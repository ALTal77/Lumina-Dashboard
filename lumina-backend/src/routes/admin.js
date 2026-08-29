const express = require("express");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { body, param } = require("express-validator");
const db = require("../db");
const validate = require("../middleware/validate");
const { authenticate, requireRole } = require("../middleware/auth");
const {
  mapDoctor, mapDepartment, mapPatient, mapAppointment, mapPayment, mapSettings,
} = require("../utils/mappers");
const { APPOINTMENT_SELECT } = require("../utils/sql");

const router = express.Router();
router.use(authenticate, requireRole("admin"));

const DOCTOR_SELECT = `
  SELECT d.*, dep.name AS department_name,
    (SELECT GROUP_CONCAT(DISTINCT day) FROM time_slots ts WHERE ts.doctor_id = d.id AND ts.is_locked = 0) AS available_days
  FROM doctors d LEFT JOIN departments dep ON dep.id = d.department_id
`;
const DEPARTMENT_SELECT = `
  SELECT dep.*, (SELECT COUNT(*) FROM doctors d WHERE d.department_id = dep.id) AS doctor_count
  FROM departments dep
`;

// ---------------------------------------------------------------------------
// Overview
// ---------------------------------------------------------------------------

router.get("/overview", (req, res) => {
  const doctors = db.prepare("SELECT COUNT(*) AS c FROM doctors WHERE status = 'active'").get().c;
  const departments = db.prepare("SELECT COUNT(*) AS c FROM departments WHERE status = 'active'").get().c;
  const patients = db.prepare("SELECT COUNT(*) AS c FROM users WHERE role = 'patient'").get().c;
  const appointments = db.prepare("SELECT COUNT(*) AS c FROM bookings").get().c;
  const pending = db.prepare("SELECT COUNT(*) AS c FROM bookings WHERE status = 'pending'").get().c;
  const revenue = db
    .prepare("SELECT COALESCE(SUM(fee), 0) AS total FROM bookings WHERE payment_status = 'paid' AND status != 'cancelled' AND status != 'rejected'")
    .get().total;

  res.json({ doctors, departments, patients, appointments, pendingAppointments: pending, grossRevenue: revenue });
});

// ---------------------------------------------------------------------------
// Doctors (full CRUD) - field names match types/index.ts Doctor exactly
// ---------------------------------------------------------------------------

router.get("/doctors", (req, res) => {
  const rows = db.prepare(`${DOCTOR_SELECT} ORDER BY d.name_en`).all();
  res.json({ doctors: rows.map(mapDoctor) });
});

const DEFAULT_SLOTS = [
  ["09:00 AM", "09:30 AM"], ["10:30 AM", "11:00 AM"], ["01:00 PM", "01:30 PM"],
  ["02:30 PM", "03:00 PM"], ["04:00 PM", "04:30 PM"], ["06:00 PM", "06:30 PM"],
];

const DAY_ABBR_TO_FULL = {
  Mon: "Monday", Tue: "Tuesday", Wed: "Wednesday", Thu: "Thursday",
  Fri: "Friday", Sat: "Saturday", Sun: "Sunday",
};

function normalizeDays(days) {
  if (!Array.isArray(days)) return null;
  const result = [];
  for (const raw of days) {
    const value = String(raw).trim();
    const full = DAY_ABBR_TO_FULL[value] || value;
    const fullName = Object.values(DAY_ABBR_TO_FULL).includes(full) ? full : null;
    if (!fullName) return null;
    if (!result.includes(fullName)) result.push(fullName);
  }
  return result.sort((a, b) =>
    Object.values(DAY_ABBR_TO_FULL).indexOf(a) - Object.values(DAY_ABBR_TO_FULL).indexOf(b),
  );
}

router.post(
  "/doctors",
  [
    body("name").isString().trim().isLength({ min: 2, max: 120 }),
    body("email").isEmail().normalizeEmail(),
    body("specialty").isString().trim().isLength({ min: 2, max: 100 }),
    body("departmentId").optional({ nullable: true }).isString().trim(),
    body("yearsExperience").optional({ nullable: true }).isInt({ min: 0, max: 60 }),
    body("consultationFee").optional({ nullable: true }).isFloat({ min: 0 }),
    body("phone").optional({ nullable: true }).isString().trim(),
    body("languages").optional({ nullable: true }).isArray(),
    body("bio").optional({ nullable: true }).isString().trim(),
    body("profilePicture").optional({ nullable: true }).isString().trim(),
    body("availableDays").optional({ nullable: true }).isArray(),
  ],
  validate,
  (req, res) => {
    const {
      name, email, phone, specialty, departmentId,
      yearsExperience = 0, consultationFee = 100, bio = null, languages = [],
      availableDays = ["Monday", "Wednesday", "Friday"],
      profilePicture = "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=600",
    } = req.body;

    const days = normalizeDays(availableDays);
    if (!days) {
      return res.status(400).json({ error: "availableDays must be valid day names (e.g. Monday..Sunday)" });
    }

    if (db.prepare("SELECT id FROM users WHERE email = ?").get(email)) {
      return res.status(409).json({ error: "An account with this email already exists" });
    }

    const tempPassword = crypto.randomBytes(4).toString("hex");
    const displayName = name.startsWith("Dr.") ? name : `Dr. ${name}`;
    const avatar = `https://ui-avatars.com/api/?background=0D9488&color=fff&name=${encodeURIComponent(displayName)}`;

    const userId = db
      .prepare(`INSERT INTO users (email, password_hash, role, full_name, phone, avatar) VALUES (?, ?, 'doctor', ?, ?, ?)`)
      .run(email, bcrypt.hashSync(tempPassword, 10), name.replace(/^Dr\.\s*/, ""), phone || null, avatar).lastInsertRowid;

    const doctorId = `doc-${crypto.randomUUID().slice(0, 8)}`;

    db.prepare(
      `INSERT INTO doctors (
        id, user_id, department_id, name_en, name_ar, specialty_en, specialty_ar,
        hospital_en, hospital_ar, image, email, phone, fee, bio, languages,
        status, rating, reviews_count, experience, next_slot_en, next_slot_ar
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'Lumina Central Campus', 'لومينا - الحرم المركزي', ?, ?, ?, ?, ?, ?, 'active', 0, 0, ?, '', '')`,
    ).run(
      doctorId, userId, departmentId || null, displayName, displayName, specialty, specialty,
      profilePicture, email, phone || null, consultationFee, bio, (languages || []).join(", "), yearsExperience,
    );

    const insertSlot = db.prepare(`INSERT INTO time_slots (doctor_id, day, start_time, end_time, is_locked) VALUES (?, ?, ?, ?, 0)`);
    for (const day of days) {
      for (const [start, end] of DEFAULT_SLOTS) insertSlot.run(doctorId, day, start, end);
    }

    const row = db.prepare(`${DOCTOR_SELECT} WHERE d.id = ?`).get(doctorId);
    res.status(201).json({ doctor: mapDoctor(row), temporaryPassword: tempPassword });
  },
);

router.put("/doctors/:id", [param("id").isString().notEmpty()], validate, (req, res) => {
  const existing = db.prepare("SELECT * FROM doctors WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Doctor not found" });

  const b = req.body;
  const fields = {
    name_en: b.name ?? existing.name_en,
    name_ar: b.name ?? existing.name_ar,
    specialty_en: b.specialty ?? existing.specialty_en,
    specialty_ar: b.specialty ?? existing.specialty_ar,
    department_id: b.departmentId ?? existing.department_id,
    email: b.email ?? existing.email,
    phone: b.phone ?? existing.phone,
    fee: b.consultationFee ?? existing.fee,
    bio: b.bio ?? existing.bio,
    languages: Array.isArray(b.languages) ? b.languages.join(", ") : existing.languages,
    experience: b.yearsExperience ?? existing.experience,
    status: b.status ?? existing.status,
    image: b.profilePicture ?? existing.image,
  };

  db.prepare(
    `UPDATE doctors SET name_en=?, name_ar=?, specialty_en=?, specialty_ar=?, department_id=?,
      email=?, phone=?, fee=?, bio=?, languages=?, experience=?, status=?, image=?
     WHERE id = ?`,
  ).run(
    fields.name_en, fields.name_ar, fields.specialty_en, fields.specialty_ar, fields.department_id,
    fields.email, fields.phone, fields.fee, fields.bio, fields.languages, fields.experience,
    fields.status, fields.image, req.params.id,
  );

  if (Array.isArray(b.availableDays)) {
    const days = normalizeDays(b.availableDays);
    if (!days) {
      return res.status(400).json({ error: "availableDays must be valid day names (e.g. Monday..Sunday)" });
    }
    db.prepare("DELETE FROM time_slots WHERE doctor_id = ?").run(req.params.id);
    const insertSlot = db.prepare(`INSERT INTO time_slots (doctor_id, day, start_time, end_time, is_locked) VALUES (?, ?, ?, ?, 0)`);
    for (const day of days) {
      for (const [start, end] of DEFAULT_SLOTS) insertSlot.run(req.params.id, day, start, end);
    }
  }

  const row = db.prepare(`${DOCTOR_SELECT} WHERE d.id = ?`).get(req.params.id);
  res.json({ doctor: mapDoctor(row) });
});

router.delete("/doctors/:id", [param("id").isString().notEmpty()], validate, (req, res) => {
  const existing = db.prepare("SELECT * FROM doctors WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Doctor not found" });

  db.prepare("DELETE FROM time_slots WHERE doctor_id = ?").run(req.params.id);
  db.prepare("UPDATE bookings SET status = 'cancelled', rejection_reason = 'Doctor profile was removed' WHERE doctor_id = ? AND status IN ('pending','confirmed')").run(req.params.id);
  db.prepare("DELETE FROM doctors WHERE id = ?").run(req.params.id);
  if (existing.user_id) db.prepare("DELETE FROM users WHERE id = ?").run(existing.user_id);

  res.json({ message: "Doctor removed" });
});

// ---------------------------------------------------------------------------
// Departments (full CRUD)
// ---------------------------------------------------------------------------

router.get("/departments", (req, res) => {
  const rows = db.prepare(`${DEPARTMENT_SELECT} ORDER BY dep.name`).all();
  res.json({ departments: rows.map(mapDepartment) });
});

router.post(
  "/departments",
  [
    body("name").isString().trim().isLength({ min: 2, max: 100 }),
    body("status").optional().isIn(["active", "maintenance", "closed"]),
    body("description").optional({ nullable: true }).isString().trim(),
    body("icon").optional({ nullable: true }).isString().trim(),
  ],
  validate,
  (req, res) => {
    const { name, status = "active", description = "", icon = "Stethoscope" } = req.body;
    if (db.prepare("SELECT id FROM departments WHERE name = ?").get(name)) {
      return res.status(409).json({ error: "A department with this name already exists" });
    }

    const maxId = db.prepare("SELECT id FROM departments ORDER BY CAST(SUBSTR(id, 5) AS INTEGER) DESC LIMIT 1").get();
    const nextNum = maxId ? parseInt(maxId.id.split("-")[1], 10) + 1 : 1;
    const id = `dep-${nextNum}`;

    db.prepare("INSERT INTO departments (id, name, description, icon, status) VALUES (?, ?, ?, ?, ?)").run(
      id, name, description, icon, status,
    );

    const row = db.prepare(`${DEPARTMENT_SELECT} WHERE dep.id = ?`).get(id);
    res.status(201).json({ department: mapDepartment(row) });
  },
);

router.put("/departments/:id", [param("id").isString().notEmpty()], validate, (req, res) => {
  const existing = db.prepare("SELECT * FROM departments WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Department not found" });

  const name = req.body.name ?? existing.name;
  const status = req.body.status ?? existing.status;
  const description = req.body.description ?? existing.description;
  const icon = req.body.icon ?? existing.icon;

  db.prepare("UPDATE departments SET name=?, description=?, icon=?, status=? WHERE id=?").run(
    name, description, icon, status, req.params.id,
  );

  const row = db.prepare(`${DEPARTMENT_SELECT} WHERE dep.id = ?`).get(req.params.id);
  res.json({ department: mapDepartment(row) });
});

router.patch("/departments/:id/status", [param("id").isString().notEmpty(), body("status").isIn(["active", "maintenance", "closed"])], validate, (req, res) => {
  const existing = db.prepare("SELECT * FROM departments WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Department not found" });
  db.prepare("UPDATE departments SET status = ? WHERE id = ?").run(req.body.status, req.params.id);
  const row = db.prepare(`${DEPARTMENT_SELECT} WHERE dep.id = ?`).get(req.params.id);
  res.json({ department: mapDepartment(row) });
});

router.delete("/departments/:id", [param("id").isString().notEmpty()], validate, (req, res) => {
  const existing = db.prepare("SELECT * FROM departments WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Department not found" });
  db.prepare("DELETE FROM departments WHERE id = ?").run(req.params.id);
  res.json({ message: "Department removed" });
});

// ---------------------------------------------------------------------------
// Patients (list + suspend/reactivate + delete)
// ---------------------------------------------------------------------------

router.get("/patients", (req, res) => {
  const rows = db.prepare("SELECT * FROM users WHERE role = 'patient' ORDER BY created_at DESC").all();
  res.json({ patients: rows.map(mapPatient) });
});

router.patch("/patients/:id/suspend", [param("id").isInt()], validate, (req, res) => {
  const patient = db.prepare("SELECT * FROM users WHERE id = ? AND role = 'patient'").get(req.params.id);
  if (!patient) return res.status(404).json({ error: "Patient not found" });

  const status = patient.status === "suspended" ? "active" : "suspended";
  db.prepare("UPDATE users SET status = ? WHERE id = ?").run(status, req.params.id);
  res.json({ patient: mapPatient({ ...patient, status }) });
});

router.delete("/patients/:id", [param("id").isInt()], validate, (req, res) => {
  const patient = db.prepare("SELECT * FROM users WHERE id = ? AND role = 'patient'").get(req.params.id);
  if (!patient) return res.status(404).json({ error: "Patient not found" });
  db.prepare("DELETE FROM users WHERE id = ?").run(req.params.id);
  res.json({ message: "Patient removed" });
});

// ---------------------------------------------------------------------------
// Appointments
// ---------------------------------------------------------------------------

router.get("/appointments", (req, res) => {
  const { status, search = "" } = req.query;
  let sql = `${APPOINTMENT_SELECT} WHERE 1 = 1`;
  const args = [];

  if (status && status !== "all") {
    sql += " AND b.status = ?";
    args.push(status);
  }
  if (search) {
    sql += " AND (b.patient_name LIKE ? OR d.name_en LIKE ? OR b.reference LIKE ?)";
    const like = `%${search}%`;
    args.push(like, like, like);
  }
  sql += " ORDER BY b.created_at DESC";

  const rows = db.prepare(sql).all(...args);
  res.json({ appointments: rows.map(mapAppointment) });
});

function setStatus(id, fields) {
  const existing = db.prepare("SELECT * FROM bookings WHERE id = ?").get(id);
  if (!existing) return null;
  const set = Object.keys(fields).map((k) => `${k} = ?`).join(", ");
  db.prepare(`UPDATE bookings SET ${set} WHERE id = ?`).run(...Object.values(fields), id);
  return db.prepare(`${APPOINTMENT_SELECT} WHERE b.id = ?`).get(id);
}

router.patch("/appointments/:id/approve", [param("id").isInt()], validate, (req, res) => {
  const row = setStatus(req.params.id, { status: "confirmed" });
  if (!row) return res.status(404).json({ error: "Appointment not found" });
  res.json({ appointment: mapAppointment(row) });
});

router.patch("/appointments/:id/cancel", [param("id").isInt(), body("reason").optional({ nullable: true }).isString().trim().isLength({ max: 300 })], validate, (req, res) => {
  const row = setStatus(req.params.id, {
    status: "cancelled",
    payment_status: "unpaid",
    rejection_reason: req.body.reason || "Cancelled by admin",
  });
  if (!row) return res.status(404).json({ error: "Appointment not found" });
  res.json({ appointment: mapAppointment(row) });
});

// ---------------------------------------------------------------------------
// Payments (derived view over bookings)
// ---------------------------------------------------------------------------

router.get("/payments", (req, res) => {
  const rows = db.prepare(`${APPOINTMENT_SELECT} ORDER BY b.created_at DESC`).all();
  res.json({ payments: rows.map(mapPayment) });
});

// ---------------------------------------------------------------------------
// System settings
// ---------------------------------------------------------------------------

router.get("/settings", (req, res) => {
  const row = db.prepare("SELECT * FROM system_settings WHERE id = 1").get();
  res.json({ settings: mapSettings(row) });
});

router.put(
  "/settings",
  [
    body("hospitalName").optional().isString().trim(),
    body("contactEmail").optional().isString().trim(),
    body("contactPhone").optional().isString().trim(),
    body("allowCancellationHours").optional().isInt({ min: 0, max: 168 }),
    body("maxBookingDaysInAdvance").optional().isInt({ min: 1, max: 365 }),
    body("currencySymbol").optional().isString().trim().isLength({ max: 5 }),
    body("enableEmailNotifications").optional().isBoolean(),
    body("enableSmsNotifications").optional().isBoolean(),
    body("autoConfirmBookings").optional().isBoolean(),
    body("maxActiveBookingsPerPatient").optional().isInt({ min: 1, max: 50 }),
    body("defaultConsultationFee").optional().isFloat({ min: 0 }),
    body("emergencyNoticeBanner").optional().isString().trim().isLength({ max: 300 }),
  ],
  validate,
  (req, res) => {
    const existing = db.prepare("SELECT * FROM system_settings WHERE id = 1").get();
    const b = req.body;
    const fields = {
      hospital_name: b.hospitalName ?? existing.hospital_name,
      contact_email: b.contactEmail ?? existing.contact_email,
      contact_phone: b.contactPhone ?? existing.contact_phone,
      allow_cancellation_hours: b.allowCancellationHours ?? existing.allow_cancellation_hours,
      max_booking_days_in_advance: b.maxBookingDaysInAdvance ?? existing.max_booking_days_in_advance,
      currency_symbol: b.currencySymbol ?? existing.currency_symbol,
      enable_email_notifications: b.enableEmailNotifications != null ? (b.enableEmailNotifications ? 1 : 0) : existing.enable_email_notifications,
      enable_sms_notifications: b.enableSmsNotifications != null ? (b.enableSmsNotifications ? 1 : 0) : existing.enable_sms_notifications,
      auto_confirm_bookings: b.autoConfirmBookings != null ? (b.autoConfirmBookings ? 1 : 0) : existing.auto_confirm_bookings,
      max_active_bookings_per_patient: b.maxActiveBookingsPerPatient ?? existing.max_active_bookings_per_patient,
      default_consultation_fee: b.defaultConsultationFee ?? existing.default_consultation_fee,
      emergency_notice_banner: b.emergencyNoticeBanner ?? existing.emergency_notice_banner,
    };

    db.prepare(
      `UPDATE system_settings SET hospital_name=?, contact_email=?, contact_phone=?, allow_cancellation_hours=?,
        max_booking_days_in_advance=?, currency_symbol=?, enable_email_notifications=?, enable_sms_notifications=?,
        auto_confirm_bookings=?, max_active_bookings_per_patient=?, default_consultation_fee=?, emergency_notice_banner=?
       WHERE id = 1`,
    ).run(
      fields.hospital_name, fields.contact_email, fields.contact_phone, fields.allow_cancellation_hours,
      fields.max_booking_days_in_advance, fields.currency_symbol, fields.enable_email_notifications,
      fields.enable_sms_notifications, fields.auto_confirm_bookings, fields.max_active_bookings_per_patient,
      fields.default_consultation_fee, fields.emergency_notice_banner,
    );

    res.json({ settings: mapSettings(db.prepare("SELECT * FROM system_settings WHERE id = 1").get()) });
  },
);

module.exports = router;
