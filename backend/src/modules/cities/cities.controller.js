const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/ApiResponse');
const cityService = require('./cities.service');
const { USER_ROLES } = require('../../constants/enums');

const isAdminRequester = (req) => req.user?.role === USER_ROLES.ADMIN;

const createCity = asyncHandler(async (req, res) => {
  const city = await cityService.createCity(req.body);
  res.status(201).json(new ApiResponse(201, { city }, 'City created successfully.'));
});

const getCities = asyncHandler(async (req, res) => {
  const { cities, total, pagination } = await cityService.getCities(
    req.query,
    isAdminRequester(req)
  );
  res
    .status(200)
    .json(new ApiResponse(200, { cities, total, ...pagination }, 'Cities fetched successfully.'));
});

const getCityById = asyncHandler(async (req, res) => {
  const city = await cityService.getCityById(req.params.id, isAdminRequester(req));
  res.status(200).json(new ApiResponse(200, { city }, 'City fetched successfully.'));
});

const updateCity = asyncHandler(async (req, res) => {
  const city = await cityService.updateCity(req.params.id, req.body);
  res.status(200).json(new ApiResponse(200, { city }, 'City updated successfully.'));
});

const deleteCity = asyncHandler(async (req, res) => {
  await cityService.softDeleteCity(req.params.id);
  res.status(200).json(new ApiResponse(200, null, 'City deactivated successfully.'));
});

module.exports = { createCity, getCities, getCityById, updateCity, deleteCity };
