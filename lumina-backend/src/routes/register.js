const express = require("express");
const bcrypt = require("bcryptjs");
const { body } = require("express-validator");
const rateLimit = require("express-rate-limit");
const db = require("../db");
const validate = require("../middleware/validate");
const { signToken } = require("../utils/jwt");

const router = express.Router();

const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many registration attempts. Please try again later." },
});

function generatePatientCode() {
  const n = Math.floor(1000 + Math.random() * 9000);
  return `LUM-PT-${n}`;
}

// POST /api/register - patient self-signup. Creates a row in the shared
// `users` table with role = 'patient' and immediately returns a login token.
router.post(
  "/",
  registerLimiter,
  [
    body("fullName").isString().trim().isLength({ min: 2, max: 100 }),
    body("nationalId").isString().trim().isLength({ min: 4, max: 30 }),
    body("email").isEmail().normalizeEmail(),
    body("password").isString().isLength({ min: 8 }).withMessage("Password must be at least 8 characters"),
    body("phone").optional({ nullable: true }).isString().trim().isLength({ max: 30 }),
  ],
  validate,
  (req, res, next) => {
    try {
      const { fullName, nationalId, email, password, phone = null } = req.body;

      const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
      if (existing) {
        return res.status(409).json({ error: "An account with this email already exists" });
      }

      const passwordHash = bcrypt.hashSync(password, 10);
      const avatar = `https://ui-avatars.com/api/?background=0D9488&color=fff&name=${encodeURIComponent(fullName)}`;

      let patientCode = generatePatientCode();
      const codeExists = db.prepare("SELECT 1 FROM users WHERE patient_code = ?");
      while (codeExists.get(patientCode)) patientCode = generatePatientCode();

      const userId = db
        .prepare(
          `INSERT INTO users (email, password_hash, role, full_name, phone, national_id, patient_code, avatar)
           VALUES (?, ?, 'patient', ?, ?, ?, ?, ?)`,
        )
        .run(email, passwordHash, fullName, phone, nationalId, patientCode, avatar).lastInsertRowid;

      const token = signToken({ sub: userId, role: "patient", name: fullName, email });

      res.status(201).json({
        token,
        user: {
          id: String(userId), name: fullName, email, role: "patient",
          avatar, phone: phone || undefined, status: "active",
        },
        patient: {
          id: String(userId),
          patientId: patientCode,
          name: fullName,
          idNumber: nationalId,
          email,
        },
      });
    } catch (err) {
      next(err);
    }
  },
);

module.exports = router;
