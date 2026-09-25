const express = require('express');
const router = express.Router();

const doctorController = require('./doctors.controller');
const validate = require('../../middlewares/validate.middleware');
const validateObjectId = require('../../middlewares/validateObjectId.middleware');
const protect = require('../../middlewares/auth.middleware');
const authorize = require('../../middlewares/rbac.middleware');
const optionalAuth = require('../../middlewares/optionalAuth.middleware');
const { USER_ROLES } = require('../../constants/enums');
const {
  createDoctorSchema,
  updateDoctorSchema,
  assignHospitalSchema,
  assignDepartmentSchema,
} = require('./doctors.validation');

// Public browse — patients need to see doctors to book appointments.
router.get('/', optionalAuth, doctorController.getDoctors);
router.get('/:id', validateObjectId('id'), optionalAuth, doctorController.getDoctorById);

// Everything below is admin-only.
router.use(protect, authorize(USER_ROLES.ADMIN));

router.post('/', validate(createDoctorSchema), doctorController.createDoctor);
router.patch(
  '/:id',
  validateObjectId('id'),
  validate(updateDoctorSchema),
  doctorController.updateDoctor
);
router.patch(
  '/:id/assign-hospital',
  validateObjectId('id'),
  validate(assignHospitalSchema),
  doctorController.assignHospital
);
router.patch(
  '/:id/assign-department',
  validateObjectId('id'),
  validate(assignDepartmentSchema),
  doctorController.assignDepartment
);
router.delete('/:id', validateObjectId('id'), doctorController.deleteDoctor);

module.exports = router;
