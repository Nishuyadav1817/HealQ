const User = require('../auth/auth.model');
const Hospital = require('../hospitals/hospitals.model');
const Doctor = require('../doctors/doctors.model');
const Appointment = require('../appointments/appointments.model');
const Payment = require('../payments/payments.model');
const Queue = require('../queue/queue.model');
const ApiError = require('../../errors/ApiError');
const ApiFeatures = require('../../utils/apiFeatures.util');
const { normalizeDateOnly, getHospitalNow } = require('../../utils/datetime.util');
const { USER_ROLES, PAYMENT_STATUS } = require('../../constants/enums');

const APPOINTMENT_POPULATE = [
  {
    path: 'doctor',
    select: 'specialization user',
    populate: { path: 'user', select: 'fullName' },
  },
  { path: 'hospital', select: 'name' },
  { path: 'department', select: 'name' },
  { path: 'patient', select: 'fullName phone email' },
];

// ---------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------

/** `n` days ago, normalized to midnight, inclusive of today — e.g.
 * days=7 covers [today-6 .. today], 7 calendar days total. */
const daysAgo = (n) => {
  const d = normalizeDateOnly(getHospitalNow());
  d.setUTCDate(d.getUTCDate() - (n - 1));
  return d;
};

/** Every date-string key in [from, today], even ones with zero
 * documents — so a chart never silently skips a day with no activity. */
