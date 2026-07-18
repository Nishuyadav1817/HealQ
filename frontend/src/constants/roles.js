/**
 * MUST stay in sync with backend/src/constants/enums.js -> USER_ROLES.
 * Duplicated rather than shared via a package because frontend and
 * backend are separate deployables here — a monorepo with a shared
 * `packages/contracts` workspace would let this be a single source of
 * truth if the project grows into that shape.
 */
export const USER_ROLES = Object.freeze({
  PATIENT: 'patient',
  RECEPTIONIST: 'receptionist',
  DOCTOR_ASSISTANT: 'doctorAssistant',
  DOCTOR: 'doctor',
  ADMIN: 'admin',
});
