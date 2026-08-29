const express = require("express");
const crypto = require("crypto");
const { body, param } = require("express-validator");
const rateLimit = require("express-rate-limit");
const db = require("../db");
const validate = require("../middleware/validate");
const { optionalAuthenticate } = require("../middleware/auth");
const { mapAppointment } = require("../utils/mappers");
const { APPOINTMENT_SELECT } = require("../utils/sql");

const router = express.Router();

const bookingLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many booking attempts. Please try again later." },
});

function generateReference() {
  const n = crypto.randomInt(100000, 1000000);
  return `LUM-${n}`;
}

function generatePaymentId() {
  const n = crypto.randomInt(10000000, 100000000);
  return `PAY-${n}`;
}

const PAYMENT_METHODS = ["Credit Card", "Debit Card", "Apple Pay", "Digital Wallet", "Insurance"];

// POST /api/bookings
router.post(
  "/",
  optionalAuthenticate,
  bookingLimiter,
  [
    body("doctorId").isString().trim().notEmpty().withMessage("doctorId is required"),
    body("patientName").isString().trim().isLength({ min: 2, max: 100 }),
    body("phone").optional({ nullable: true }).isString().trim().isLength({ max: 30 }),
    body("date").isISO8601().withMessage("date must be a valid date (YYYY-MM-DD)"),
    body("timeSlot").isString().trim().notEmpty(),
    body("notes").optional({ nullable: true }).isString().trim().isLength({ max: 500 }),
    body("paymentMethod").optional({ nullable: true }).isIn(PAYMENT_METHODS),
    body("consultationFee").optional({ nullable: true }).isFloat({ min: 0 }),
  ],
  validate,
  (req, res) => {
    const {
      doctorId, patientName, phone = "", date, timeSlot, notes = null,
      paymentMethod = "Credit Card",
    } = req.body;

    const doctor = db.prepare("SELECT id, fee FROM doctors WHERE id = ?").get(doctorId);
    if (!doctor) {
      return res.status(400).json({ error: "Selected doctor does not exist" });
    }

    // If a logged-in patient is booking, link the row to their account so it
    // shows up under "My Appointments" in the patient portal.
    const patientUserId = req.user && req.user.role === "patient" ? req.user.sub : null;
    const fee = req.body.consultationFee ?? doctor.fee;

    let reference = generateReference();
    const refExists = db.prepare("SELECT 1 FROM bookings WHERE reference = ?");
    while (refExists.get(reference)) reference = generateReference();

    let paymentId = generatePaymentId();
    const payExists = db.prepare("SELECT 1 FROM bookings WHERE payment_id = ?");
    while (payExists.get(paymentId)) paymentId = generatePaymentId();

    db.prepare(
      `INSERT INTO bookings (reference, payment_id, doctor_id, patient_user_id, patient_name, phone, date, time_slot, notes, fee, payment_method)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ).run(reference, paymentId, doctorId, patientUserId, patientName, phone, date, timeSlot, notes, fee, paymentMethod);

    const row = db.prepare(`${APPOINTMENT_SELECT} WHERE b.reference = ?`).get(reference);
    const appointment = mapAppointment(row);
    res.status(201).json({ appointment, appointmentId: appointment.id, paymentId: appointment.paymentId });
  },
);

// GET /api/bookings/:reference
router.get(
  "/:reference",
  [param("reference").isString().trim().notEmpty()],
  validate,
  (req, res) => {
    const row = db.prepare(`${APPOINTMENT_SELECT} WHERE b.reference = ?`).get(req.params.reference);
    if (!row) return res.status(404).json({ error: "Booking not found" });
    res.json({ appointment: mapAppointment(row) });
  },
);

module.exports = router;
