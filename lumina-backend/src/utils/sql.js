// Reused by bookings.js, admin.js, doctorPortal.js, patientPortal.js so every
// appointment list comes back with the same joined fields the frontend needs.
const APPOINTMENT_SELECT = `
  SELECT b.*,
    d.name_en AS doctor_name, d.specialty_en AS doctor_specialty, d.image AS doctor_image,
    dep.name AS department_name,
    u.avatar AS patient_avatar,
    EXISTS(SELECT 1 FROM ratings r WHERE r.booking_id = b.id) AS is_rated
  FROM bookings b
  JOIN doctors d ON d.id = b.doctor_id
  LEFT JOIN departments dep ON dep.id = d.department_id
  LEFT JOIN users u ON u.id = b.patient_user_id
`;

module.exports = { APPOINTMENT_SELECT };
