const express = require("express");
const { body, param } = require("express-validator");
const db = require("../db");
const validate = require("../middleware/validate");
const { authenticate, requireRole } = require("../middleware/auth");
const { mapAppointment, mapRecord, mapRating, mapConversation, mapMessage, mapPatient } = require("../utils/mappers");
const { APPOINTMENT_SELECT } = require("../utils/sql");

const router = express.Router();
router.use(authenticate, requireRole("patient"));

router.get("/me", (req, res) => {
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.user.sub);
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json({ patient: mapPatient(user) });
});

router.put(
  "/me",
  [
    body("name").optional().isString().trim(),
    body("phone").optional().isString().trim(),
    body("avatar").optional().isString().trim(),
    body("dob").optional({ nullable: true }).isString().trim(),
    body("address").optional({ nullable: true }).isString().trim(),
  ],
  validate,
  (req, res) => {
    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.user.sub);
    const fullName = req.body.name ?? user.full_name;
    const phone = req.body.phone ?? user.phone;
    const avatar = req.body.avatar ?? user.avatar;
    const dob = req.body.dob ?? user.dob;
    const address = req.body.address ?? user.address;
    db.prepare("UPDATE users SET full_name = ?, phone = ?, avatar = ?, dob = ?, address = ? WHERE id = ?").run(fullName, phone, avatar, dob, address, req.user.sub);
    res.json({ patient: mapPatient(db.prepare("SELECT * FROM users WHERE id = ?").get(req.user.sub)) });
  },
);

// ---------------------------------------------------------------------------
// Appointments
// ---------------------------------------------------------------------------

router.get("/appointments", (req, res) => {
  const rows = db.prepare(`${APPOINTMENT_SELECT} WHERE b.patient_user_id = ? ORDER BY b.date DESC, b.time_slot`).all(req.user.sub);
  res.json({ appointments: rows.map(mapAppointment) });
});

router.patch(
  "/appointments/:id/cancel",
  [param("id").isInt(), body("reason").optional({ nullable: true }).isString().trim().isLength({ max: 300 })],
  validate,
  (req, res) => {
    const booking = db.prepare("SELECT * FROM bookings WHERE id = ? AND patient_user_id = ?").get(req.params.id, req.user.sub);
    if (!booking) return res.status(404).json({ error: "Appointment not found" });

    const settings = db.prepare("SELECT allow_cancellation_hours FROM system_settings WHERE id = 1").get();
    const hoursUntil = (new Date(booking.date).getTime() - Date.now()) / 3600000;
    if (hoursUntil < settings.allow_cancellation_hours) {
      return res.status(400).json({
        error: `Appointments can only be cancelled at least ${settings.allow_cancellation_hours} hours in advance`,
      });
    }

    db.prepare("UPDATE bookings SET status = 'cancelled', rejection_reason = ?, payment_status = 'unpaid' WHERE id = ?")
      .run(req.body.reason || "Cancelled by patient", req.params.id);

    const row = db.prepare(`${APPOINTMENT_SELECT} WHERE b.id = ?`).get(req.params.id);
    res.json({ appointment: mapAppointment(row) });
  },
);

router.patch(
  "/appointments/:id/modify",
  [
    param("id").isInt(),
    body("date").optional().isISO8601(),
    body("timeSlot").optional().isString().trim().notEmpty(),
  ],
  validate,
  (req, res) => {
    const booking = db.prepare("SELECT * FROM bookings WHERE id = ? AND patient_user_id = ?").get(req.params.id, req.user.sub);
    if (!booking) return res.status(404).json({ error: "Appointment not found" });

    const date = req.body.date ?? booking.date;
    const timeSlot = req.body.timeSlot ?? booking.time_slot;

    db.prepare("UPDATE bookings SET date = ?, time_slot = ?, status = 'pending' WHERE id = ?").run(date, timeSlot, req.params.id);
    const row = db.prepare(`${APPOINTMENT_SELECT} WHERE b.id = ?`).get(req.params.id);
    res.json({ appointment: mapAppointment(row) });
  },
);

// ---------------------------------------------------------------------------
// Medical records
// ---------------------------------------------------------------------------

router.get("/records", (req, res) => {
  const rows = db
    .prepare(
      `SELECT r.*, u.full_name AS patient_name, d.name_en AS doctor_name, d.specialty_en AS doctor_specialty
       FROM medical_records r JOIN users u ON u.id = r.patient_user_id
       JOIN doctors d ON d.id = r.doctor_id
       WHERE r.patient_user_id = ? ORDER BY r.created_at DESC`,
    )
    .all(req.user.sub);
  res.json({ records: rows.map(mapRecord) });
});

// ---------------------------------------------------------------------------
// Ratings
// ---------------------------------------------------------------------------

