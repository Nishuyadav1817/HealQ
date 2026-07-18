import { useEffect, useState } from 'react';
import Modal from '../../../components/ui/Modal';
import Field from '../../../components/ui/Field';
import Button from '../../../components/ui/Button';
import { useAdminHospitals } from '../hooks/useAdminHospitals';
import { useDoctorsLookup } from '../hooks/useLookups';
import { useCreateReceptionist, useCreateDoctorAssistant } from '../hooks/useAdminStaff';
import { getApiErrorMessage } from '../../../utils/apiError';

const ROLES = {
  RECEPTIONIST: 'receptionist',
  DOCTOR_ASSISTANT: 'doctorAssistant',
};

const emptyForm = {
  role: ROLES.RECEPTIONIST,
  fullName: '',
  email: '',
  phone: '',
  password: '',
  gender: '',
  hospital: '',
  assignedDoctor: '',
};

/**
 * Create form for staff accounts. Both roles are admin-provisioned only
 * (never public self-registration — see PUBLIC_REGISTER_ROLES in
 * auth.validation.js):
 *  - Receptionist is scoped to a Hospital only.
 *  - Doctor Assistant is scoped to a Hospital AND one specific Doctor —
 *    the "Assigned doctor" field, enforced server-side on every queue
 *    action in doctorAssistant.service.js, not just at creation time.
 *
 * The admin sets the password directly here (rather than a system-
 * generated temp password) so the new staff member can log in right
 * away with credentials the admin already knows and can hand off
 * immediately, without depending on email delivery.
 */
const StaffFormModal = ({ isOpen, onClose, presetHospitalId = '' }) => {
  const [form, setForm] = useState(emptyForm);

  const { data: hospitalsData } = useAdminHospitals({ limit: 100, isActive: 'true' });
  const { data: doctors } = useDoctorsLookup(form.hospital);
  const createReceptionistMutation = useCreateReceptionist();
  const createDoctorAssistantMutation = useCreateDoctorAssistant();
  const mutation =
    form.role === ROLES.RECEPTIONIST ? createReceptionistMutation : createDoctorAssistantMutation;

  useEffect(() => {
    if (isOpen) setForm({ ...emptyForm, hospital: presetHospitalId || '' });
  }, [isOpen, presetHospitalId]);

  const setField = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const setRole = (role) =>
    setForm((prev) => ({ ...prev, role, assignedDoctor: '' })); // reset doctor pick when switching roles

  const handleSubmit = async (e) => {
    e.preventDefault();

    const basePayload = {
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      password: form.password,
      gender: form.gender || undefined,
      hospital: form.hospital,
    };

    if (form.role === ROLES.RECEPTIONIST) {
      await createReceptionistMutation.mutateAsync(basePayload);
    } else {
      await createDoctorAssistantMutation.mutateAsync({
        ...basePayload,
        assignedDoctor: form.assignedDoctor,
      });
    }
    onClose();
  };

  return (
    <Modal title="Add Staff Member" isOpen={isOpen} onClose={onClose} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-2">
          <Button
            type="button"
            size="sm"
            variant={form.role === ROLES.RECEPTIONIST ? 'primary' : 'secondary'}
            onClick={() => setRole(ROLES.RECEPTIONIST)}
          >
            Receptionist
          </Button>
          <Button
            type="button"
            size="sm"
            variant={form.role === ROLES.DOCTOR_ASSISTANT ? 'primary' : 'secondary'}
            onClick={() => setRole(ROLES.DOCTOR_ASSISTANT)}
          >
            Doctor Assistant
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name" value={form.fullName} onChange={setField('fullName')} required />
          <Field label="Email" type="email" value={form.email} onChange={setField('email')} required />
          <Field label="Phone" value={form.phone} onChange={setField('phone')} required />
          <Field label="Gender (optional)" as="select" value={form.gender} onChange={setField('gender')}>
            <option value="">Select</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </Field>
        </div>

        <div>
          <Field
            label="Password"
            type="password"
            value={form.password}
            onChange={setField('password')}
            required
          />
          <p className="mt-1 text-xs text-ink-subtle">
            At least 8 characters, with an uppercase letter, lowercase letter, number, and symbol.
            Share this with the new staff member — they'll log in with it directly.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Hospital"
            as="select"
            value={form.hospital}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, hospital: e.target.value, assignedDoctor: '' }))
            }
            required
          >
            <option value="">Select a hospital</option>
            {hospitalsData?.hospitals?.map((h) => (
              <option key={h._id} value={h._id}>
                {h.name}
              </option>
            ))}
          </Field>

          {form.role === ROLES.DOCTOR_ASSISTANT && (
            <Field
              label="Assigned doctor"
              as="select"
              value={form.assignedDoctor}
              onChange={setField('assignedDoctor')}
              required
              disabled={!form.hospital}
            >
              <option value="">{form.hospital ? 'Select a doctor' : 'Choose a hospital first'}</option>
              {doctors?.map((d) => (
                <option key={d._id} value={d._id}>
                  Dr. {d.user?.fullName} — {d.specialization}
                </option>
              ))}
            </Field>
          )}
        </div>

        {form.role === ROLES.DOCTOR_ASSISTANT && (
          <p className="text-xs text-ink-subtle">
            This assistant will only be able to manage the assigned doctor's queue — not any other
            doctor's, even within the same hospital.
          </p>
        )}

        {mutation.isError && (
          <p className="text-xs font-medium text-danger">{getApiErrorMessage(mutation.error)}</p>
        )}

        <div className="flex justify-end gap-2 border-t border-surface-border pt-4">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={mutation.isPending}>
            Create {form.role === ROLES.RECEPTIONIST ? 'receptionist' : 'doctor assistant'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default StaffFormModal;
