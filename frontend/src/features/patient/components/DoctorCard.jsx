import Button from './ui/PButton';
import Card from './ui/PCard';
import PAvatar from './ui/PAvatar';

const DoctorCard = ({ doctor, onBook }) => (
  <Card className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
    <div className="flex items-start gap-3">
      <PAvatar name={doctor.user?.fullName} size="lg" />
      <div>
        <p className="font-display text-base font-semibold text-ink">Dr. {doctor.user?.fullName}</p>
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
    </div>
    <Button onClick={() => onBook(doctor)} className="sm:shrink-0">
      Book Appointment
    </Button>
  </Card>
);

export default DoctorCard;
