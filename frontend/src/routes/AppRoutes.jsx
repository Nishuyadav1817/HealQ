import React from "react";
import { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import ProtectedRoute from './ProtectedRoute';
import { ROUTE_PATHS } from '../constants/routePaths';

// Layouts
import AdminLayout from '../layouts/AdminLayout';
import DoctorLayout from '../layouts/DoctorLayout';
import PatientLayout from '../layouts/PatientLayout';
import ReceptionLayout from '../layouts/ReceptionLayout';

// Auth Pages
import LoginPage from '../features/auth/pages/LoginPage';
import RegisterPage from '../features/auth/pages/RegisterPage';

// Admin Pages
import AdminOverviewPage from '../features/admin/pages/AdminOverviewPage';
import AdminAppointmentsPage from '../features/admin/pages/AdminAppointmentsPage';
import AdminDoctorsPage from '../features/admin/pages/AdminDoctorsPage';
import AdminHospitalsPage from '../features/admin/pages/AdminHospitalsPage';
import AdminDepartmentsPage from '../features/admin/pages/AdminDepartmentsPage';
import AdminCitiesPage from '../features/admin/pages/AdminCitiesPage';
import AdminPatientsPage from '../features/admin/pages/AdminPatientsPage';
import AdminAnalyticsPage from '../features/admin/pages/AdminAnalyticsPage';

// Doctor Assistant Pages
import DoctorAssistantQueuePage from '../features/doctorAssistant/pages/DoctorQueuePage';
import DoctorAssistantCompletedPage from '../features/doctorAssistant/pages/DoctorCompletedPage';

// Patient Pages (NEW)
import PatientDashboardPage from '../features/patient/pages/PatientDashboardPage';
import PatientAppointmentsPage from '../features/patient/pages/PatientAppointmentsPage';
import PatientBookAppointmentPage from '../features/patient/pages/PatientBookAppointmentPage';
import PatientNotificationsPage from '../features/patient/pages/PatientNotificationsPage';

// Reception Pages (if implemented)
// import ReceptionCheckInPage from '../features/reception/pages/ReceptionCheckInPage';

// Loading component
import FullScreenLoader from '../components/common/FullScreenLoader';

const AppRoutes = () => {
  const { user, isLoading } = useContext(AuthContext);

  if (isLoading) {
    return <FullScreenLoader />;
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path={ROUTE_PATHS.LOGIN} element={<LoginPage />} />
      <Route path={ROUTE_PATHS.REGISTER} element={<RegisterPage />} />

      {/* Admin Routes */}
      <Route
        path={ROUTE_PATHS.ADMIN.ROOT}
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminOverviewPage />} />
        <Route path={ROUTE_PATHS.ADMIN.APPOINTMENTS} element={<AdminAppointmentsPage />} />
        <Route path={ROUTE_PATHS.ADMIN.DOCTORS} element={<AdminDoctorsPage />} />
        <Route path={ROUTE_PATHS.ADMIN.HOSPITALS} element={<AdminHospitalsPage />} />
        <Route path={ROUTE_PATHS.ADMIN.DEPARTMENTS} element={<AdminDepartmentsPage />} />
        <Route path={ROUTE_PATHS.ADMIN.CITIES} element={<AdminCitiesPage />} />
        <Route path={ROUTE_PATHS.ADMIN.PATIENTS} element={<AdminPatientsPage />} />
        <Route path={ROUTE_PATHS.ADMIN.ANALYTICS} element={<AdminAnalyticsPage />} />
      </Route>

      {/* Doctor Assistant Routes */}
      <Route
        path={ROUTE_PATHS.DOCTOR_ASSISTANT.ROOT}
        element={
          <ProtectedRoute requiredRole="doctorAssistant">
            <DoctorLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DoctorAssistantQueuePage />} />
        <Route path={ROUTE_PATHS.DOCTOR_ASSISTANT.QUEUE} element={<DoctorAssistantQueuePage />} />
        <Route path={ROUTE_PATHS.DOCTOR_ASSISTANT.COMPLETED} element={<DoctorAssistantCompletedPage />} />
      </Route>

      {/* Patient Routes (NEW) */}
      <Route
        path={ROUTE_PATHS.PATIENT.ROOT}
        element={
          <ProtectedRoute requiredRole="patient">
            <PatientLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<PatientDashboardPage />} />
        <Route path={ROUTE_PATHS.PATIENT.DASHBOARD} element={<PatientDashboardPage />} />
        <Route path={ROUTE_PATHS.PATIENT.APPOINTMENTS} element={<PatientAppointmentsPage />} />
        <Route path={ROUTE_PATHS.PATIENT.BOOK} element={<PatientBookAppointmentPage />} />
        <Route path={ROUTE_PATHS.PATIENT.NOTIFICATIONS} element={<PatientNotificationsPage />} />
      </Route>

      {/* Reception Routes (TODO: implement when needed) */}
      {/* <Route
        path={ROUTE_PATHS.RECEPTION.ROOT}
        element={
          <ProtectedRoute requiredRole="receptionist">
            <ReceptionLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<ReceptionCheckInPage />} />
      </Route> */}

      {/* Fallback */}
      <Route path="/" element={<Navigate to={user ? '/dashboard' : ROUTE_PATHS.LOGIN} replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
