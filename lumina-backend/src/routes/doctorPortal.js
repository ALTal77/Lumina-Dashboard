const express = require("express");
const { body, param } = require("express-validator");
const db = require("../db");
const validate = require("../middleware/validate");
const { authenticate, requireRole } = require("../middleware/auth");
const {
  mapAppointment, mapRecord, mapTimeSlot, mapConversation, mapMessage, mapDoctor,
} = require("../utils/mappers");
const { APPOINTMENT_SELECT } = require("../utils/sql");

const router = express.Router();
router.use(authenticate, requireRole("doctor"));

function getDoctorProfileOrFail(req, res) {
  const doctor = db.prepare("SELECT * FROM doctors WHERE user_id = ?").get(req.user.sub);
  if (!doctor) {
    res.status(404).json({ error: "No doctor profile linked to this account" });
    return null;
  }
  return doctor;
}

const DOCTOR_SELECT = `
  SELECT d.*, dep.name AS department_name,
    (SELECT GROUP_CONCAT(DISTINCT day) FROM time_slots ts WHERE ts.doctor_id = d.id AND ts.is_locked = 0) AS available_days
  FROM doctors d LEFT JOIN departments dep ON dep.id = d.department_id
`;

router.get("/me", (req, res) => {
  const doctor = getDoctorProfileOrFail(req, res);
  if (!doctor) return;
  const row = db.prepare(`${DOCTOR_SELECT} WHERE d.id = ?`).get(doctor.id);
  res.json({ doctor: mapDoctor(row) });
});

router.put("/me", [body("bio").optional().isString().trim(), body("phone").optional().isString().trim()], validate, (req, res) => {
  const doctor = getDoctorProfileOrFail(req, res);
  if (!doctor) return;

  const bio = req.body.bio ?? doctor.bio;
  const phone = req.body.phone ?? doctor.phone;
  db.prepare("UPDATE doctors SET bio = ?, phone = ? WHERE id = ?").run(bio, phone, doctor.id);

  const row = db.prepare(`${DOCTOR_SELECT} WHERE d.id = ?`).get(doctor.id);
  res.json({ doctor: mapDoctor(row) });
});

// ---------------------------------------------------------------------------
// Appointments
// ---------------------------------------------------------------------------

router.get("/appointments", (req, res) => {
  const doctor = getDoctorProfileOrFail(req, res);
  if (!doctor) return;
  const rows = db.prepare(`${APPOINTMENT_SELECT} WHERE b.doctor_id = ? ORDER BY b.date DESC, b.time_slot`).all(doctor.id);
  res.json({ appointments: rows.map(mapAppointment) });
});

function setStatus(doctorId, id, fields, res) {
  const booking = db.prepare("SELECT * FROM bookings WHERE id = ? AND doctor_id = ?").get(id, doctorId);
  if (!booking) return res.status(404).json({ error: "Appointment not found" });
  const set = Object.keys(fields).map((k) => `${k} = ?`).join(", ");
  db.prepare(`UPDATE bookings SET ${set} WHERE id = ?`).run(...Object.values(fields), id);
  const row = db.prepare(`${APPOINTMENT_SELECT} WHERE b.id = ?`).get(id);
  res.json({ appointment: mapAppointment(row) });
}

router.patch("/appointments/:id/approve", [param("id").isInt()], validate, (req, res) => {
  const doctor = getDoctorProfileOrFail(req, res);
  if (!doctor) return;
  setStatus(doctor.id, req.params.id, { status: "confirmed" }, res);
});

router.patch(
  "/appointments/:id/reject",
  [param("id").isInt(), body("reason").optional({ nullable: true }).isString().trim().isLength({ max: 300 })],
  validate,
  (req, res) => {
    const doctor = getDoctorProfileOrFail(req, res);
    if (!doctor) return;
    setStatus(doctor.id, req.params.id, {
      status: "rejected",
      rejection_reason: req.body.reason || "Rejected by doctor",
      payment_status: "unpaid",
    }, res);
  },
);

