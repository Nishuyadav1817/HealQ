import { useEffect, useState } from 'react';
import Modal from '../../../components/ui/Modal';
import Field from '../../../components/ui/Field';
import Button from '../../../components/ui/Button';
import { useAdminHospitals } from '../hooks/useAdminHospitals';
import { useCreateDepartment, useUpdateDepartment } from '../hooks/useAdminDepartments';
import { getApiErrorMessage } from '../../../utils/apiError';

const emptyForm = {
  hospital: '',
  name: '',
  description: '',
  defaultSlotDurationMinutes: 15,
};

const toFormState = (department, presetHospitalId) => {
  if (!department) return { ...emptyForm, hospital: presetHospitalId || '' };
  return {
    hospital: department.hospital?._id ?? department.hospital ?? '',
    name: department.name ?? '',
    description: department.description ?? '',
    defaultSlotDurationMinutes: department.defaultSlotDurationMinutes ?? 15,
  };
};

/**
 * Create/edit form for a Department. A department always belongs to
 * exactly one hospital (backend deliberately doesn't allow moving a
 * department to a different hospital after creation — see
 * departments.validation.js), so the Hospital field is only editable
 * while creating, then shown read-only afterward, same pattern as
 * DoctorFormModal.
 *
 * `presetHospitalId` lets AdminDepartmentsPage pre-select whichever
 * hospital is currently filtered on the page when opening "+ Add
 * Department", so the admin doesn't have to pick it twice.
 */
const DepartmentFormModal = ({ isOpen, onClose, department = null, presetHospitalId = '' }) => {
  const [form, setForm] = useState(emptyForm);
  const isEditing = !!department;

  const { data: hospitalsData } = useAdminHospitals({ limit: 100, isActive: 'true' });
  const createMutation = useCreateDepartment();
  const updateMutation = useUpdateDepartment();
  const mutation = isEditing ? updateMutation : createMutation;

  useEffect(() => {
    if (isOpen) setForm(toFormState(department, presetHospitalId));
  }, [isOpen, department, presetHospitalId]);

  const setField = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isEditing) {
      await updateMutation.mutateAsync({
        id: department._id,
        payload: {
          name: form.name.trim(),
          description: form.description.trim() || undefined,
          defaultSlotDurationMinutes: Number(form.defaultSlotDurationMinutes),
        },
      });
    } else {
      await createMutation.mutateAsync({
        hospital: form.hospital,
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        defaultSlotDurationMinutes: Number(form.defaultSlotDurationMinutes),
      });
    }
    onClose();
  };

  return (
    <Modal title={isEditing ? 'Edit Department' : 'Add Department'} isOpen={isOpen} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {isEditing ? (
          <Field
            label="Hospital"
            value={department.hospital?.name || '—'}
            disabled
            readOnly
          />
        ) : (
          <Field label="Hospital" as="select" value={form.hospital} onChange={setField('hospital')} required>
            <option value="">Select a hospital</option>
            {hospitalsData?.hospitals?.map((h) => (
              <option key={h._id} value={h._id}>
                {h.name}
              </option>
            ))}
          </Field>
        )}

        <Field
          label="Department name"
          placeholder="e.g. Cardiology"
          value={form.name}
          onChange={setField('name')}
          required
        />

        <Field
          label="Description (optional)"
          as="textarea"
          value={form.description}
          onChange={setField('description')}
        />

        <Field
          label="Default consultation length (minutes)"
          type="number"
          min="5"
          value={form.defaultSlotDurationMinutes}
          onChange={setField('defaultSlotDurationMinutes')}
          required
        />

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
            {isEditing ? 'Save changes' : 'Add department'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default DepartmentFormModal;
