const express = require('express');
const router = express.Router();

const receptionController = require('./reception.controller');
const validate = require('../../middlewares/validate.middleware');
const validateQuery = require('../../middlewares/validateQuery.middleware');
const validateObjectId = require('../../middlewares/validateObjectId.middleware');
const protect = require('../../middlewares/auth.middleware');
const authorize = require('../../middlewares/rbac.middleware');
const { USER_ROLES } = require('../../constants/enums');
const {
  searchBookingSchema,
  todaysAppointmentsQuerySchema,
  verifyPatientSchema,
  collectPaymentSchema,
  updateStatusSchema,
} = require('./reception.validation');

// Every route here is Reception (Panel 1) only.
router.use(protect, authorize(USER_ROLES.RECEPTIONIST));

// 0. Today's Patients board
router.get(
  '/appointments/today',
  validateQuery(todaysAppointmentsQuerySchema),
  receptionController.getTodaysAppointments
);

// 1. Search Booking Number
router.get('/appointments/search', validateQuery(searchBookingSchema), receptionController.searchByBookingNumber);

// 2. Verify Patient
router.patch(
  '/appointments/:id/verify',
  validateObjectId('id'),
  validate(verifyPatientSchema),
  receptionController.verifyPatient
);

// 3. Collect Payment
router.post(
  '/appointments/:id/payment',
  validateObjectId('id'),
  validate(collectPaymentSchema),
  receptionController.collectPayment
);

// 4. Mark Arrived
router.patch('/appointments/:id/arrive', validateObjectId('id'), receptionController.markArrived);

// 5. Move Patient to Doctor Queue
router.patch(
  '/appointments/:id/move-to-queue',
  validateObjectId('id'),
  receptionController.moveToDoctorQueue
);

// 6. Update appointment status (no-show / cancelled)
router.patch(
  '/appointments/:id/status',
  validateObjectId('id'),
  validate(updateStatusSchema),
  receptionController.updateStatus
);

module.exports = router;