router.post(
  "/ratings",
  [
    body("appointmentId").isInt(),
    body("stars").isInt({ min: 1, max: 5 }),
    body("comment").optional({ nullable: true }).isString().trim().isLength({ max: 1000 }),
  ],
  validate,
  (req, res) => {
    const booking = db.prepare("SELECT * FROM bookings WHERE id = ? AND patient_user_id = ?").get(req.body.appointmentId, req.user.sub);
    if (!booking) return res.status(404).json({ error: "Appointment not found" });
    if (booking.status !== "completed") {
      return res.status(400).json({ error: "You can only rate a completed appointment" });
    }
    if (db.prepare("SELECT id FROM ratings WHERE booking_id = ?").get(booking.id)) {
      return res.status(409).json({ error: "You already rated this appointment" });
    }

    const { stars, comment = "" } = req.body;
    const id = db
      .prepare(`INSERT INTO ratings (booking_id, doctor_id, patient_user_id, stars, comment) VALUES (?, ?, ?, ?, ?)`)
      .run(booking.id, booking.doctor_id, req.user.sub, stars, comment).lastInsertRowid;

    const agg = db.prepare("SELECT AVG(stars) AS avgStars, COUNT(*) AS c FROM ratings WHERE doctor_id = ?").get(booking.doctor_id);
    db.prepare("UPDATE doctors SET rating = ?, reviews_count = ? WHERE id = ?").run(
      Math.round(agg.avgStars * 10) / 10, agg.c, booking.doctor_id,
    );

    const row = db
      .prepare(`SELECT r.*, u.full_name AS patient_name, u.avatar AS patient_avatar FROM ratings r JOIN users u ON u.id = r.patient_user_id WHERE r.id = ?`)
      .get(id);
    res.status(201).json({ rating: mapRating(row) });
  },
);

router.get("/ratings", (req, res) => {
  const rows = db
    .prepare(`SELECT r.*, u.full_name AS patient_name, u.avatar AS patient_avatar FROM ratings r JOIN users u ON u.id = r.patient_user_id WHERE r.patient_user_id = ? ORDER BY r.created_at DESC`)
    .all(req.user.sub);
  res.json({ ratings: rows.map(mapRating) });
});

// ---------------------------------------------------------------------------
// Messaging
// ---------------------------------------------------------------------------

router.get("/conversations", (req, res) => {
  const rows = db
    .prepare(
      `SELECT c.*, d.name_en AS participant_name, d.image AS participant_avatar,
        (SELECT body FROM messages m WHERE m.conversation_id = c.id ORDER BY m.created_at DESC LIMIT 1) AS last_message,
        (SELECT created_at FROM messages m WHERE m.conversation_id = c.id ORDER BY m.created_at DESC LIMIT 1) AS last_message_time,
        (SELECT COUNT(*) FROM messages m WHERE m.conversation_id = c.id AND m.sender_role = 'doctor' AND m.is_read = 0) AS unread_count
       FROM conversations c JOIN doctors d ON d.id = c.doctor_id
       WHERE c.patient_user_id = ? ORDER BY c.created_at DESC`,
    )
    .all(req.user.sub);

  res.json({
    conversations: rows.map((r) => mapConversation({ ...r, participant_id: r.doctor_id, participant_role: "doctor" })),
  });
});

router.post("/conversations", [body("doctorId").isString().trim().notEmpty()], validate, (req, res) => {
  const doctor = db.prepare("SELECT id, name_en, image FROM doctors WHERE id = ?").get(req.body.doctorId);
  if (!doctor) return res.status(404).json({ error: "Doctor not found" });

  let conv = db.prepare("SELECT * FROM conversations WHERE doctor_id = ? AND patient_user_id = ?").get(doctor.id, req.user.sub);
  if (!conv) {
    const id = db.prepare("INSERT INTO conversations (doctor_id, patient_user_id) VALUES (?, ?)").run(doctor.id, req.user.sub).lastInsertRowid;
    conv = db.prepare("SELECT * FROM conversations WHERE id = ?").get(id);
  }

  res.status(201).json({
    conversation: mapConversation({
      ...conv, participant_id: doctor.id, participant_role: "doctor",
      participant_name: doctor.name_en, participant_avatar: doctor.image,
    }),
  });
});

router.get("/conversations/:id/messages", [param("id").isInt()], validate, (req, res) => {
  const conv = db.prepare("SELECT * FROM conversations WHERE id = ? AND patient_user_id = ?").get(req.params.id, req.user.sub);
  if (!conv) return res.status(404).json({ error: "Conversation not found" });

  db.prepare("UPDATE messages SET is_read = 1 WHERE conversation_id = ? AND sender_role = 'doctor'").run(req.params.id);

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
    const conv = db.prepare("SELECT * FROM conversations WHERE id = ? AND patient_user_id = ?").get(req.params.id, req.user.sub);
    if (!conv) return res.status(404).json({ error: "Conversation not found" });

    const id = db
      .prepare(`INSERT INTO messages (conversation_id, sender_role, sender_user_id, body) VALUES (?, 'patient', ?, ?)`)
      .run(req.params.id, req.user.sub, req.body.content).lastInsertRowid;

    const row = db
      .prepare(
        `SELECT m.*, u.full_name AS sender_name, u.avatar AS sender_avatar,
          d.id AS receiver_id, d.name_en AS receiver_name
         FROM messages m JOIN users u ON u.id = ?
         JOIN conversations c ON c.id = m.conversation_id
         JOIN doctors d ON d.id = c.doctor_id
         WHERE m.id = ?`,
      )
      .get(req.user.sub, id);
    res.status(201).json({ message: mapMessage(row) });
  },
);

module.exports = router;
