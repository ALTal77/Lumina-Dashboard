const express = require("express");
const { body } = require("express-validator");
const rateLimit = require("express-rate-limit");
const db = require("../db");
const validate = require("../middleware/validate");

const router = express.Router();

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many messages sent. Please try again later." },
});

// POST /api/contact
router.post(
  "/",
  contactLimiter,
  [
    body("name").isString().trim().isLength({ min: 2, max: 100 }),
    body("email").isEmail().normalizeEmail(),
    body("subject").optional({ nullable: true }).isString().trim().isLength({ max: 150 }),
    body("message").isString().trim().isLength({ min: 5, max: 2000 }),
  ],
  validate,
  (req, res) => {
    const { name, email, subject = null, message } = req.body;

    const result = db
      .prepare(
        `INSERT INTO contact_messages (name, email, subject, message) VALUES (?, ?, ?, ?)`,
      )
      .run(name, email, subject, message);

    res.status(201).json({
      message: "Your message has been received. Our team will get back to you shortly.",
      id: result.lastInsertRowid,
    });
  },
);

module.exports = router;
