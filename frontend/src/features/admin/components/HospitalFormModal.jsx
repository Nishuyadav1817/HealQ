import { useEffect, useState } from 'react';
import Modal from '../../../components/ui/Modal';
import Field from '../../../components/ui/Field';
import Button from '../../../components/ui/Button';
import { useCitiesLookup } from '../hooks/useLookups';
import { useCreateHospital, useUpdateHospital } from '../hooks/useAdminHospitals';
import { getApiErrorMessage } from '../../../utils/apiError';

const HOSPITAL_TYPES = ['government', 'private', 'clinic'];

const emptyForm = {
  name: '',
  registrationNumber: '',
  type: 'private',
  city: '',
  addressLine1: '',
  addressLine2: '',
  pincode: '',
  phone: '',
  email: '',
  website: '',
  totalBeds: '',
};

/** Flattens a Hospital document (nested address/contact) into the form's
 * flat field shape, or returns the blank form for "create" mode. */
const toFormState = (hospital) => {
  if (!hospital) return emptyForm;
  return {
    name: hospital.name ?? '',
    registrationNumber: hospital.registrationNumber ?? '',
    type: hospital.type ?? 'private',
    city: hospital.city?._id ?? hospital.city ?? '',
    addressLine1: hospital.address?.line1 ?? '',
    addressLine2: hospital.address?.line2 ?? '',
    pincode: hospital.address?.pincode ?? '',
    phone: hospital.contact?.phone ?? '',
    email: hospital.contact?.email ?? '',
    website: hospital.contact?.website ?? '',
    totalBeds: hospital.totalBeds ?? '',
  };
};

/** Re-nests the flat form back into the shape createHospitalSchema /
 * updateHospitalSchema expect on the backend. */
const toPayload = (form) => ({
  name: form.name.trim(),
  registrationNumber: form.registrationNumber.trim(),
  type: form.type,
  city: form.city,
  address: {
    line1: form.addressLine1.trim(),
    line2: form.addressLine2.trim() || undefined,
    pincode: form.pincode.trim() || undefined,
  },
  contact: {
    phone: form.phone.trim(),
    email: form.email.trim() || undefined,
    website: form.website.trim() || undefined,
  },
  totalBeds: form.totalBeds ? Number(form.totalBeds) : undefined,
});

const HospitalFormModal = ({ isOpen, onClose, hospital = null }) => {
  const [form, setForm] = useState(emptyForm);
  const { data: cities } = useCitiesLookup();
  const createMutation = useCreateHospital();
  const updateMutation = useUpdateHospital();
  const isEditing = !!hospital;
  const mutation = isEditing ? updateMutation : createMutation;

  useEffect(() => {
    if (isOpen) setForm(toFormState(hospital));
  }, [isOpen, hospital]);

  const setField = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = toPayload(form);
    if (isEditing) {
      await updateMutation.mutateAsync({ id: hospital._id, payload });
    } else {
      await createMutation.mutateAsync(payload);
    }
    onClose();
  };

  return (
    <Modal
      title={isEditing ? 'Edit Hospital' : 'Create Hospital'}
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Hospital name" value={form.name} onChange={setField('name')} required />
          <Field
            label="Registration number"
            value={form.registrationNumber}
            onChange={setField('registrationNumber')}
            required
          />
          <Field label="Type" as="select" value={form.type} onChange={setField('type')}>
            {HOSPITAL_TYPES.map((t) => (
              <option key={t} value={t}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </option>
            ))}
          </Field>
          <Field label="City" as="select" value={form.city} onChange={setField('city')} required>
            <option value="">Select a city</option>
            {cities?.map((city) => (
              <option key={city._id} value={city._id}>
                {city.name}, {city.state}
              </option>
            ))}
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Address line 1"
            value={form.addressLine1}
            onChange={setField('addressLine1')}
            required
          />
          <Field label="Address line 2" value={form.addressLine2} onChange={setField('addressLine2')} />
          <Field label="Pincode" value={form.pincode} onChange={setField('pincode')} />
          <Field label="Total beds" type="number" min="0" value={form.totalBeds} onChange={setField('totalBeds')} />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Phone" value={form.phone} onChange={setField('phone')} required />
          <Field label="Email" type="email" value={form.email} onChange={setField('email')} />
          <Field label="Website" value={form.website} onChange={setField('website')} />
        </div>

        {mutation.isError && (
          <p className="text-xs font-medium text-danger">
            {getApiErrorMessage(mutation.error)}
          </p>
        )}

        <div className="flex justify-end gap-2 border-t border-surface-border pt-4">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={mutation.isPending}>
            {isEditing ? 'Save changes' : 'Create hospital'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default HospitalFormModal;
