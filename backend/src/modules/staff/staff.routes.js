const express = require('express');
const router = express.Router();

const staffController = require('./staff.controller');
const validate = require('../../middlewares/validate.middleware');
const validateQuery = require('../../middlewares/validateQuery.middleware');
const validateObjectId = require('../../middlewares/validateObjectId.middleware');
const protect = require('../../middlewares/auth.middleware');
const authorize = require('../../middlewares/rbac.middleware');
const { USER_ROLES } = require('../../constants/enums');
const {
  createReceptionistSchema,
  createDoctorAssistantSchema,
  staffQuerySchema,
  updateStaffSchema,
} = require('./staff.validation');

/**
 * Provisioning Receptionist/Doctor Assistant accounts is exclusively an
 * Admin action — see the PUBLIC_REGISTER_ROLES comment in
 * auth.validation.js, which deliberately excludes both roles from public
 * self-registration. Every route here is admin-only.
 */
router.use(protect, authorize(USER_ROLES.ADMIN));

router.get('/', validateQuery(staffQuerySchema), staffController.getStaff);
router.post('/receptionists', validate(createReceptionistSchema), staffController.createReceptionist);
router.post(
  '/doctor-assistants',
  validate(createDoctorAssistantSchema),
  staffController.createDoctorAssistant
);
router.patch('/:id', validateObjectId('id'), validate(updateStaffSchema), staffController.updateStaff);
router.delete('/:id', validateObjectId('id'), staffController.deactivateStaff);

module.exports = router;
