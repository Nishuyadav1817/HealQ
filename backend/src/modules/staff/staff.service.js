const crypto = require('crypto');
const User = require('../auth/auth.model');
const Doctor = require('../doctors/doctors.model');
const Hospital = require('../hospitals/hospitals.model');
const ApiError = require('../../errors/ApiError');
const ApiFeatures = require('../../utils/apiFeatures.util');
const sendEmail = require('../../utils/email.util');
const config = require('../../config/env');
const { USER_ROLES } = require('../../constants/enums');

const STAFF_ROLES = [USER_ROLES.RECEPTIONIST, USER_ROLES.DOCTOR_ASSISTANT];

/** Only used as a fallback if a caller somehow gets past validation
 * without a password (shouldn't happen — both create schemas require
 * one now that the admin sets it directly). Kept so account creation
 * never hard-crashes on a missing password. */
const generateTempPassword = () => crypto.randomBytes(9).toString('base64url');

const STAFF_POPULATE = [
  { path: 'hospital', select: 'name' },
  {
    path: 'assignedDoctor',
    select: 'specialization user',
    populate: { path: 'user', select: 'fullName' },
  },
];

const assertHospitalActive = async (hospitalId) => {
  const hospital = await Hospital.findOne({ _id: hospitalId, isActive: true });
  if (!hospital) {
    throw new ApiError(404, 'Hospital not found or inactive.');
  }
  return hospital;
};

const assertNoExistingUser = async (email, phone) => {
  const existing = await User.findOne({ $or: [{ email }, { phone }] });
  if (existing) {
    throw new ApiError(409, 'A user with this email or phone already exists.');
  }
};

const sendWelcomeEmail = async ({ email, fullName, password, roleLabel }) => {
  // Same discipline as createDoctor: email failures never roll back an
  // otherwise-valid account — just log, and the admin can share the
  // credentials manually (the admin already knows the password, since
  // they set it).
  try {
    await sendEmail({
      to: email,
      subject: 'Your Staff Account Has Been Created',
      html: `
        <p>Hello ${fullName},</p>
        <p>An account has been created for you on HealQ as a ${roleLabel}.</p>
        <p><strong>Email:</strong> ${email}<br/>
        <strong>Password:</strong> ${password}</p>
        <p>Please log in at <a href="${config.clientUrl}/login">${config.clientUrl}/login</a>.</p>
      `,
    });
  } catch (err) {
    console.error('[staff.service] Failed to send staff welcome email:', err.message);
  }
};

const createReceptionist = async (payload) => {
  const { fullName, email, phone, gender, hospital, password } = payload;

  await assertNoExistingUser(email, phone);
  await assertHospitalActive(hospital);

  const user = await User.create({
    fullName,
    email,
    phone,
    gender,
    password: password || generateTempPassword(), // hashed by the User pre-save hook
    role: USER_ROLES.RECEPTIONIST,
    hospital,
  });

  await sendWelcomeEmail({ email, fullName, password, roleLabel: 'Receptionist' });

  return User.findById(user._id).populate(STAFF_POPULATE);
};

const createDoctorAssistant = async (payload) => {
  const { fullName, email, phone, gender, hospital, assignedDoctor, password } = payload;

  await assertNoExistingUser(email, phone);
  await assertHospitalActive(hospital);

  const doctor = await Doctor.findOne({ _id: assignedDoctor, isActive: true });
  if (!doctor) {
    throw new ApiError(404, 'Doctor not found or inactive.');
  }
  if (doctor.hospital.toString() !== hospital) {
    throw new ApiError(400, 'Selected doctor does not belong to the selected hospital.');
  }

  const user = await User.create({
    fullName,
    email,
    phone,
    gender,
    password: password || generateTempPassword(),
    role: USER_ROLES.DOCTOR_ASSISTANT,
    hospital,
    assignedDoctor,
  });

  await sendWelcomeEmail({ email, fullName, password, roleLabel: 'Doctor Assistant' });

  return User.findById(user._id).populate(STAFF_POPULATE);
};

const getStaff = async (queryString) => {
  const { role } = queryString;
  // Scoped to the two staff roles only — this listing is never meant to
  // surface patients/doctors/admins, regardless of what's passed in.
  const baseFilter = role && STAFF_ROLES.includes(role) ? { role } : { role: { $in: STAFF_ROLES } };

  const features = new ApiFeatures(User.find(baseFilter).populate(STAFF_POPULATE), queryString)
    .filter(['hospital', 'isActive'])
    .search(['fullName', 'email'])
    .sort()
    .paginate();

  const [staff, total] = await Promise.all([
    features.query,
    User.countDocuments({ ...baseFilter, ...features.filterQuery }),
  ]);

  return { staff, total, pagination: features.pagination };
};

const updateStaff = async (id, payload) => {
  const user = await User.findOne({ _id: id, role: { $in: STAFF_ROLES } });
  if (!user) {
    throw new ApiError(404, 'Staff member not found.');
  }

  if (payload.assignedDoctor !== undefined) {
    if (user.role !== USER_ROLES.DOCTOR_ASSISTANT) {
      throw new ApiError(400, 'assignedDoctor only applies to a Doctor Assistant account.');
    }
    if (payload.assignedDoctor) {
      const doctor = await Doctor.findOne({ _id: payload.assignedDoctor, isActive: true });
      if (!doctor || doctor.hospital.toString() !== user.hospital.toString()) {
        throw new ApiError(
          400,
          'assignedDoctor must be an active doctor belonging to the same hospital as this assistant.'
        );
      }
    }
  }

  Object.assign(user, payload);
  await user.save();

  return User.findById(id).populate(STAFF_POPULATE);
};

/** Soft delete — deactivates the account rather than removing it, same
 * reasoning as hospital/department/doctor soft delete: appointment/queue
 * history referencing this staff member should stay intact. */
const deactivateStaff = async (id) => {
  const user = await User.findOne({ _id: id, role: { $in: STAFF_ROLES } });
  if (!user) {
    throw new ApiError(404, 'Staff member not found.');
  }

  user.isActive = false;
  await user.save();
  return user;
};

module.exports = {
  createReceptionist,
  createDoctorAssistant,
  getStaff,
  updateStaff,
  deactivateStaff,
};
