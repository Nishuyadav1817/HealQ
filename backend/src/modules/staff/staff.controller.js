const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/ApiResponse');
const staffService = require('./staff.service');

const createReceptionist = asyncHandler(async (req, res) => {
  const staff = await staffService.createReceptionist(req.body);
  res.status(201).json(new ApiResponse(201, { staff }, 'Receptionist created successfully.'));
});

const createDoctorAssistant = asyncHandler(async (req, res) => {
  const staff = await staffService.createDoctorAssistant(req.body);
  res.status(201).json(new ApiResponse(201, { staff }, 'Doctor Assistant created successfully.'));
});

const getStaff = asyncHandler(async (req, res) => {
  const { staff, total, pagination } = await staffService.getStaff(req.query);
  res.status(200).json(new ApiResponse(200, { staff, total, ...pagination }, 'Staff fetched successfully.'));
});

const updateStaff = asyncHandler(async (req, res) => {
  const staff = await staffService.updateStaff(req.params.id, req.body);
  res.status(200).json(new ApiResponse(200, { staff }, 'Staff updated successfully.'));
});

const deactivateStaff = asyncHandler(async (req, res) => {
  await staffService.deactivateStaff(req.params.id);
  res.status(200).json(new ApiResponse(200, null, 'Staff account deactivated.'));
});

module.exports = {
  createReceptionist,
  createDoctorAssistant,
  getStaff,
  updateStaff,
  deactivateStaff,
};