router.patch("/appointments/:id/complete", [param("id").isInt()], validate, (req, res) => {
  const doctor = getDoctorProfileOrFail(req, res);
  if (!doctor) return;
  setStatus(doctor.id, req.params.id, { status: "completed" }, res);
});

// ---------------------------------------------------------------------------
// Schedule / time slots
// ---------------------------------------------------------------------------

router.get("/schedule", (req, res) => {
  const doctor = getDoctorProfileOrFail(req, res);
  if (!doctor) return;
  const rows = db.prepare("SELECT * FROM time_slots WHERE doctor_id = ? ORDER BY day, id").all(doctor.id);
  res.json({ slots: rows.map(mapTimeSlot) });
});

router.patch("/schedule/:slotId/toggle-lock", [param("slotId").isInt()], validate, (req, res) => {
  const doctor = getDoctorProfileOrFail(req, res);
  if (!doctor) return;

  const slot = db.prepare("SELECT * FROM time_slots WHERE id = ? AND doctor_id = ?").get(req.params.slotId, doctor.id);
  if (!slot) return res.status(404).json({ error: "Time slot not found" });

  const nextLocked = slot.is_locked ? 0 : 1;
  db.prepare("UPDATE time_slots SET is_locked = ? WHERE id = ?").run(nextLocked, req.params.slotId);
  res.json({ slot: mapTimeSlot({ ...slot, is_locked: nextLocked }) });
});

// ---------------------------------------------------------------------------
// Patients & medical records
// ---------------------------------------------------------------------------

router.get("/patients", (req, res) => {
  const doctor = getDoctorProfileOrFail(req, res);
  if (!doctor) return;

  const rows = db
    .prepare(
      `SELECT DISTINCT u.* FROM bookings b JOIN users u ON u.id = b.patient_user_id
       WHERE b.doctor_id = ? ORDER BY u.full_name`,
    )
    .all(doctor.id);

  res.json({
    patients: rows.map((r) => ({
      id: String(r.id), name: r.full_name, email: r.email, role: "patient",
      avatar: r.avatar, phone: r.phone, status: r.status,
      patientCode: r.patient_code, nationalId: r.national_id,
    })),
  });
});

// All records this doctor has ever written, across every patient - used by
// DoctorPatients.tsx which filters the flat list client-side by patientId.
router.get("/records", (req, res) => {
  const doctor = getDoctorProfileOrFail(req, res);
  if (!doctor) return;

  const rows = db
    .prepare(
      `SELECT r.*, u.full_name AS patient_name, d.name_en AS doctor_name, d.specialty_en AS doctor_specialty
       FROM medical_records r
       JOIN users u ON u.id = r.patient_user_id
       JOIN doctors d ON d.id = r.doctor_id
       WHERE r.doctor_id = ? ORDER BY r.created_at DESC`,
    )
    .all(doctor.id);

  res.json({ records: rows.map(mapRecord) });
});

router.post(
  "/patients/:patientUserId/records",
  [
    param("patientUserId").isInt(),
    body("diagnosis").isString().trim().isLength({ min: 2, max: 300 }),
    body("prescription").optional({ nullable: true }).isString().trim().isLength({ max: 500 }),
    body("note").optional({ nullable: true }).isString().trim().isLength({ max: 1000 }),
  ],
  validate,
  (req, res) => {
    const doctor = getDoctorProfileOrFail(req, res);
    if (!doctor) return;

    const patient = db.prepare("SELECT id FROM users WHERE id = ? AND role = 'patient'").get(req.params.patientUserId);
    if (!patient) return res.status(404).json({ error: "Patient not found" });

    const { diagnosis, prescription = null, note = null } = req.body;

    const id = db
      .prepare(`INSERT INTO medical_records (patient_user_id, doctor_id, diagnosis, prescription, notes) VALUES (?, ?, ?, ?, ?)`)
      .run(req.params.patientUserId, doctor.id, diagnosis, prescription, note).lastInsertRowid;

    const row = db
      .prepare(
        `SELECT r.*, u.full_name AS patient_name, d.name_en AS doctor_name, d.specialty_en AS doctor_specialty
         FROM medical_records r JOIN users u ON u.id = r.patient_user_id
         JOIN doctors d ON d.id = r.doctor_id WHERE r.id = ?`,
      )
      .get(id);

    res.status(201).json({ record: mapRecord(row) });
  },
);

