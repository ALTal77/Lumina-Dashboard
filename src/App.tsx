import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import './i18n/i18n';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';

// Layout
import { AppShell } from './components/layout/AppShell';

// Auth / Login Page
import { LoginPage } from './pages/auth/LoginPage';

// Patient Pages
import { PatientDashboard } from './pages/patient/PatientDashboard';
import { BrowseDepartments } from './pages/patient/BrowseDepartments';
import { DoctorListing } from './pages/patient/DoctorListing';
import { BookAppointmentFlow } from './pages/patient/BookAppointmentFlow';
import { MyAppointments } from './pages/patient/MyAppointments';
import { PatientMessages } from './pages/patient/PatientMessages';
import { PatientProfile } from './pages/patient/PatientProfile';

// Doctor Pages
import { DoctorDashboard } from './pages/doctor/DoctorDashboard';
import { DoctorAppointments } from './pages/doctor/DoctorAppointments';
import { DoctorSchedule } from './pages/doctor/DoctorSchedule';
import { DoctorPatients } from './pages/doctor/DoctorPatients';
import { DoctorMessages } from './pages/doctor/DoctorMessages';
import { DoctorProfilePage } from './pages/doctor/DoctorProfilePage';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { ManageDoctors } from './pages/admin/ManageDoctors';
import { ManageDepartments } from './pages/admin/ManageDepartments';
import { MonitorAppointments } from './pages/admin/MonitorAppointments';
import { ManagePatients } from './pages/admin/ManagePatients';
import { RevenuePayments } from './pages/admin/RevenuePayments';
import { ReportsAnalytics } from './pages/admin/ReportsAnalytics';
import { SystemSettingsPage } from './pages/admin/SystemSettingsPage';

export function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <HashRouter>
          <Routes>
            {/* Login / Role Selection Page */}
            <Route path="/login" element={<LoginPage />} />

            {/* App Dashboard Shell */}
            <Route path="/" element={<AppShell />}>
              <Route index element={<Navigate to="/login" replace />} />

              {/* Patient Routes */}
              <Route path="patient/dashboard" element={<PatientDashboard />} />
              <Route path="patient/departments" element={<BrowseDepartments />} />
              <Route path="patient/doctors" element={<DoctorListing />} />
              <Route path="patient/book" element={<BookAppointmentFlow />} />
              <Route path="patient/appointments" element={<MyAppointments />} />
              <Route path="patient/messages" element={<PatientMessages />} />
              <Route path="patient/profile" element={<PatientProfile />} />

              {/* Doctor Routes */}
              <Route path="doctor/dashboard" element={<DoctorDashboard />} />
              <Route path="doctor/appointments" element={<DoctorAppointments />} />
              <Route path="doctor/schedule" element={<DoctorSchedule />} />
              <Route path="doctor/patients" element={<DoctorPatients />} />
              <Route path="doctor/messages" element={<DoctorMessages />} />
              <Route path="doctor/profile" element={<DoctorProfilePage />} />

              {/* Admin Routes */}
              <Route path="admin/dashboard" element={<AdminDashboard />} />
              <Route path="admin/doctors" element={<ManageDoctors />} />
              <Route path="admin/departments" element={<ManageDepartments />} />
              <Route path="admin/appointments" element={<MonitorAppointments />} />
              <Route path="admin/patients" element={<ManagePatients />} />
              <Route path="admin/payments" element={<RevenuePayments />} />
              <Route path="admin/reports" element={<ReportsAnalytics />} />
              <Route path="admin/settings" element={<SystemSettingsPage />} />
            </Route>

            {/* Fallback Catch-all */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </HashRouter>
      </DataProvider>
    </AuthProvider>
  );
}

export default App;
