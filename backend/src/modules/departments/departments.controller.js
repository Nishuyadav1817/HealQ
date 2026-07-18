const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/ApiResponse');
const departmentService = require('./departments.service');
const { USER_ROLES } = require('../../constants/enums');

const isAdminRequester = (req) => req.user?.role === USER_ROLES.ADMIN;

const createDepartment = asyncHandler(async (req, res) => {
  const department = await departmentService.createDepartment(req.body);
  res.status(201).json(new ApiResponse(201, { department }, 'Department created successfully.'));
});

const getDepartments = asyncHandler(async (req, res) => {
  const { departments, total, pagination } = await departmentService.getDepartments(
    req.query,
    isAdminRequester(req)
  );
  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { departments, total, ...pagination },
        'Departments fetched successfully.'
      )
    );
});

const getDepartmentById = asyncHandler(async (req, res) => {
  const department = await departmentService.getDepartmentById(
    req.params.id,
    isAdminRequester(req)
  );
  res.status(200).json(new ApiResponse(200, { department }, 'Department fetched successfully.'));
});

const updateDepartment = asyncHandler(async (req, res) => {
  const department = await departmentService.updateDepartment(req.params.id, req.body);
  res.status(200).json(new ApiResponse(200, { department }, 'Department updated successfully.'));
});

const deleteDepartment = asyncHandler(async (req, res) => {
  await departmentService.softDeleteDepartment(req.params.id);
  res.status(200).json(new ApiResponse(200, null, 'Department and its doctors deactivated.'));
});

module.exports = {
  createDepartment,
  getDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment,
};
