const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/ApiResponse');
const hospitalService = require('./hospitals.service');
const { USER_ROLES } = require('../../constants/enums');

const isAdminRequester = (req) => req.user?.role === USER_ROLES.ADMIN;

const createHospital = asyncHandler(async (req, res) => {
  const hospital = await hospitalService.createHospital(req.body);
  res.status(201).json(new ApiResponse(201, { hospital }, 'Hospital created successfully.'));
});

const getHospitals = asyncHandler(async (req, res) => {
  const { hospitals, total, pagination } = await hospitalService.getHospitals(
    req.query,
    isAdminRequester(req)
  );
  res
    .status(200)
    .json(
      new ApiResponse(200, { hospitals, total, ...pagination }, 'Hospitals fetched successfully.')
    );
});

const getHospitalById = asyncHandler(async (req, res) => {
  const hospital = await hospitalService.getHospitalById(req.params.id, isAdminRequester(req));
  res.status(200).json(new ApiResponse(200, { hospital }, 'Hospital fetched successfully.'));
});

const updateHospital = asyncHandler(async (req, res) => {
  const hospital = await hospitalService.updateHospital(req.params.id, req.body);
  res.status(200).json(new ApiResponse(200, { hospital }, 'Hospital updated successfully.'));
});

const deleteHospital = asyncHandler(async (req, res) => {
  await hospitalService.softDeleteHospital(req.params.id);
  res
    .status(200)
    .json(new ApiResponse(200, null, 'Hospital and its departments/doctors deactivated.'));
});

module.exports = { createHospital, getHospitals, getHospitalById, updateHospital, deleteHospital };
