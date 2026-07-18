const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/ApiResponse');
const doctorService = require('./doctors.service');
const { USER_ROLES } = require('../../constants/enums');

const isAdminRequester = (req) => req.user?.role === USER_ROLES.ADMIN;

const createDoctor = asyncHandler(async (req, res) => {
  const doctor = await doctorService.createDoctor(req.body);
  res
    .status(201)
    .json(
      new ApiResponse(
        201,
        { doctor },
        'Doctor account created successfully. Login credentials have been emailed.'
      )
    );
});

const getDoctors = asyncHandler(async (req, res) => {
  const { doctors, total, pagination } = await doctorService.getDoctors(
    req.query,
    isAdminRequester(req)
  );
  res
    .status(200)
    .json(new ApiResponse(200, { doctors, total, ...pagination }, 'Doctors fetched successfully.'));
});

const getDoctorById = asyncHandler(async (req, res) => {
  const doctor = await doctorService.getDoctorById(req.params.id, isAdminRequester(req));
  res.status(200).json(new ApiResponse(200, { doctor }, 'Doctor fetched successfully.'));
});

const updateDoctor = asyncHandler(async (req, res) => {
  const doctor = await doctorService.updateDoctor(req.params.id, req.body);
  res.status(200).json(new ApiResponse(200, { doctor }, 'Doctor updated successfully.'));
});

const assignHospital = asyncHandler(async (req, res) => {
  const doctor = await doctorService.assignHospital(req.params.id, req.body.hospital);
  res.status(200).json(new ApiResponse(200, { doctor }, 'Doctor reassigned to new hospital.'));
});

const assignDepartment = asyncHandler(async (req, res) => {
  const doctor = await doctorService.assignDepartment(req.params.id, req.body.department);
  res.status(200).json(new ApiResponse(200, { doctor }, 'Doctor reassigned to new department.'));
});

const deleteDoctor = asyncHandler(async (req, res) => {
  await doctorService.softDeleteDoctor(req.params.id);
  res
    .status(200)
    .json(new ApiResponse(200, null, 'Doctor deactivated successfully.'));
});

module.exports = {
  createDoctor,
  getDoctors,
  getDoctorById,
  updateDoctor,
  assignHospital,
  assignDepartment,
  deleteDoctor,
};
