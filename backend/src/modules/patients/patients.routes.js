const express = require('express');
const router = express.Router();

const patientController = require('./patients.controller');
const validate = require('../../middlewares/validate.middleware');
const validateObjectId = require('../../middlewares/validateObjectId.middleware');
const protect = require('../../middlewares/auth.middleware');
const authorize = require('../../middlewares/rbac.middleware');
const { USER_ROLES } = require('../../constants/enums');
const { bookAppointmentSchema, cancelAppointmentSchema } = require('./patients.validation');

/**
 * Every route here is patient-only and requires a logged-in patient.
 * (Register/Login already live in /auth — not duplicated here. Choosing
 * a City/Hospital/Department/Doctor uses the public GET endpoints already
 * exposed on /cities, /hospitals, /departments, /doctors.)
 */
router.use(protect, authorize(USER_ROLES.PATIENT));

router.post('/appointments', validate(bookAppointmentSchema), patientController.bookAppointment);
router.get('/appointments', patientController.getMyAppointments);
router.get('/appointments/:id', validateObjectId('id'), patientController.getMyAppointmentById);
router.patch(
  '/appointments/:id/cancel',
  validateObjectId('id'),
  validate(cancelAppointmentSchema),
  patientController.cancelAppointment
);

module.exports = router;
