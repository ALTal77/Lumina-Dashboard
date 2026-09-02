const path = require("path");
const fs = require("fs");
const bcrypt = require("bcryptjs");
const { DatabaseSync } = require("node:sqlite");

const DB_PATH =
  process.env.DB_PATH || path.join(__dirname, "../../data/lumina.db");

fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

const db = new DatabaseSync(DB_PATH);
db.exec("PRAGMA journal_mode = WAL;");
db.exec("PRAGMA foreign_keys = ON;");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    email           TEXT UNIQUE NOT NULL,
    password_hash   TEXT NOT NULL,
    role            TEXT NOT NULL CHECK (role IN ('admin', 'doctor', 'patient')),
    full_name       TEXT NOT NULL,
    phone           TEXT,
    national_id     TEXT,
    patient_code    TEXT UNIQUE,
    avatar          TEXT,
    dob             TEXT,
    address         TEXT,
    status          TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
    created_at      TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS departments (
    id              TEXT PRIMARY KEY,
    name            TEXT UNIQUE NOT NULL,
    description     TEXT,
    icon            TEXT NOT NULL DEFAULT 'Stethoscope',
    status          TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'maintenance', 'closed')),
    created_at      TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS doctors (
    id              TEXT PRIMARY KEY,
    user_id         INTEGER REFERENCES users(id),
    department_id   TEXT REFERENCES departments(id),
    name_en         TEXT NOT NULL,
    name_ar         TEXT NOT NULL,
    specialty_en    TEXT NOT NULL,
    specialty_ar    TEXT NOT NULL,
    hospital_en     TEXT NOT NULL,
    hospital_ar     TEXT NOT NULL,
    image           TEXT NOT NULL,
    email           TEXT,
    phone           TEXT,
    fee             REAL NOT NULL DEFAULT 100,
    bio             TEXT,
    languages       TEXT,
    status          TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    rating          REAL NOT NULL DEFAULT 4.8,
    reviews_count   INTEGER NOT NULL DEFAULT 0,
    experience      INTEGER NOT NULL DEFAULT 0,
    next_slot_en    TEXT NOT NULL DEFAULT '',
    next_slot_ar    TEXT NOT NULL DEFAULT ''
  );

  CREATE TABLE IF NOT EXISTS time_slots (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    doctor_id       TEXT NOT NULL REFERENCES doctors(id),
    day             TEXT NOT NULL CHECK (day IN ('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday')),
    start_time      TEXT NOT NULL,
    end_time        TEXT NOT NULL,
    is_locked       INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS bookings (
    id                INTEGER PRIMARY KEY AUTOINCREMENT,
    reference         TEXT UNIQUE NOT NULL,
    payment_id        TEXT UNIQUE NOT NULL,
    doctor_id         TEXT NOT NULL REFERENCES doctors(id),
    patient_user_id   INTEGER REFERENCES users(id),
    patient_name      TEXT NOT NULL,
    phone             TEXT NOT NULL,
    date              TEXT NOT NULL,
    time_slot         TEXT NOT NULL,
    notes             TEXT,
    rejection_reason  TEXT,
    fee               REAL NOT NULL DEFAULT 0,
    payment_method    TEXT NOT NULL DEFAULT 'Credit Card',
    status            TEXT NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'rejected')),
    payment_status    TEXT NOT NULL DEFAULT 'paid' CHECK (payment_status IN ('paid', 'unpaid')),
    created_at        TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS medical_records (
    id                INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_user_id   INTEGER NOT NULL REFERENCES users(id),
    doctor_id         TEXT NOT NULL REFERENCES doctors(id),
    diagnosis         TEXT NOT NULL,
    prescription      TEXT,
    notes             TEXT,
    created_at        TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS ratings (
    id                INTEGER PRIMARY KEY AUTOINCREMENT,
    booking_id        INTEGER UNIQUE REFERENCES bookings(id),
    doctor_id         TEXT NOT NULL REFERENCES doctors(id),
    patient_user_id   INTEGER NOT NULL REFERENCES users(id),
    stars             INTEGER NOT NULL CHECK (stars BETWEEN 1 AND 5),
    comment           TEXT,
    created_at        TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS conversations (
    id                INTEGER PRIMARY KEY AUTOINCREMENT,
    doctor_id         TEXT NOT NULL REFERENCES doctors(id),
    patient_user_id   INTEGER NOT NULL REFERENCES users(id),
    created_at        TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE (doctor_id, patient_user_id)
  );

  CREATE TABLE IF NOT EXISTS messages (
    id                INTEGER PRIMARY KEY AUTOINCREMENT,
    conversation_id   INTEGER NOT NULL REFERENCES conversations(id),
    sender_role       TEXT NOT NULL CHECK (sender_role IN ('doctor', 'patient')),
    sender_user_id    INTEGER NOT NULL REFERENCES users(id),
    body              TEXT NOT NULL,
    is_read           INTEGER NOT NULL DEFAULT 0,
    created_at        TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS contact_messages (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    name            TEXT NOT NULL,
    email           TEXT NOT NULL,
    subject         TEXT,
    message         TEXT NOT NULL,
    status          TEXT NOT NULL DEFAULT 'new',
    created_at      TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS system_settings (
    id                              INTEGER PRIMARY KEY CHECK (id = 1),
    hospital_name                   TEXT NOT NULL DEFAULT 'Lumina Health',
    contact_email                   TEXT NOT NULL DEFAULT 'care@luminahealth.sy',
    contact_phone                   TEXT NOT NULL DEFAULT '+963 11 333 4400',
    allow_cancellation_hours        INTEGER NOT NULL DEFAULT 24,
    max_booking_days_in_advance     INTEGER NOT NULL DEFAULT 60,
    currency_symbol                 TEXT NOT NULL DEFAULT '$',
    enable_email_notifications      INTEGER NOT NULL DEFAULT 1,
    enable_sms_notifications        INTEGER NOT NULL DEFAULT 0,
    auto_confirm_bookings           INTEGER NOT NULL DEFAULT 0,
    max_active_bookings_per_patient INTEGER NOT NULL DEFAULT 3,
    default_consultation_fee        REAL NOT NULL DEFAULT 120,
    emergency_notice_banner         TEXT NOT NULL DEFAULT 'Hospital operations normal. No emergency alerts.'
  );
`);

function hasColumn(table, column) {
  const cols = db.prepare(`PRAGMA table_info(${table})`).all();
  return cols.some((c) => c.name === column);
}
if (!hasColumn("users", "dob")) {
  db.exec("ALTER TABLE users ADD COLUMN dob TEXT");
}
if (!hasColumn("users", "address")) {
  db.exec("ALTER TABLE users ADD COLUMN address TEXT");
}

const userCount = db.prepare("SELECT COUNT(*) AS count FROM users").get().count;

if (userCount === 0) {
  const insertUser = db.prepare(`
    INSERT INTO users (email, password_hash, role, full_name, phone, national_id, patient_code, avatar)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const insertDept = db.prepare(
    `INSERT INTO departments (id, name, description, icon, status) VALUES (?, ?, ?, ?, 'active')`,
  );
  const insertDoctor = db.prepare(`
    INSERT INTO doctors (
      id, user_id, department_id, name_en, name_ar, specialty_en, specialty_ar,
      hospital_en, hospital_ar, image, email, phone, fee, bio, languages,
      status, rating, reviews_count, experience, next_slot_en, next_slot_ar
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const insertSlot = db.prepare(`
    INSERT INTO time_slots (doctor_id, day, start_time, end_time, is_locked) VALUES (?, ?, ?, ?, 0)
  `);

  const avatarFor = (name) =>
    `https://ui-avatars.com/api/?background=0D9488&color=fff&name=${encodeURIComponent(name)}`;
  const hash = (plain) => bcrypt.hashSync(plain, 10);
  const SLOT_TIMES = [
    ["09:00 AM", "09:30 AM"],
    ["10:30 AM", "11:00 AM"],
    ["01:00 PM", "01:30 PM"],
    ["02:30 PM", "03:00 PM"],
    ["04:00 PM", "04:30 PM"],
    ["06:00 PM", "06:30 PM"],
  ];

  function seedSlotsFor(doctorId, days) {
    for (const day of days) {
      for (const [start, end] of SLOT_TIMES) {
        insertSlot.run(doctorId, day, start, end);
      }
    }
  }

  db.exec("BEGIN");
  try {
    insertUser.run(
      "admin@lumina.health",
      hash("Admin123!"),
      "admin",
      "System Administrator",
      "+963110000000",
      null,
      null,
      avatarFor("Admin"),
    );

    const deptRows = [
      ["dep-1", "Cardiology", "Heart and cardiovascular care", "Heart"],
      ["dep-2", "Neurology", "Brain and nervous system care", "Brain"],
      ["dep-3", "Pediatrics", "Child and infant healthcare", "Baby"],
      [
        "dep-4",
        "Orthopedics",
        "Bones, joints and musculoskeletal care",
        "Bone",
      ],
      ["dep-5", "Dermatology", "Skin, hair and nail care", "Sparkles"],
      ["dep-6", "Ophthalmology", "Eye care services", "Eye"],
      ["dep-7", "Dentistry", "Oral and dental care", "Smile"],
    ];
    for (const [id, name, description, icon] of deptRows)
      insertDept.run(id, name, description, icon);

    const seedDoctors = [
      {
        id: "doc-1",
        email: "layla.haddad@lumina.health",
        nameEn: "Dr. Layla Haddad",
        nameAr: "د. ليلى حداد",
        specialtyEn: "Cardiology",
        specialtyAr: "أمراض القلب",
        dept: "dep-1",
        hospitalEn: "Lumina Central Campus",
        hospitalAr: "لومينا - الحرم المركزي",
        image:
          "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=600",
        phone: "+963911000001",
        fee: 150,
        bio: "Board-certified interventional cardiologist with 12+ years of experience.",
        languages: "English, Arabic",
        rating: 4.9,
        reviewsCount: 214,
        experience: 12,
        nextSlotEn: "Today, 4:30 PM",
        nextSlotAr: "اليوم، 4:30 م",
        days: ["Monday", "Wednesday", "Friday"],
      },
      {
        id: "doc-2",
        email: "omar.nassar@lumina.health",
        nameEn: "Dr. Omar Nassar",
        nameAr: "د. عمر نصّار",
        specialtyEn: "Neurology",
        specialtyAr: "طب الأعصاب",
        dept: "dep-2",
        hospitalEn: "Lumina Central Campus",
        hospitalAr: "لومينا - الحرم المركزي",
        image:
          "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=600",
        phone: "+963911000002",
        fee: 160,
        bio: "Neurologist specializing in headache disorders and epilepsy management.",
        languages: "English, Arabic",
        rating: 4.8,
        reviewsCount: 176,
        experience: 15,
        nextSlotEn: "Tomorrow, 10:00 AM",
        nextSlotAr: "غداً، 10:00 ص",
        days: ["Tuesday", "Thursday", "Saturday"],
      },
      {
        id: "doc-3",
        email: "rana.suleiman@lumina.health",
        nameEn: "Dr. Rana Suleiman",
        nameAr: "د. رنا سليمان",
        specialtyEn: "Pediatrics",
        specialtyAr: "طب الأطفال",
        dept: "dep-3",
        hospitalEn: "Lumina Family Clinic",
        hospitalAr: "لومينا - عيادة الأسرة",
        image:
          "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=600",
        phone: "+963911000003",
        fee: 100,
        bio: "Pediatrician focused on preventive care and early childhood development.",
        languages: "English, Arabic, French",
        rating: 5.0,
        reviewsCount: 302,
        experience: 9,
        nextSlotEn: "Today, 6:00 PM",
        nextSlotAr: "اليوم، 6:00 م",
        days: ["Monday", "Tuesday", "Wednesday", "Thursday"],
      },
      {
        id: "doc-4",
        email: "karim.aboud@lumina.health",
        nameEn: "Dr. Karim Aboud",
        nameAr: "د. كريم عبود",
        specialtyEn: "Orthopedics",
        specialtyAr: "جراحة العظام",
        dept: "dep-4",
        hospitalEn: "Lumina Central Campus",
        hospitalAr: "لومينا - الحرم المركزي",
        image:
          "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=600",
        phone: "+963911000004",
        fee: 130,
        bio: "Orthopedic surgeon specializing in sports injuries and joint replacement.",
        languages: "English, Arabic",
        rating: 4.7,
        reviewsCount: 128,
        experience: 8,
        nextSlotEn: "Fri, 1:00 PM",
        nextSlotAr: "الجمعة، 1:00 م",
        days: ["Monday", "Wednesday", "Friday"],
      },
      {
        id: "doc-5",
        email: "yasmin.khoury@lumina.health",
        nameEn: "Dr. Yasmin Khoury",
        nameAr: "د. ياسمين خوري",
        specialtyEn: "Dermatology",
        specialtyAr: "الأمراض الجلدية",
        dept: "dep-5",
        hospitalEn: "Lumina Central Campus",
        hospitalAr: "لومينا - الحرم المركزي",
        image:
          "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?auto=format&fit=crop&q=80&w=600",
        phone: "+963911000005",
        fee: 110,
        bio: "Dermatologist with a focus on clinical and cosmetic skin care.",
        languages: "English, Arabic",
        rating: 4.9,
        reviewsCount: 189,
        experience: 14,
        nextSlotEn: "Mon, 9:30 AM",
        nextSlotAr: "الاثنين، 9:30 ص",
        days: ["Tuesday", "Friday"],
      },
      {
        id: "doc-6",
        email: "sami.barakat@lumina.health",
        nameEn: "Dr. Sami Barakat",
        nameAr: "د. سامي بركات",
        specialtyEn: "Ophthalmology",
        specialtyAr: "طب العيون",
        dept: "dep-6",
        hospitalEn: "Lumina Family Clinic",
        hospitalAr: "لومينا - عيادة الأسرة",
        image:
          "https://images.unsplash.com/photo-1622902046580-2b47f47f5471?auto=format&fit=crop&q=80&w=600",
        phone: "+963911000006",
        fee: 120,
        bio: "Ophthalmologist with two decades of experience in vision correction.",
        languages: "English, Arabic",
        rating: 4.6,
        reviewsCount: 97,
        experience: 20,
        nextSlotEn: "Today, 2:15 PM",
        nextSlotAr: "اليوم، 2:15 م",
        days: ["Wednesday", "Thursday", "Saturday"],
      },
    ];

    for (const d of seedDoctors) {
      const userId = insertUser.run(
        d.email,
        hash("Doctor123!"),
        "doctor",
        d.nameEn.replace(/^Dr\.\s*/, ""),
        d.phone,
        null,
        null,
        avatarFor(d.nameEn),
      ).lastInsertRowid;

      insertDoctor.run(
        d.id,
        userId,
        d.dept,
        d.nameEn,
        d.nameAr,
        d.specialtyEn,
        d.specialtyAr,
        d.hospitalEn,
        d.hospitalAr,
        d.image,
        d.email,
        d.phone,
        d.fee,
        d.bio,
        d.languages,
        "active",
        d.rating,
        d.reviewsCount,
        d.experience,
        d.nextSlotEn,
        d.nextSlotAr,
      );

      seedSlotsFor(d.id, d.days);
    }

    insertUser.run(
      "patient@lumina.health",
      hash("Patient123!"),
      "patient",
      "Sarah Jenkins",
      "+963999000000",
      "1098475893",
      "LUM-PT-1001",
      avatarFor("Sarah Jenkins"),
    );

    db.prepare(`INSERT INTO system_settings (id) VALUES (1)`).run();

    const patientUserId = 8;
    const insertConv = db.prepare(
      "INSERT INTO conversations (doctor_id, patient_user_id) VALUES (?, ?)",
    );
    const insertMsg = db.prepare(
      "INSERT INTO messages (conversation_id, sender_role, sender_user_id, body, is_read) VALUES (?, ?, ?, ?, ?)",
    );

    const conv1 = insertConv.run("doc-1", patientUserId).lastInsertRowid;
    insertMsg.run(
      conv1,
      "patient",
      patientUserId,
      "Hello Dr. Haddad, I've been experiencing chest tightness after exercise. Should I be concerned?",
      1,
    );
    insertMsg.run(
      conv1,
      "doctor",
      2,
      "Hello Sarah. Can you describe the tightness — is it sharp or dull? Does it radiate to your arm or jaw?",
      1,
    );
    insertMsg.run(
      conv1,
      "patient",
      patientUserId,
      "It's a dull pressure, mainly in the center of my chest. It doesn't radiate, but I feel short of breath.",
      1,
    );
    insertMsg.run(
      conv1,
      "doctor",
      2,
      "I'd like to run an ECG and some blood work. Please come in this week so we can rule out anything serious.",
      0,
    );

    const conv2 = insertConv.run("doc-3", patientUserId).lastInsertRowid;
    insertMsg.run(
      conv2,
      "patient",
      patientUserId,
      "Hi Dr. Suleiman, my daughter has had a persistent cough for 5 days. No fever though.",
      1,
    );
    insertMsg.run(
      conv2,
      "doctor",
      4,
      "Hi Sarah. Is the cough dry or productive? Any wheezing at night?",
      1,
    );
    insertMsg.run(
      conv2,
      "patient",
      patientUserId,
      "It's mostly dry, but she wheezes a little when lying down.",
      0,
    );

    const conv3 = insertConv.run("doc-5", patientUserId).lastInsertRowid;
    insertMsg.run(
      conv3,
      "patient",
      patientUserId,
      "Dr. Khoury, I have a recurring rash on my forearms that flares up in summer. What could it be?",
      0,
    );

    db.exec("COMMIT");
  } catch (err) {
    db.exec("ROLLBACK");
    throw err;
  }
}

module.exports = db;
