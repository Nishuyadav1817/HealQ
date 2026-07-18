const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/ApiResponse');
const adminService = require('./admin.service');

const getDashboardSummary = asyncHandler(async (req, res) => {
  const summary = await adminService.getDashboardSummary();
  res.status(200).json(new ApiResponse(200, summary, 'Dashboard summary fetched successfully.'));
});

const getAnalytics = asyncHandler(async (req, res) => {
  const analytics = await adminService.getAnalytics(req.query);
  res.status(200).json(new ApiResponse(200, analytics, 'Analytics fetched successfully.'));
});

const getPatients = asyncHandler(async (req, res) => {
  const { patients, total, pagination } = await adminService.getPatients(req.query);
  res
    .status(200)
    .json(new ApiResponse(200, { patients, total, ...pagination }, 'Patients fetched successfully.'));
});

const getPatientById = asyncHandler(async (req, res) => {
  const result = await adminService.getPatientById(req.params.id);
  res.status(200).json(new ApiResponse(200, result, 'Patient fetched successfully.'));
});

const getAppointments = asyncHandler(async (req, res) => {
  const { appointments, total, pagination } = await adminService.getAppointments(req.query);
  res
    .status(200)
    .json(
      new ApiResponse(200, { appointments, total, ...pagination }, 'Appointments fetched successfully.')
    );
});

const getAppointmentById = asyncHandler(async (req, res) => {
  const appointment = await adminService.getAppointmentById(req.params.id);
  res.status(200).json(new ApiResponse(200, { appointment }, 'Appointment fetched successfully.'));
});

module.exports = {
  getDashboardSummary,
  getAnalytics,
  getPatients,
  getPatientById,
  getAppointments,
  getAppointmentById,
};