// ---------------------------------------------------------------------------
// Messaging
// ---------------------------------------------------------------------------

router.get("/conversations", (req, res) => {
  const doctor = getDoctorProfileOrFail(req, res);
  if (!doctor) return;

  const rows = db
    .prepare(
      `SELECT c.*, u.full_name AS participant_name, u.avatar AS participant_avatar,
        (SELECT body FROM messages m WHERE m.conversation_id = c.id ORDER BY m.created_at DESC LIMIT 1) AS last_message,
        (SELECT created_at FROM messages m WHERE m.conversation_id = c.id ORDER BY m.created_at DESC LIMIT 1) AS last_message_time,
        (SELECT COUNT(*) FROM messages m WHERE m.conversation_id = c.id AND m.sender_role = 'patient' AND m.is_read = 0) AS unread_count
       FROM conversations c JOIN users u ON u.id = c.patient_user_id
       WHERE c.doctor_id = ? ORDER BY c.created_at DESC`,
    )
    .all(doctor.id);

  res.json({
    conversations: rows.map((r) => mapConversation({ ...r, participant_id: r.patient_user_id, participant_role: "patient" })),
  });
});

router.get("/conversations/:id/messages", [param("id").isInt()], validate, (req, res) => {
  const doctor = getDoctorProfileOrFail(req, res);
  if (!doctor) return;

  const conv = db.prepare("SELECT * FROM conversations WHERE id = ? AND doctor_id = ?").get(req.params.id, doctor.id);
  if (!conv) return res.status(404).json({ error: "Conversation not found" });

  db.prepare("UPDATE messages SET is_read = 1 WHERE conversation_id = ? AND sender_role = 'patient'").run(req.params.id);

  const rows = db
    .prepare(
      `SELECT m.*,
        CASE WHEN m.sender_role = 'doctor' THEN d.name_en ELSE u.full_name END AS sender_name,
        CASE WHEN m.sender_role = 'doctor' THEN d.image ELSE u.avatar END AS sender_avatar,
        CASE WHEN m.sender_role = 'doctor' THEN u.id ELSE d.id END AS receiver_id,
        CASE WHEN m.sender_role = 'doctor' THEN u.full_name ELSE d.name_en END AS receiver_name
       FROM messages m
       JOIN conversations c ON c.id = m.conversation_id
       JOIN doctors d ON d.id = c.doctor_id
       JOIN users u ON u.id = c.patient_user_id
       WHERE m.conversation_id = ? ORDER BY m.created_at`,
    )
    .all(req.params.id);
  res.json({ messages: rows.map(mapMessage) });
});

router.post(
  "/conversations/:id/messages",
  [param("id").isInt(), body("content").isString().trim().isLength({ min: 1, max: 2000 })],
  validate,
  (req, res) => {
    const doctor = getDoctorProfileOrFail(req, res);
    if (!doctor) return;

    const conv = db.prepare("SELECT * FROM conversations WHERE id = ? AND doctor_id = ?").get(req.params.id, doctor.id);
    if (!conv) return res.status(404).json({ error: "Conversation not found" });

    const id = db
      .prepare(`INSERT INTO messages (conversation_id, sender_role, sender_user_id, body) VALUES (?, 'doctor', ?, ?)`)
      .run(req.params.id, req.user.sub, req.body.content).lastInsertRowid;

    const row = db
      .prepare(
        `SELECT m.*, d.name_en AS sender_name, d.image AS sender_avatar,
          u.id AS receiver_id, u.full_name AS receiver_name
         FROM messages m JOIN doctors d ON d.id = ?
         JOIN conversations c ON c.id = m.conversation_id
         JOIN users u ON u.id = c.patient_user_id
         WHERE m.id = ?`,
      )
      .get(doctor.id, id);
    res.status(201).json({ message: mapMessage(row) });
  },
);

module.exports = router;
