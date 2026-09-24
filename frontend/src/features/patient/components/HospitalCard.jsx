import Card from './ui/PCard';

const HOSPITAL_TYPE_LABELS = {
  government: 'Government',
  private: 'Private',
  clinic: 'Clinic',
};

const HospitalCard = ({ hospital, onSelect }) => (
  <Card onClick={() => onSelect(hospital)}>
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
          <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
            <path
              d="M6 21V9l6-4 6 4v12M10 21v-6h4v6M9 12h.01M15 12h.01"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <div>
          <p className="font-display text-base font-semibold text-ink">{hospital.name}</p>
          <p className="mt-0.5 text-sm text-ink-muted">
            {hospital.address?.line1}
            {hospital.address?.pincode ? `, ${hospital.address.pincode}` : ''}
          </p>
        </div>
      </div>
      <span className="shrink-0 rounded-full bg-primary-100 px-2.5 py-1 text-xs font-medium text-primary-700">
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
