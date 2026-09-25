import Card from './ui/PCard';

const HOSPITAL_TYPE_LABELS = {
  government: 'Government',
  private: 'Private',
  clinic: 'Clinic',
};

const HospitalCard = ({ hospital, onSelect }) => (
  <Card onClick={() => onSelect(hospital)}>
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="font-serif text-base font-semibold text-ink">{hospital.name}</p>
        <p className="mt-0.5 text-sm text-ink-muted">
          {hospital.address?.line1}
          {hospital.address?.pincode ? `, ${hospital.address.pincode}` : ''}
        </p>
      </div>
      <span className="shrink-0 rounded-full bg-healq-100 px-2.5 py-1 text-xs font-medium text-healq-700">
        {HOSPITAL_TYPE_LABELS[hospital.type] || hospital.type}
      </span>
    </div>
    <div className="mt-3 flex items-center gap-4 text-xs text-ink-subtle">
      {hospital.contact?.phone && <span>{hospital.contact.phone}</span>}
      {hospital.averageRating > 0 && (
        <span>★ {hospital.averageRating.toFixed(1)} ({hospital.ratingCount})</span>
      )}
    </div>
  </Card>
);

export default HospitalCard;