const buildDateSeries = (from, toInclusive = getHospitalNow()) => {
  const keys = [];
  const cursor = normalizeDateOnly(from);
  const end = normalizeDateOnly(toInclusive);
  while (cursor <= end) {
    keys.push(cursor.toISOString().slice(0, 10));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return keys;
};

/** Merges a sparse `{ _id: 'YYYY-MM-DD', ...metrics }` aggregation result
 * onto a complete date series, zero-filling any missing day. */
const fillSeries = (dateKeys, rows, valueKey = 'count') => {
  const byDate = new Map(rows.map((row) => [row._id, row[valueKey]]));
  return dateKeys.map((date) => ({ date, [valueKey]: byDate.get(date) || 0 }));
};

// ---------------------------------------------------------------------
// 1. Dashboard summary — the top-row stat cards on Overview.
// ---------------------------------------------------------------------
const getDashboardSummary = async () => {
  const today = normalizeDateOnly(getHospitalNow());
  const tomorrow = new Date(today);
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);

  const last7 = daysAgo(7);
  const prev7Start = daysAgo(14);
  const prev7End = last7;

  const [
    totalHospitals,
    activeHospitals,
    totalDoctors,
    activeDoctors,
    totalPatients,
    totalAppointments,
    appointmentsToday,
    activeQueuesToday,
    revenueAgg,
    revenueTodayAgg,
    appointmentsLast7,
    appointmentsPrev7,
  ] = await Promise.all([
    Hospital.countDocuments({}),
    Hospital.countDocuments({ isActive: true }),
    Doctor.countDocuments({}),
    Doctor.countDocuments({ isActive: true }),
    User.countDocuments({ role: USER_ROLES.PATIENT }),
    Appointment.countDocuments({}),
    Appointment.countDocuments({ appointmentDate: { $gte: today, $lt: tomorrow } }),
    Queue.countDocuments({ date: today, status: 'active' }),
    Payment.aggregate([
      { $match: { status: PAYMENT_STATUS.SUCCESS } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    Payment.aggregate([
      { $match: { status: PAYMENT_STATUS.SUCCESS, paidAt: { $gte: today, $lt: tomorrow } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    Appointment.countDocuments({ appointmentDate: { $gte: last7, $lt: tomorrow } }),
    Appointment.countDocuments({ appointmentDate: { $gte: prev7Start, $lt: prev7End } }),
  ]);

  // Week-over-week % change — lets the Overview cards show a trend arrow
  // instead of just a raw number. Guarded against divide-by-zero.
  const appointmentsTrendPct =
    appointmentsPrev7 === 0
      ? null
      : Math.round(((appointmentsLast7 - appointmentsPrev7) / appointmentsPrev7) * 1000) / 10;

  return {
    hospitals: { total: totalHospitals, active: activeHospitals },
    doctors: { total: totalDoctors, active: activeDoctors },
    patients: { total: totalPatients },
    appointments: {
      total: totalAppointments,
      today: appointmentsToday,
      last7Days: appointmentsLast7,
      trendPct: appointmentsTrendPct,
    },
    revenue: {
      total: revenueAgg[0]?.total || 0,
      today: revenueTodayAgg[0]?.total || 0,
    },
    activeQueuesToday,
  };
};

// ---------------------------------------------------------------------
// 2. Analytics — chart-ready time series + breakdowns for the Charts
//    and Analytics tabs. Also the data backing the Reports tab's tables
//    (Reports is this same data, presented for reading/export rather
//    than for plotting).
// ---------------------------------------------------------------------
const getAnalytics = async ({ days = 30 } = {}) => {
  const from = daysAgo(days);
  const dateKeys = buildDateSeries(from);

  const [
    appointmentsPerDayRaw,
    appointmentsByStatusRaw,
    revenuePerDayRaw,
    newPatientsPerDayRaw,
    appointmentsByHospitalRaw,
    appointmentsByDepartmentRaw,
    topDoctorsRaw,
  ] = await Promise.all([
    Appointment.aggregate([
      { $match: { appointmentDate: { $gte: from } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$appointmentDate' } },
          count: { $sum: 1 },
        },
      },
    ]),

    Appointment.aggregate([
      { $match: { appointmentDate: { $gte: from } } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),

    Payment.aggregate([
      { $match: { status: PAYMENT_STATUS.SUCCESS, paidAt: { $gte: from } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$paidAt' } },
          revenue: { $sum: '$amount' },
        },
      },
    ]),

    User.aggregate([
      { $match: { role: USER_ROLES.PATIENT, createdAt: { $gte: from } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
    ]),

    Appointment.aggregate([
      { $match: { appointmentDate: { $gte: from } } },
      { $group: { _id: '$hospital', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 8 },
      {
        $lookup: { from: 'hospitals', localField: '_id', foreignField: '_id', as: 'hospital' },
      },
      { $unwind: '$hospital' },
      { $project: { _id: 0, hospitalId: '$_id', name: '$hospital.name', count: 1 } },
    ]),

    Appointment.aggregate([
      { $match: { appointmentDate: { $gte: from } } },
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 8 },
      {
        $lookup: { from: 'departments', localField: '_id', foreignField: '_id', as: 'department' },
      },
      { $unwind: '$department' },
      { $project: { _id: 0, departmentId: '$_id', name: '$department.name', count: 1 } },
    ]),

    Appointment.aggregate([
      { $match: { appointmentDate: { $gte: from }, status: 'completed' } },
      { $group: { _id: '$doctor', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 8 },
      { $lookup: { from: 'doctors', localField: '_id', foreignField: '_id', as: 'doctor' } },
      { $unwind: '$doctor' },
      { $lookup: { from: 'users', localField: 'doctor.user', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
      {
        $project: {
          _id: 0,
          doctorId: '$_id',
          name: '$user.fullName',
          specialization: '$doctor.specialization',
          consultationsCompleted: '$count',
        },
      },
    ]),
  ]);

  return {
    range: { days, from: from.toISOString().slice(0, 10) },
    appointmentsPerDay: fillSeries(dateKeys, appointmentsPerDayRaw, 'count'),
    revenuePerDay: fillSeries(dateKeys, revenuePerDayRaw, 'revenue'),
    newPatientsPerDay: fillSeries(dateKeys, newPatientsPerDayRaw, 'count'),
    appointmentsByStatus: appointmentsByStatusRaw.map((row) => ({
      status: row._id,
      count: row.count,
    })),
    appointmentsByHospital: appointmentsByHospitalRaw,
    appointmentsByDepartment: appointmentsByDepartmentRaw,
    topDoctors: topDoctorsRaw,
  };
};

// ---------------------------------------------------------------------
// 3. Patients — admin-wide listing, unlike patients.routes.js which only
//    exposes a patient's OWN appointments to themselves.
// ---------------------------------------------------------------------
const getPatients = async (queryString) => {
  const query = { ...queryString };

  const features = new ApiFeatures(
    User.find({ role: USER_ROLES.PATIENT }).populate('address.city', 'name state'),
    query
  )
    .filter(['isActive'])
    .search(['fullName', 'email', 'phone'])
    .sort()
    .paginate();

  // City is nested in filterQuery's exact-match — ApiFeatures.filter()
  // only matches top-level field names against the queryString, so the
  // dotted path is applied the same way here for the count to match.
  if (query.city) {
    features.filterQuery['address.city'] = query.city;
    features.query = features.query.find({ 'address.city': query.city });
  }

  const [patients, total] = await Promise.all([
    features.query,
    User.countDocuments({ role: USER_ROLES.PATIENT, ...features.filterQuery }),
  ]);

  return { patients, total, pagination: features.pagination };
};

const getPatientById = async (id) => {
  const patient = await User.findOne({ _id: id, role: USER_ROLES.PATIENT }).populate(
    'address.city',
    'name state'
  );
  if (!patient) {
    throw new ApiError(404, 'Patient not found.');
  }

  const recentAppointments = await Appointment.find({ patient: id })
    .sort('-appointmentDate')
    .limit(10)
    .populate(APPOINTMENT_POPULATE);

  const [totalAppointments, completedAppointments] = await Promise.all([
    Appointment.countDocuments({ patient: id }),
    Appointment.countDocuments({ patient: id, status: 'completed' }),
  ]);

  return {
    patient,
    stats: { totalAppointments, completedAppointments },
    recentAppointments,
  };
};

// ---------------------------------------------------------------------
// 4. Appointments — admin-wide listing across every hospital, with the
//    filters a support/ops admin actually needs (status, hospital,
//    doctor, department, date range, booking-number search).
// ---------------------------------------------------------------------
const getAppointments = async (queryString) => {
  const query = { ...queryString };

  const features = new ApiFeatures(Appointment.find().populate(APPOINTMENT_POPULATE), query)
    .filter(['status', 'hospital', 'doctor', 'department'])
    .search(['bookingNumber'])
    .sort();

  if (query.from || query.to) {
    const dateFilter = {};
    if (query.from) dateFilter.$gte = normalizeDateOnly(query.from);
    if (query.to) dateFilter.$lte = normalizeDateOnly(query.to);
    features.filterQuery.appointmentDate = dateFilter;
    features.query = features.query.find({ appointmentDate: dateFilter });
  }

  features.paginate();

  const [appointments, total] = await Promise.all([
    features.query,
    Appointment.countDocuments(features.filterQuery),
  ]);

  return { appointments, total, pagination: features.pagination };
};

const getAppointmentById = async (id) => {
  const appointment = await Appointment.findById(id).populate(APPOINTMENT_POPULATE);
  if (!appointment) {
    throw new ApiError(404, 'Appointment not found.');
  }
  return appointment;
};

module.exports = {
  getDashboardSummary,
  getAnalytics,
  getPatients,
  getPatientById,
  getAppointments,
  getAppointmentById,
};
