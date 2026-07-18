const express = require('express');
const router = express.Router();

const departmentController = require('./departments.controller');
const validate = require('../../middlewares/validate.middleware');
const validateObjectId = require('../../middlewares/validateObjectId.middleware');
const protect = require('../../middlewares/auth.middleware');
const authorize = require('../../middlewares/rbac.middleware');
const optionalAuth = require('../../middlewares/optionalAuth.middleware');
const { USER_ROLES } = require('../../constants/enums');
const { createDepartmentSchema, updateDepartmentSchema } = require('./departments.validation');

router.get('/', optionalAuth, departmentController.getDepartments);
router.get('/:id', validateObjectId('id'), optionalAuth, departmentController.getDepartmentById);

router.use(protect, authorize(USER_ROLES.ADMIN));

router.post('/', validate(createDepartmentSchema), departmentController.createDepartment);
router.patch(
  '/:id',
  validateObjectId('id'),
  validate(updateDepartmentSchema),
  departmentController.updateDepartment
);
router.delete('/:id', validateObjectId('id'), departmentController.deleteDepartment);

module.exports = router;
