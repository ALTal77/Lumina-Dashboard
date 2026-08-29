const express = require("express");
const bcrypt = require("bcryptjs");
const { body } = require("express-validator");
const rateLimit = require("express-rate-limit");
const db = require("../db");
const validate = require("../middleware/validate");
const { authenticate } = require("../middleware/auth");
const { signToken } = require("../utils/jwt");

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many login attempts. Please try again later." },
});

// Builds the exact `User` shape the dashboard's types.ts expects.
// IMPORTANT: for doctor accounts, `id` must be the doctor profile id
// (e.g. "doc-1"), not the underlying users-table row id - every page
// compares `appointment.doctorId === user.id` directly.
function publicUser(user) {
  let id = String(user.id);
  if (user.role === "doctor") {
    const doc = db.prepare("SELECT id FROM doctors WHERE user_id = ?").get(user.id);
    if (doc) id = doc.id;
  }
  return {
    id,
    name: user.full_name,
    email: user.email,
    role: user.role,
    avatar: user.avatar || `https://ui-avatars.com/api/?background=0D9488&color=fff&name=${encodeURIComponent(user.full_name)}`,
    phone: user.phone || undefined,
    dob: user.dob || undefined,
    address: user.address || undefined,
    status: user.status,
  };
}

// POST /api/auth/login - works for admin, doctor and patient accounts alike.
router.post(
  "/login",
  loginLimiter,
  [
    body("email").isEmail().normalizeEmail(),
    body("password").isString().notEmpty(),
  ],
  validate,
  (req, res) => {
    const { email, password } = req.body;

    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
    if (!user || !bcrypt.compareSync(password, user.password_hash)) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    if (user.status === "suspended") {
      return res.status(403).json({ error: "This account has been suspended. Please contact support." });
    }

    // The JWT always carries the raw users.id in `sub` - that's what every
    // /api/doctor/* and /api/patient/* route uses to look up the caller.
    const token = signToken({
      sub: user.id,
      role: user.role,
      name: user.full_name,
      email: user.email,
    });

    res.json({ token, user: publicUser(user) });
  },
);

// GET /api/auth/me - fetch the current user from their token.
router.get("/me", authenticate, (req, res) => {
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.user.sub);
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json({ user: publicUser(user) });
});

module.exports = router;
