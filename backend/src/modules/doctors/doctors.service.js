const crypto = require('crypto');
const User = require('../auth/auth.model');
const Doctor = require('./doctors.model');
const Hospital = require('../hospitals/hospitals.model');
const Department = require('../departments/departments.model');
const ApiError = require('../../errors/ApiError');
const ApiFeatures = require('../../utils/apiFeatures.util');
const withTransaction = require('../../utils/withTransaction.util');
const sendEmail = require('../../utils/email.util');
const config = require('../../config/env');
const { USER_ROLES } = require('../../constants/enums');

/**
 * Generates a random temporary password for a newly provisioned staff
 * account. The doctor receives this via email and is expected to reset it
 * on first login. (A `mustChangePassword` flag is a natural follow-up
 * addition once the profile/settings module exists.)
 */
const generateTempPassword = () => crypto.randomBytes(9).toString('base64url'); // ~12 chars

const DOCTOR_POPULATE = [
  { path: 'user', select: 'fullName email phone gender dateOfBirth isActive profileImage' },
  { path: 'hospital', select: 'name city address contact.phone' },
  { path: 'department', select: 'name' },
];

/**
 * Creates the doctor's User (auth identity) and Doctor (professional
 * profile) documents together, atomically. If either insert fails, both
 * are rolled back — we never want a User with no matching Doctor profile,
 * or vice versa.
 */
const createDoctor = async (payload) => {
  const {
    fullName, email, phone, gender, dateOfBirth,
    hospital, department, specialization, qualifications,
    experienceYears, licenseNumber, consultationFee, availability,
  } = payload;

  const [existingUser, existingLicense, hospitalDoc, departmentDoc] = await Promise.all([
    User.findOne({ $or: [{ email }, { phone }] }),
    Doctor.findOne({ licenseNumber }),
    Hospital.findOne({ _id: hospital, isActive: true }),
    Department.findOne({ _id: department, isActive: true }),
  ]);

  if (existingUser) {
    throw new ApiError(409, 'A user with this email or phone already exists.');
  }
  if (existingLicense) {
    throw new ApiError(409, 'A doctor with this license number already exists.');
  }
  if (!hospitalDoc) {
    throw new ApiError(404, 'Hospital not found or inactive.');
  }
  if (!departmentDoc) {
    throw new ApiError(404, 'Department not found or inactive.');
  }
  if (departmentDoc.hospital.toString() !== hospital) {
    throw new ApiError(400, 'Selected department does not belong to the selected hospital.');
  }

  const tempPassword = generateTempPassword();

  const { doctorId } = await withTransaction(async (session) => {
    const [user] = await User.create(
      [
        {
          fullName,
          email,
          phone,
          gender,
          dateOfBirth,
          password: tempPassword, // hashed by the User pre-save hook
          role: USER_ROLES.DOCTOR,
          hospital,
        },
      ],
      { session }
    );

    const [doctor] = await Doctor.create(
      [
        {
          user: user._id,
          hospital,
          department,
          specialization,
          qualifications,
          experienceYears,
          licenseNumber,
          consultationFee,
          availability,
        },
      ],
      { session }
    );

    return { doctorId: doctor._id };
  });

  // Email delivery happens AFTER the transaction commits. A failed email
  // should never roll back an otherwise-valid account — we log and let the
  // admin resend/share credentials manually instead.
  try {
    await sendEmail({
      to: email,
      subject: 'Your Doctor Account Has Been Created',
      html: `
        <p>Hello Dr. ${fullName},</p>
        <p>An account has been created for you on HealQ.</p>
        <p><strong>Email:</strong> ${email}<br/>
        <strong>Temporary Password:</strong> ${tempPassword}</p>
        <p>Please log in at <a href="${config.clientUrl}/login">${config.clientUrl}/login</a> and change your password immediately.</p>
      `,
    });
  } catch (err) {
    console.error('[doctors.service] Failed to send doctor welcome email:', err.message);
  }

  return Doctor.findById(doctorId).populate(DOCTOR_POPULATE);
};

const getDoctors = async (queryString, isAdmin = false) => {
  const query = { ...queryString };
  if (!isAdmin) query.isActive = 'true';

  const features = new ApiFeatures(Doctor.find().populate(DOCTOR_POPULATE), query)
    .filter(['hospital', 'department', 'isActive'])
    .search(['specialization'])
    .sort()
    .paginate();

  const [doctors, total] = await Promise.all([
    features.query,
    Doctor.countDocuments(features.filterQuery),
  ]);

  return { doctors, total, pagination: features.pagination };
};

const getDoctorById = async (id, isAdmin = false) => {
  const filter = { _id: id };
  if (!isAdmin) filter.isActive = true;

  const doctor = await Doctor.findOne(filter).populate(DOCTOR_POPULATE);
  if (!doctor) throw new ApiError(404, 'Doctor not found.');
  return doctor;
};

