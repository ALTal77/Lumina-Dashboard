const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const doctorsRouter = require("./routes/doctors");
const bookingsRouter = require("./routes/bookings");
const registerRouter = require("./routes/register");
const contactRouter = require("./routes/contact");
const authRouter = require("./routes/auth");
const adminRouter = require("./routes/admin");
const doctorPortalRouter = require("./routes/doctorPortal");
const patientPortalRouter = require("./routes/patientPortal");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(",")
      : [/^http:\/\/localhost:\d+$/, /^http:\/\/127\.0\.0\.1:\d+$/],
  }),
);
app.use(express.json({ limit: "10kb" }));
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// A light global limiter on top of the per-route ones defined for the
// write-heavy endpoints (booking, register, contact).
app.use(
  rateLimit({
    windowMs: 60 * 1000,
    max: 120,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

app.get("/api/settings", (req, res) => {
  const db = require("./db");
  const { mapSettings } = require("./utils/mappers");
  const row = db.prepare("SELECT * FROM system_settings WHERE id = 1").get();
  res.json({ settings: mapSettings(row) });
});

app.use("/api/doctors", doctorsRouter);
app.use("/api/bookings", bookingsRouter);
app.use("/api/register", registerRouter);
app.use("/api/contact", contactRouter);
app.use("/api/auth", authRouter);
app.use("/api/admin", adminRouter);
app.use("/api/doctor", doctorPortalRouter);
app.use("/api/patient", patientPortalRouter);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
