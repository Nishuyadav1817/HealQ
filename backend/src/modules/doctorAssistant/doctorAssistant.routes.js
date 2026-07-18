const express = require('express');
const router = express.Router();

const doctorAssistantController = require('./doctorAssistant.controller');
const validate = require('../../middlewares/validate.middleware');
const validateQuery = require('../../middlewares/validateQuery.middleware');
const validateObjectId = require('../../middlewares/validateObjectId.middleware');
const protect = require('../../middlewares/auth.middleware');
const authorize = require('../../middlewares/rbac.middleware');
const { USER_ROLES } = require('../../constants/enums');
const { queueQuerySchema, doctorDateSchema, setAverageConsultationTimeSchema } = require('./doctorAssistant.validation');

// Every route here is Doctor Assistant (Panel 2) only.
router.use(protect, authorize(USER_ROLES.DOCTOR_ASSISTANT));

// 1. View Queue
router.get('/queue', validateQuery(queueQuerySchema), doctorAssistantController.getQueue);

// 2. Call Next Patient
router.post(
  '/queue/call-next',
  validate(doctorDateSchema),
  doctorAssistantController.callNextPatient
);

// 3. Start Consultation
router.patch(
  '/queue/:appointmentId/start',
  validateObjectId('appointmentId'),
  doctorAssistantController.startConsultation
);

// 4. Complete Consultation
router.patch(
  '/queue/:appointmentId/complete',
  validateObjectId('appointmentId'),
  doctorAssistantController.completeConsultation
);

// 5. Skip Patient
router.patch(
  '/queue/:appointmentId/skip',
  validateObjectId('appointmentId'),
  doctorAssistantController.skipPatient
);

// 6. Pause Queue
router.patch('/queue/pause', validate(doctorDateSchema), doctorAssistantController.pauseQueue);

// 7. Resume Queue
router.patch('/queue/resume', validate(doctorDateSchema), doctorAssistantController.resumeQueue);

// Bonus: configure average consultation time ("Average consultation time
// is configurable" — an explicit, settable value, not just the automatic
// per-completion adjustment).
router.patch(
  '/queue/average-consultation-time',
  validate(setAverageConsultationTimeSchema),
  doctorAssistantController.setAverageConsultationTime
);

module.exports = router;
