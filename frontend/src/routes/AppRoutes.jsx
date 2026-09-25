import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import PatientLayout from '../layouts/PatientLayout';
import ReceptionLayout from '../layouts/ReceptionLayout';
import DoctorLayout from '../layouts/DoctorLayout';
import AdminLayout from '../layouts/AdminLayout';
import ComingSoon from '../components/common/ComingSoon';
import { ROUTES } from '../constants/routePaths';
import { USER_ROLES } from '../constants/roles';

import HomePage from '../features/patient/pages/HomePage';
import LoginPage from '../features/auth/pages/LoginPage';
import RegisterPage from '../features/auth/pages/RegisterPage';
import PatientDashboardPage from '../features/patient/pages/PatientDashboardPage';
import ChooseCityPage from '../features/patient/pages/ChooseCityPage';
import ChooseHospitalPage from '../features/patient/pages/ChooseHospitalPage';
import DoctorListPage from '../features/patient/pages/DoctorListPage';
import BookingPage from '../features/patient/pages/BookingPage';
import BookingSuccessPage from '../features/patient/pages/BookingSuccessPage';
import AppointmentsPage from '../features/patient/pages/AppointmentsPage';
import AppointmentTrackPage from '../features/patient/pages/AppointmentTrackPage';
import ProfilePage from '../features/patient/pages/ProfilePage';

import ReceptionDashboardPage from '../features/reception/pages/ReceptionDashboardPage';
import SearchBookingPage from '../features/reception/pages/SearchBookingPage';

import DoctorQueuePage from '../features/doctorAssistant/pages/DoctorQueuePage';

import AdminOverviewPage from '../features/admin/pages/AdminOverviewPage';
import AdminAnalyticsPage from '../features/admin/pages/AdminAnalyticsPage';
import AdminReportsPage from '../features/admin/pages/AdminReportsPage';
import AdminHospitalsPage from '../features/admin/pages/AdminHospitalsPage';
import AdminDoctorsPage from '../features/admin/pages/AdminDoctorsPage';
import AdminPatientsPage from '../features/admin/pages/AdminPatientsPage';
import AdminAppointmentsPage from '../features/admin/pages/AdminAppointmentsPage';
import AdminDepartmentsPage from '../features/admin/pages/AdminDepartmentsPage';
import AdminCitiesPage from '../features/admin/pages/AdminCitiesPage';
import AdminStaffPage from '../features/admin/pages/AdminStaffPage';

/**
 * The full route tree. Patient, Reception, Doctor Assistant, and Admin
 * (including Departments/Cities) are fully built out.
 */
const AppRoutes = () => (
  <Routes>
    <Route path={ROUTES.HOME} element={<HomePage />} />
    <Route path={ROUTES.LOGIN} element={<LoginPage />} />
    <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
    <Route path={ROUTES.UNAUTHORIZED} element={<ComingSoon title="Unauthorized" />} />

    {/* Patient */}
    <Route element={<ProtectedRoute allowedRoles={[USER_ROLES.PATIENT]} />}>
      <Route path={ROUTES.PATIENT.ROOT} element={<PatientLayout />}>
        <Route index element={<PatientDashboardPage />} />
        <Route path="book/city" element={<ChooseCityPage />} />
        <Route path="book/hospital" element={<ChooseHospitalPage />} />
        <Route path="book/doctors" element={<DoctorListPage />} />
        <Route path="book/confirm/:doctorId" element={<BookingPage />} />
        <Route path="book/success/:appointmentId" element={<BookingSuccessPage />} />
        <Route path="appointments" element={<AppointmentsPage />} />
        <Route path="appointments/:id" element={<AppointmentTrackPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>
    </Route>

    {/* Reception (Panel 1) */}
    <Route element={<ProtectedRoute allowedRoles={[USER_ROLES.RECEPTIONIST]} />}>
      <Route path={ROUTES.RECEPTION.ROOT} element={<ReceptionLayout />}>
        <Route index element={<ReceptionDashboardPage />} />
        <Route path="search" element={<SearchBookingPage />} />
      </Route>
    </Route>

    {/* Doctor Assistant (Panel 2) */}
    <Route element={<ProtectedRoute allowedRoles={[USER_ROLES.DOCTOR_ASSISTANT]} />}>
      <Route path={ROUTES.DOCTOR.ROOT} element={<DoctorLayout />}>
        <Route index element={<DoctorQueuePage />} />
        <Route path="history" element={<ComingSoon title="Consultation History" />} />
      </Route>
    </Route>

    {/* Admin */}
    <Route element={<ProtectedRoute allowedRoles={[USER_ROLES.ADMIN]} />}>
      <Route path={ROUTES.ADMIN.ROOT} element={<AdminLayout />}>
        <Route index element={<AdminOverviewPage />} />
        <Route path="analytics" element={<AdminAnalyticsPage />} />
        <Route path="reports" element={<AdminReportsPage />} />
        <Route path="hospitals" element={<AdminHospitalsPage />} />
        <Route path="doctors" element={<AdminDoctorsPage />} />
        <Route path="patients" element={<AdminPatientsPage />} />
        <Route path="appointments" element={<AdminAppointmentsPage />} />
        <Route path="departments" element={<AdminDepartmentsPage />} />
        <Route path="cities" element={<AdminCitiesPage />} />
        <Route path="staff" element={<AdminStaffPage />} />
      </Route>
    </Route>

    <Route path={ROUTES.NOT_FOUND} element={<ComingSoon title="404 — Not Found" />} />
    <Route path="*" element={<Navigate to={ROUTES.NOT_FOUND} replace />} />
  </Routes>
);

export default AppRoutes;
