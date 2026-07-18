import Button from './ui/PButton';
import Card from './ui/PCard';

const DoctorCard = ({ doctor, onBook }) => (
  <Card className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
    <div>
      <p className="font-serif text-base font-semibold text-ink">Dr. {doctor.user?.fullName}</p>
      <p className="text-sm text-ink-muted">{doctor.specialization}</p>
      <div className="mt-1.5 flex flex-wrap gap-2 text-xs text-ink-subtle">
        <span>{doctor.experienceYears} yrs experience</span>
        <span>·</span>
        <span>₹{doctor.consultationFee} consultation fee</span>
        {!doctor.isAvailableToday && (
          <>
            <span>·</span>
            <span className="font-medium text-danger">Unavailable today</span>
          </>
        )}
      </div>
    </div>
    <Button onClick={() => onBook(doctor)} className="sm:shrink-0">
      Book Appointment
    </Button>
  </Card>
);

export default DoctorCard;
