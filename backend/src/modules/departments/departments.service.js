const Department = require('./departments.model');
const Hospital = require('../hospitals/hospitals.model');
const Doctor = require('../doctors/doctors.model');
const ApiError = require('../../errors/ApiError');
const ApiFeatures = require('../../utils/apiFeatures.util');
const withTransaction = require('../../utils/withTransaction.util');

const assertHospitalActive = async (hospitalId) => {
  const hospital = await Hospital.findOne({ _id: hospitalId, isActive: true });
  if (!hospital) {
    throw new ApiError(404, 'Hospital not found or inactive.');
  }
  return hospital;
};

const createDepartment = async (payload) => {
  await assertHospitalActive(payload.hospital);

  const existing = await Department.findOne({ hospital: payload.hospital, name: payload.name });
  if (existing) {
    throw new ApiError(409, `Department "${payload.name}" already exists for this hospital.`);
  }

  return Department.create(payload);
};

const getDepartments = async (queryString, isAdmin = false) => {
  const query = { ...queryString };
  if (!isAdmin) query.isActive = 'true';

  const features = new ApiFeatures(
    Department.find().populate('hospital', 'name').populate('headDoctor', 'specialization'),
    query
  )
    .filter(['hospital', 'isActive'])
    .search(['name'])
    .sort()
    .paginate();

  const [departments, total] = await Promise.all([
    features.query,
    Department.countDocuments(features.filterQuery),
  ]);

  return { departments, total, pagination: features.pagination };
};

const getDepartmentById = async (id, isAdmin = false) => {
  const filter = { _id: id };
  if (!isAdmin) filter.isActive = true;

  const department = await Department.findOne(filter)
    .populate('hospital', 'name')
    .populate('headDoctor', 'specialization');
  if (!department) {
    throw new ApiError(404, 'Department not found.');
  }
  return department;
};

const updateDepartment = async (id, payload) => {
  const department = await Department.findById(id);
  if (!department) {
    throw new ApiError(404, 'Department not found.');
  }

  if (payload.name && payload.name !== department.name) {
    const duplicate = await Department.findOne({
      hospital: department.hospital,
      name: payload.name,
      _id: { $ne: id },
    });
    if (duplicate) {
      throw new ApiError(409, `Department "${payload.name}" already exists for this hospital.`);
    }
  }

  if (payload.headDoctor) {
    const doctor = await Doctor.findById(payload.headDoctor);
    if (!doctor || doctor.hospital.toString() !== department.hospital.toString()) {
      throw new ApiError(400, 'headDoctor must be a doctor belonging to the same hospital.');
    }
  }

  Object.assign(department, payload);
  await department.save();
  return department;
};

/**
 * Cascades to Doctors within this specific department (not the whole
 * hospital) — same reasoning as hospital soft delete: no active doctor
 * should be left bookable under a deactivated department.
 */
const softDeleteDepartment = async (id) => {
  const department = await Department.findById(id);
  if (!department) {
    throw new ApiError(404, 'Department not found.');
  }

  return withTransaction(async (session) => {
    department.isActive = false;
    await department.save({ session });

    await Doctor.updateMany({ department: id }, { isActive: false }, { session });

    return department;
  });
};

module.exports = {
  createDepartment,
  getDepartments,
  getDepartmentById,
  updateDepartment,
  softDeleteDepartment,
};
