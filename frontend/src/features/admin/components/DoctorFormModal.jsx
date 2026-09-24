import React from "react";
import { useEffect, useState } from 'react';
import Modal from '../../../components/ui/Modal';
import Field from '../../../components/ui/Field';
import Button from '../../../components/ui/Button';
import { useAdminHospitals } from '../hooks/useAdminHospitals';
import { useDepartmentsLookup } from '../hooks/useLookups';
import { useCreateDoctor, useUpdateDoctor } from '../hooks/useAdminDoctors';
import { getApiErrorMessage } from '../../../utils/apiError';
import { WEEKDAYS } from '../../../constants/weekdays';

const DEFAULT_DAY_SLOT = { enabled: false, startTime: '09:00', endTime: '17:00' };

const emptyAvailability = () =>
  WEEKDAYS.reduce((acc, { value }) => ({ ...acc, [value]: { ...DEFAULT_DAY_SLOT } }), {});

const emptyForm = {
  fullName: '',
  email: '',
  phone: '',
  hospital: '',
  department: '',
  specialization: '',
  licenseNumber: '',
  experienceYears: '',
  consultationFee: '',
  isAvailableToday: true,
  availability: emptyAvailability(),
};

/** Turns the Doctor document's `availability` array (only the days that
 * ARE configured) into the day-keyed map the form/table below works with,
 * so every weekday always has a row, whether it's set up yet or not. */
const toAvailabilityFormState = (availability = []) => {
  const map = emptyAvailability();
  availability.forEach((slot) => {
    if (map[slot.day]) {
      map[slot.day] = {
        enabled: true,
        startTime: slot.startTime,
        endTime: slot.endTime,
      };
    }
  });
  return map;
};

/** Inverse of the above — only enabled days are sent to the API, since
 * an unchecked day simply shouldn't have an availability entry at all. */
const toAvailabilityPayload = (availabilityForm) =>
  WEEKDAYS.filter(({ value }) => availabilityForm[value]?.enabled).map(({ value }) => ({
    day: value,
    startTime: availabilityForm[value].startTime,
    endTime: availabilityForm[value].endTime,
  }));

const toFormState = (doctor) => {
  if (!doctor) return emptyForm;
  return {
    fullName: doctor.user?.fullName ?? '',
    email: doctor.user?.email ?? '',
    phone: doctor.user?.phone ?? '',
    hospital: doctor.hospital?._id ?? doctor.hospital ?? '',
    department: doctor.department?._id ?? doctor.department ?? '',
    specialization: doctor.specialization ?? '',
    licenseNumber: doctor.licenseNumber ?? '',
    experienceYears: doctor.experienceYears ?? '',
    consultationFee: doctor.consultationFee ?? '',
    isAvailableToday: doctor.isAvailableToday ?? true,
    availability: toAvailabilityFormState(doctor.availability),
  };
};

/**
 * Doctor create/edit intentionally does NOT touch hospital/department
 * assignment on edit (the backend deliberately routes that through
 * dedicated assign-hospital/assign-department endpoints — see
 * doctors.service.js) or account fields like email/phone. Those two
 * fields are shown read-only in edit mode so the admin can still see
 * who they're editing.
 *
 * Weekly availability (which days/hours a doctor is bookable) IS editable
 * here in both create and edit mode — the backend has always accepted it
 * on both `POST /doctors` and `PATCH /doctors/:id`, this form just never
 * exposed it, which meant every doctor was silently created with
 * `availability: []` and could never be booked on any day at all.
 */
