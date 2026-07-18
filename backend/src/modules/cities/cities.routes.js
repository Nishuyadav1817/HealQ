const express = require('express');
const router = express.Router();

const cityController = require('./cities.controller');
const validate = require('../../middlewares/validate.middleware');
const validateObjectId = require('../../middlewares/validateObjectId.middleware');
const protect = require('../../middlewares/auth.middleware');
const authorize = require('../../middlewares/rbac.middleware');
const optionalAuth = require('../../middlewares/optionalAuth.middleware');
const { USER_ROLES } = require('../../constants/enums');
const { createCitySchema, updateCitySchema } = require('./cities.validation');

// Public browse — optionalAuth so a logged-in admin can additionally see
// inactive cities, without requiring auth for everyone else.
router.get('/', optionalAuth, cityController.getCities);
router.get('/:id', validateObjectId('id'), optionalAuth, cityController.getCityById);

// Everything below is admin-only.
router.use(protect, authorize(USER_ROLES.ADMIN));

router.post('/', validate(createCitySchema), cityController.createCity);
router.patch('/:id', validateObjectId('id'), validate(updateCitySchema), cityController.updateCity);
router.delete('/:id', validateObjectId('id'), cityController.deleteCity);

module.exports = router;
