const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/ApiResponse');
const receptionService = require('./reception.service');

const getTodaysAppointments = asyncHandler(async (req, res) => {
  const appointments = await receptionService.getTodaysAppointments(req.user.hospital, req.query);
  res.status(200).json(new ApiResponse(200, { appointments }, "Today's appointments fetched."));
});

const searchByBookingNumber = asyncHandler(async (req, res) => {
  const appointment = await receptionService.searchByBookingNumber(req.query.bookingNumber);
  res.status(200).json(new ApiResponse(200, { appointment }, 'Appointment found.'));
});

const verifyPatient = asyncHandler(async (req, res) => {
  const appointment = await receptionService.verifyPatient(
    req.params.id,
    req.user._id,
    req.body.verificationNotes
  );
  res.status(200).json(new ApiResponse(200, { appointment }, 'Patient identity verified.'));
});

const collectPayment = asyncHandler(async (req, res) => {
  const { appointment, payment } = await receptionService.collectPayment(
    req.params.id,
    req.user._id,
    req.body
  );
  res
    .status(201)
    .json(new ApiResponse(201, { appointment, payment }, 'Payment collected successfully.'));
});

const markArrived = asyncHandler(async (req, res) => {
  const appointment = await receptionService.markArrived(req.params.id);
  res.status(200).json(new ApiResponse(200, { appointment }, 'Patient marked as arrived.'));
});

const moveToDoctorQueue = asyncHandler(async (req, res) => {
  const appointment = await receptionService.moveToDoctorQueue(req.params.id);
  res
    .status(200)
    .json(new ApiResponse(200, { appointment }, 'Patient moved to the doctor queue.'));
});

const updateStatus = asyncHandler(async (req, res) => {
  const appointment = await receptionService.updateStatus(req.params.id, req.user._id, req.body);
  res
    .status(200)
    .json(new ApiResponse(200, { appointment }, `Appointment status updated to "${appointment.status}".`));
});

module.exports = {
  getTodaysAppointments,
  searchByBookingNumber,
  verifyPatient,
  collectPayment,
  markArrived,
  moveToDoctorQueue,
  updateStatus,
};