const DoctorFormModal = ({ isOpen, onClose, doctor = null }) => {
  const [form, setForm] = useState(emptyForm);
  const isEditing = !!doctor;

  const { data: hospitalsData } = useAdminHospitals({ limit: 100, isActive: 'true' });
  const { data: departments } = useDepartmentsLookup(form.hospital);
  const createMutation = useCreateDoctor();
  const updateMutation = useUpdateDoctor();
  const mutation = isEditing ? updateMutation : createMutation;

  useEffect(() => {
    if (isOpen) setForm(toFormState(doctor));
  }, [isOpen, doctor]);

  const setField = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const setDayField = (day, field) => (e) => {
    const value = field === 'enabled' ? e.target.checked : e.target.value;
    setForm((prev) => ({
      ...prev,
      availability: {
        ...prev.availability,
        [day]: { ...prev.availability[day], [field]: value },
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const availability = toAvailabilityPayload(form.availability);

    if (isEditing) {
      await updateMutation.mutateAsync({
        id: doctor._id,
        payload: {
          specialization: form.specialization.trim(),
          licenseNumber: form.licenseNumber.trim(),
          experienceYears: form.experienceYears ? Number(form.experienceYears) : undefined,
          consultationFee: Number(form.consultationFee),
          isAvailableToday: form.isAvailableToday,
          availability,
        },
      });
    } else {
      await createMutation.mutateAsync({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        hospital: form.hospital,
        department: form.department,
        specialization: form.specialization.trim(),
        licenseNumber: form.licenseNumber.trim(),
        experienceYears: form.experienceYears ? Number(form.experienceYears) : 0,
        consultationFee: Number(form.consultationFee),
        availability,
      });
    }
    onClose();
  };

  return (
    <Modal title={isEditing ? 'Edit Doctor' : 'Create Doctor'} isOpen={isOpen} onClose={onClose} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name" value={form.fullName} onChange={setField('fullName')} required disabled={isEditing} />
          <Field label="Email" type="email" value={form.email} onChange={setField('email')} required disabled={isEditing} />
          <Field label="Phone" value={form.phone} onChange={setField('phone')} required disabled={isEditing} />
          <Field
            label="License number"
            value={form.licenseNumber}
            onChange={setField('licenseNumber')}
            required
          />
        </div>

        {!isEditing && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Hospital" as="select" value={form.hospital} onChange={setField('hospital')} required>
              <option value="">Select a hospital</option>
              {hospitalsData?.hospitals?.map((h) => (
                <option key={h._id} value={h._id}>
                  {h.name}
                </option>
              ))}
            </Field>
            <Field
              label="Department"
              as="select"
              value={form.department}
              onChange={setField('department')}
              required
              disabled={!form.hospital}
            >
              <option value="">{form.hospital ? 'Select a department' : 'Choose a hospital first'}</option>
              {departments?.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name}
                </option>
              ))}
            </Field>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-3">
          <Field
            label="Specialization"
            value={form.specialization}
            onChange={setField('specialization')}
            required
          />
          <Field
            label="Experience (years)"
            type="number"
            min="0"
            value={form.experienceYears}
            onChange={setField('experienceYears')}
          />
          <Field
            label="Consultation fee (₹)"
            type="number"
            min="0"
            value={form.consultationFee}
            onChange={setField('consultationFee')}
            required
          />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-ink">Weekly availability</span>
            {isEditing && (
              <label className="flex items-center gap-2 text-xs text-ink-muted">
                <input
                  type="checkbox"
                  checked={form.isAvailableToday}
                  onChange={(e) => setForm((prev) => ({ ...prev, isAvailableToday: e.target.checked }))}
                />
                Available today (overrides the weekly schedule for just today)
              </label>
            )}
          </div>
          <p className="mb-2 text-xs text-ink-subtle">
            Tick the days this doctor sees patients — patients can only book on ticked days.
          </p>
          <div className="overflow-x-auto rounded border border-surface-border">
            <table className="w-full text-sm">
              <thead className="bg-surface text-left text-xs text-ink-muted">
                <tr>
                  <th className="px-3 py-2">Day</th>
                  <th className="px-3 py-2">Available</th>
                  <th className="px-3 py-2">Start</th>
                  <th className="px-3 py-2">End</th>
                </tr>
              </thead>
              <tbody>
                {WEEKDAYS.map(({ value, label }) => {
                  const dayForm = form.availability[value];
                  return (
                    <tr key={value} className="border-t border-surface-border">
                      <td className="px-3 py-2 text-ink">{label}</td>
                      <td className="px-3 py-2">
                        <input
                          type="checkbox"
                          checked={dayForm.enabled}
                          onChange={setDayField(value, 'enabled')}
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="time"
                          className="rounded-lg border border-surface-border px-2 py-1 text-sm transition-smooth focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100 disabled:bg-surface-muted disabled:text-ink-subtle"
                          value={dayForm.startTime}
                          onChange={setDayField(value, 'startTime')}
                          disabled={!dayForm.enabled}
                          required={dayForm.enabled}
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="time"
                          className="rounded-lg border border-surface-border px-2 py-1 text-sm transition-smooth focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100 disabled:bg-surface-muted disabled:text-ink-subtle"
                          value={dayForm.endTime}
                          onChange={setDayField(value, 'endTime')}
                          disabled={!dayForm.enabled}
                          required={dayForm.enabled}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {!isEditing && (
          <p className="text-xs text-ink-subtle">
            A temporary password is generated and emailed to the doctor.
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
            {isEditing ? 'Save changes' : 'Create doctor'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default DoctorFormModal;
