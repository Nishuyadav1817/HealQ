const express = require('express');
const router = express.Router();

const hospitalController = require('./hospitals.controller');
const validate = require('../../middlewares/validate.middleware');
const validateObjectId = require('../../middlewares/validateObjectId.middleware');
const protect = require('../../middlewares/auth.middleware');
const authorize = require('../../middlewares/rbac.middleware');
const optionalAuth = require('../../middlewares/optionalAuth.middleware');
const { USER_ROLES } = require('../../constants/enums');
const { createHospitalSchema, updateHospitalSchema } = require('./hospitals.validation');

router.get('/', optionalAuth, hospitalController.getHospitals);
router.get('/:id', validateObjectId('id'), optionalAuth, hospitalController.getHospitalById);

router.use(protect, authorize(USER_ROLES.ADMIN));

router.post('/', validate(createHospitalSchema), hospitalController.createHospital);
router.patch(
  '/:id',
  validateObjectId('id'),
  validate(updateHospitalSchema),
  hospitalController.updateHospital
);
router.delete('/:id', validateObjectId('id'), hospitalController.deleteHospital);

module.exports = router;
