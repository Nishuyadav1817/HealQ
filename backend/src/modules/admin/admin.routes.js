const express = require('express');
const router = express.Router();

const adminController = require('./admin.controller');
const validateQuery = require('../../middlewares/validateQuery.middleware');
const validateObjectId = require('../../middlewares/validateObjectId.middleware');
const protect = require('../../middlewares/auth.middleware');
const authorize = require('../../middlewares/rbac.middleware');
const { USER_ROLES } = require('../../constants/enums');
const {
  analyticsQuerySchema,
  patientsQuerySchema,
  appointmentsQuerySchema,
} = require('./admin.validation');

// Every route here is Admin-only. (Hospitals/Doctors/Departments/Cities
// CRUD already exists on their own admin-gated routes — /hospitals,
// /doctors, /departments, /cities — and is reused as-is by the Admin
// panel's Hospitals/Doctors tabs rather than duplicated here.)
router.use(protect, authorize(USER_ROLES.ADMIN));

// Overview tab — top stat cards.
router.get('/dashboard/summary', adminController.getDashboardSummary);

// Charts / Analytics tab.
router.get(
  '/dashboard/analytics',
  validateQuery(analyticsQuerySchema),
  adminController.getAnalytics
);

// Patients tab.
router.get('/patients', validateQuery(patientsQuerySchema), adminController.getPatients);
router.get('/patients/:id', validateObjectId('id'), adminController.getPatientById);

// Appointments tab (also backs the Reports tab's tables).
router.get(
  '/appointments',
  validateQuery(appointmentsQuerySchema),
  adminController.getAppointments
);
router.get('/appointments/:id', validateObjectId('id'), adminController.getAppointmentById);

module.exports = router;
