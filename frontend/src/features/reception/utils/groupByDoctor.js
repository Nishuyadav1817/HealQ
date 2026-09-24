const TERMINAL_STATUSES = ['completed', 'cancelled', 'no-show'];

/**
 * Turns the flat "Today's Patients" list into one summary row per
 * doctor: who's currently in consultation (their token = "now serving"),
 * who's up next (lowest token among everyone still waiting), and how
 * many are still waiting. Every field comes from `appointment.status`
 * and `appointment.tokenNumber`, already present on each record — this
 * is presentation only, not a new source of truth.
 */
const groupByDoctor = (appointments = []) => {
  const groups = new Map();

  appointments.forEach((appointment) => {
    const doctorId = appointment.doctor?._id || appointment.doctor;
    if (!doctorId) return;

    if (!groups.has(doctorId)) {
      groups.set(doctorId, {
        doctorId,
        name: appointment.doctor?.user?.fullName,
        department: appointment.department?.name,
        appointments: [],
      });
    }
    groups.get(doctorId).appointments.push(appointment);
  });

  return Array.from(groups.values())
    .map((group) => {
      const active = group.appointments.filter((a) => !TERMINAL_STATUSES.includes(a.status));
      const inConsultation = group.appointments.find((a) => a.status === 'in-consultation');
      const waiting = active
        .filter((a) => a.status !== 'in-consultation')
        .sort((a, b) => (a.tokenNumber ?? Infinity) - (b.tokenNumber ?? Infinity));

      return {
        doctorId: group.doctorId,
        name: group.name,
        department: group.department,
        totalToday: group.appointments.length,
        waitingCount: waiting.length,
        nowServingToken: inConsultation?.tokenNumber ?? null,
        nextToken: waiting[0]?.tokenNumber ?? null,
        isInConsultation: !!inConsultation,
      };
    })
    .sort((a, b) => (a.name || '').localeCompare(b.name || ''));
};

export default groupByDoctor;