const updateDoctor = async (id, payload) => {
  const doctor = await Doctor.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  }).populate(DOCTOR_POPULATE);
  if (!doctor) throw new ApiError(404, 'Doctor not found.');
  return doctor;
};

/**
 * Reassigns a doctor to a different hospital. The doctor's User.hospital
 * field is kept in sync in the same transaction — those two fields must
 * never drift apart, since auth/RBAC and staff-listing queries rely on
 * User.hospital being correct.
 *
 * NOTE: reassigning hospital does NOT auto-reassign department (a
 * department is hospital-specific) — callers must follow up with
 * assign-department, which is enforced by the department-reassignment
 * check below.
 */
const assignHospital = async (id, hospitalId) => {
  const doctor = await Doctor.findById(id);
  if (!doctor) throw new ApiError(404, 'Doctor not found.');

  const hospital = await Hospital.findOne({ _id: hospitalId, isActive: true });
  if (!hospital) throw new ApiError(404, 'Hospital not found or inactive.');

  return withTransaction(async (session) => {
    doctor.hospital = hospitalId;
    await doctor.save({ session });
    await User.findByIdAndUpdate(doctor.user, { hospital: hospitalId }, { session });
    return Doctor.findById(id).populate(DOCTOR_POPULATE).session(session);
  });
};

/**
 * Reassigns a doctor to a different department. Enforces that the target
 * department actually belongs to the doctor's CURRENT hospital — silently
 * allowing a cross-hospital department assignment would produce
 * inconsistent hospital/department pairs throughout appointments/queues.
 */
const assignDepartment = async (id, departmentId) => {
  const doctor = await Doctor.findById(id);
  if (!doctor) throw new ApiError(404, 'Doctor not found.');

  const department = await Department.findOne({ _id: departmentId, isActive: true });
  if (!department) throw new ApiError(404, 'Department not found or inactive.');

  if (department.hospital.toString() !== doctor.hospital.toString()) {
    throw new ApiError(
      400,
      "Cannot assign a department that does not belong to the doctor's current hospital. Reassign the hospital first."
    );
  }

  doctor.department = departmentId;
  await doctor.save();
  return Doctor.findById(id).populate(DOCTOR_POPULATE);
};

/**
 * Soft-deletes a doctor AND deactivates their underlying User account in
 * the same transaction — a deactivated doctor must not still be able to
 * log in.
 */
const softDeleteDoctor = async (id) => {
  const doctor = await Doctor.findById(id);
  if (!doctor) throw new ApiError(404, 'Doctor not found.');

  return withTransaction(async (session) => {
    doctor.isActive = false;
    doctor.isAvailableToday = false;
    await doctor.save({ session });
    await User.findByIdAndUpdate(doctor.user, { isActive: false }, { session });
    return doctor;
  });
};

/**
 * Marks a doctor as unavailable on a specific date.
 * Used for leave, special duties, etc.
 */
const markUnavailable = async (doctorId, date, reason, userId) => {
  const doctor = await Doctor.findById(doctorId);
  if (!doctor) throw new ApiError(404, 'Doctor not found.');

  // Normalize date to midnight UTC (date-only, no time component)
  const normalizedDate = new Date(date);
  normalizedDate.setUTCHours(0, 0, 0, 0);

  // Check if already marked unavailable on this date
  const exists = doctor.unavailability.some(
    (u) => u.date.getTime() === normalizedDate.getTime()
  );
  if (exists) {
    throw new ApiError(400, 'Doctor is already marked unavailable on this date.');
  }

  doctor.unavailability.push({
    date: normalizedDate,
    reason: reason || 'Doctor unavailable',
    createdBy: userId,
  });

  await doctor.save();
  return doctor.populate([
    { path: 'unavailability.createdBy', select: 'fullName' },
  ]);
};

/**
 * Removes unavailability for a specific date.
 */
const removeUnavailability = async (doctorId, dateString) => {
  const doctor = await Doctor.findById(doctorId);
  if (!doctor) throw new ApiError(404, 'Doctor not found.');

  const targetDate = new Date(dateString);
  targetDate.setUTCHours(0, 0, 0, 0);

  const initialLength = doctor.unavailability.length;
  doctor.unavailability = doctor.unavailability.filter(
    (u) => u.date.getTime() !== targetDate.getTime()
  );

  if (doctor.unavailability.length === initialLength) {
    throw new ApiError(400, 'No unavailability record found for this date.');
  }

  await doctor.save();
  return doctor;
};

/**
 * Gets all unavailability dates for a doctor.
 */
const getUnavailability = async (doctorId) => {
  const doctor = await Doctor.findById(doctorId).populate(
    'unavailability.createdBy',
    'fullName'
  );
  if (!doctor) throw new ApiError(404, 'Doctor not found.');

  return doctor.unavailability || [];
};

module.exports = {
  createDoctor,
  getDoctors,
  getDoctorById,
  updateDoctor,
  assignHospital,
  assignDepartment,
  softDeleteDoctor,
  markUnavailable,
  removeUnavailability,
  getUnavailability,
};
