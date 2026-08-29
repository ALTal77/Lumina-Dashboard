const express = require("express");
const { query } = require("express-validator");
const db = require("../db");
const validate = require("../middleware/validate");
const { mapDoctor, mapTimeSlot, mapDepartment } = require("../utils/mappers");

const router = express.Router();

const DOCTOR_SELECT = `
  SELECT d.*, dep.name AS department_name,
    (SELECT GROUP_CONCAT(DISTINCT day) FROM time_slots ts WHERE ts.doctor_id = d.id AND ts.is_locked = 0) AS available_days
  FROM doctors d LEFT JOIN departments dep ON dep.id = d.department_id
`;

// GET /api/doctors?search=&specialty=
router.get(
  "/",
  [
    query("search").optional().isString().trim().isLength({ max: 100 }),
    query("specialty").optional().isString().trim().isLength({ max: 100 }),
  ],
  validate,
  (req, res) => {
    const { search = "", specialty = "" } = req.query;
    const rows = db.prepare(`${DOCTOR_SELECT} WHERE d.status = 'active'`).all();

    const q = search.toLowerCase();
    const filtered = rows.filter((row) => {
      const matchesQuery =
        !q ||
        row.name_en.toLowerCase().includes(q) ||
        row.name_ar.toLowerCase().includes(q) ||
        row.specialty_en.toLowerCase().includes(q) ||
        row.specialty_ar.toLowerCase().includes(q);

      const matchesSpecialty =
        !specialty ||
        row.specialty_en.toLowerCase() === specialty.toLowerCase() ||
        row.specialty_ar.toLowerCase() === specialty.toLowerCase();

      return matchesQuery && matchesSpecialty;
    });

    res.json({ doctors: filtered.map(mapDoctor), total: filtered.length });
  },
);

// GET /api/doctors/specialties
router.get("/specialties", (req, res) => {
  const rows = db.prepare("SELECT DISTINCT specialty_en, specialty_ar FROM doctors").all();
  res.json({
    specialtiesEn: rows.map((r) => r.specialty_en),
    specialtiesAr: rows.map((r) => r.specialty_ar),
  });
});

// GET /api/doctors/departments - public list with live doctor counts
router.get("/departments", (req, res) => {
  const rows = db
    .prepare(
      `SELECT dep.*, (SELECT COUNT(*) FROM doctors d WHERE d.department_id = dep.id AND d.status = 'active') AS doctor_count
       FROM departments dep WHERE dep.status = 'active' ORDER BY dep.name`,
    )
    .all();
  res.json({ departments: rows.map(mapDepartment) });
});

// GET /api/doctors/:id
router.get("/:id", (req, res) => {
  const row = db.prepare(`${DOCTOR_SELECT} WHERE d.id = ?`).get(req.params.id);
  if (!row) return res.status(404).json({ error: "Doctor not found" });
  res.json({ doctor: mapDoctor(row) });
});

// GET /api/doctors/:id/slots - this doctor's bookable weekly slots
router.get("/:id/slots", (req, res) => {
  const doctor = db.prepare("SELECT id FROM doctors WHERE id = ?").get(req.params.id);
  if (!doctor) return res.status(404).json({ error: "Doctor not found" });

  const rows = db
    .prepare("SELECT * FROM time_slots WHERE doctor_id = ? AND is_locked = 0 ORDER BY id")
    .all(req.params.id);
  res.json({ slots: rows.map(mapTimeSlot) });
});

module.exports = router;
