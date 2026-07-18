import apiClient from '../../../services/apiClient';

/**
 * Thin request wrappers only — no caching/state, same split used by
 * every other feature's `*.api.js` (see reception.api.js,
 * doctorAssistant.api.js). React Query hooks in ../hooks own
 * caching/loading/error state on top of these.
 *
 * Hospitals/Doctors/Departments/Cities CRUD already exists as
 * admin-gated REST endpoints (see backend/src/modules/hospitals,
 * doctors, departments, cities) — reused here as-is rather than
 * duplicated under /admin. Only what's genuinely admin-specific
 * (dashboard analytics, cross-hospital patient/appointment listing)
 * lives under /admin on the backend.
 */

// --- Dashboard: Overview / Charts / Analytics / Reports tabs ---
export const getDashboardSummary = () => apiClient.get('/admin/dashboard/summary');

export const getAnalytics = (params) => apiClient.get('/admin/dashboard/analytics', { params });

// --- Patients tab ---
export const getAdminPatients = (params) => apiClient.get('/admin/patients', { params });

export const getAdminPatientById = (id) => apiClient.get(`/admin/patients/${id}`);

// --- Appointments tab (also backs the Reports tab) ---
export const getAdminAppointments = (params) => apiClient.get('/admin/appointments', { params });

export const getAdminAppointmentById = (id) => apiClient.get(`/admin/appointments/${id}`);

// --- Hospitals tab (reuses /hospitals; isAdmin flag on the backend
// unlocks seeing inactive hospitals too, since the requester is an
// authenticated admin) ---
export const getHospitals = (params) => apiClient.get('/hospitals', { params });
export const getHospitalById = (id) => apiClient.get(`/hospitals/${id}`);
export const createHospital = (payload) => apiClient.post('/hospitals', payload);
export const updateHospital = (id, payload) => apiClient.patch(`/hospitals/${id}`, payload);
export const deleteHospital = (id) => apiClient.delete(`/hospitals/${id}`);

// --- Doctors tab (reuses /doctors) ---
export const getDoctors = (params) => apiClient.get('/doctors', { params });
export const getDoctorById = (id) => apiClient.get(`/doctors/${id}`);
export const createDoctor = (payload) => apiClient.post('/doctors', payload);
export const updateDoctor = (id, payload) => apiClient.patch(`/doctors/${id}`, payload);
export const deleteDoctor = (id) => apiClient.delete(`/doctors/${id}`);

// --- Supporting lookups used by the Hospital/Doctor create forms, plus
// full CRUD for the dedicated Cities/Departments admin management pages ---
export const getCities = (params) => apiClient.get('/cities', { params });
export const getCityById = (id) => apiClient.get(`/cities/${id}`);
export const createCity = (payload) => apiClient.post('/cities', payload);
export const updateCity = (id, payload) => apiClient.patch(`/cities/${id}`, payload);
export const deleteCity = (id) => apiClient.delete(`/cities/${id}`);

export const getDepartments = (params) => apiClient.get('/departments', { params });
export const getDepartmentById = (id) => apiClient.get(`/departments/${id}`);
export const createDepartment = (payload) => apiClient.post('/departments', payload);
export const updateDepartment = (id, payload) => apiClient.patch(`/departments/${id}`, payload);
export const deleteDepartment = (id) => apiClient.delete(`/departments/${id}`);

// --- Staff tab: admin-provisioned Receptionist / Doctor Assistant accounts ---
export const getStaff = (params) => apiClient.get('/admin/staff', { params });
export const createReceptionist = (payload) => apiClient.post('/admin/staff/receptionists', payload);
export const createDoctorAssistant = (payload) =>
  apiClient.post('/admin/staff/doctor-assistants', payload);
export const updateStaff = (id, payload) => apiClient.patch(`/admin/staff/${id}`, payload);
export const deactivateStaff = (id) => apiClient.delete(`/admin/staff/${id}`);
