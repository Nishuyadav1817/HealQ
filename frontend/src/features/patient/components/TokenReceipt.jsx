import { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from './ui/PButton';
import { LogoMark } from '../../../components/common/Logo';
import { ROUTES } from '../../../constants/routePaths';

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })
    : null;

const formatDateTime = (value) =>
  value
    ? new Date(value).toLocaleString(undefined, {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

const formatTime = (value) =>
  value ? new Date(value).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) : null;

/**
 * One "label / value" line inside the receipt body. Renders nothing when
 * value is empty so the receipt never shows a blank or "—" row for data
 * the backend hasn't sent — same "only show what's real" discipline as
 * BookingSuccessPage had before this redesign.
 */
const ReceiptRow = ({ label, value, strong = false }) => {
  if (value === null || value === undefined || value === '') return null;
  return (
    <div className="flex items-start justify-between gap-4 py-2.5">
      <dt className="text-sm text-ink-muted">{label}</dt>
      <dd className={`text-right text-sm ${strong ? 'font-semibold text-ink' : 'font-medium text-ink'}`}>
        {value}
      </dd>
    </div>
  );
};

/** Dashed "ticket stub" perforation with punched-out notches at each
 * edge — the one visual cue borrowed from paper token slips, rendered
 * entirely in CSS so it holds up in print/PDF too. Notch color matches
 * the page background (not the receipt), so it reads as a true cutout. */
const Perforation = () => (
  <div className="relative">
    <div className="border-t border-dashed border-primary-100" />
    <span className="absolute -left-3 -top-3 h-6 w-6 rounded-full bg-surface print:hidden" />
    <span className="absolute -right-3 -top-3 h-6 w-6 rounded-full bg-surface print:hidden" />
  </div>
);

/**
 * The premium digital token receipt shown right after a successful
 * booking. Presentational only — BookingSuccessPage still owns all data
 * fetching, the "just booked" notification, and loading/error states.
 *
 * Every field below maps to data the app already has (appointment,
 * bookingResult.bookingNumber/queueNumber, bookingResult.queueStatus).
 * Fields the current booking response may not include yet — estimated
 * reporting time, live queue position — degrade gracefully via
 * ReceiptRow rather than showing fabricated numbers.
 */
const TokenReceipt = ({ appointment, bookingNumber, queueNumber, queueStatus, patientName }) => {
  const [shareState, setShareState] = useState('idle'); // idle | copied | unavailable

  const hospitalName = appointment?.hospital?.name;
  const hospitalAddress = appointment?.hospital?.address?.line1;
  const doctorName = appointment?.doctor?.user?.fullName;
  const departmentName = appointment?.department?.name;
  const appointmentId = appointment?._id;

  const receiptTitle = `UpcharGanga token receipt${queueNumber != null ? ` #${queueNumber}` : ''}`;
  const shareText = [
    'UpcharGanga — Appointment Confirmed',
    doctorName ? `Dr. ${doctorName}` : null,
    hospitalName,
    queueNumber != null ? `Token #${queueNumber}` : null,
    bookingNumber ? `Booking ref ${bookingNumber}` : null,
  ]
    .filter(Boolean)
    .join('\n');

  const handlePrint = () => window.print();

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: receiptTitle, text: shareText });
      } catch {
        // User cancelled the native share sheet — not an error worth surfacing.
      }
      return;
    }
    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(shareText);
        setShareState('copied');
        setTimeout(() => setShareState('idle'), 2000);
      } catch {
        setShareState('unavailable');
      }
    } else {
      setShareState('unavailable');
    }
  };

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="overflow-hidden rounded-2xl border border-primary-100 bg-white shadow-soft-lg print:border-ink/20 print:shadow-none">
        {/* Header */}
        <div className="bg-gradient-to-b from-primary-50 to-white px-6 pb-5 pt-6 text-center sm:px-8">
          <div className="flex items-center justify-center gap-2">
            <LogoMark size={28} />
            <span className="font-display text-base font-bold tracking-tight text-ink">
              Heal<span className="text-primary-600">Q</span>
            </span>
          </div>
          <p className="mt-0.5 text-[11px] font-medium uppercase tracking-wider text-ink-subtle">
            Digital Appointment Receipt
          </p>

          {/* Success indicator */}
          <div className="mt-5 flex flex-col items-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-600 text-white shadow-soft-md">
              <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
                <path
                  d="M5 13l4 4L19 7"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <p className="mt-2 font-display text-lg font-semibold text-ink">Appointment Confirmed</p>
            {hospitalName && (
              <p className="mt-0.5 text-xs text-ink-subtle">
                {doctorName ? `Dr. ${doctorName} · ` : ''}
                {hospitalName}
              </p>
            )}
          </div>

          {/* Token — the visual centerpiece */}
          <div className="mx-auto mt-5 w-fit rounded-xl border border-primary-100 bg-white px-10 py-4 shadow-soft-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-subtle">Token</p>
            <p className="font-display text-6xl font-extrabold leading-none text-primary-700 tabular-nums">
              {queueNumber != null ? `#${queueNumber}` : '—'}
            </p>
          </div>
        </div>

        <div className="px-6 sm:px-8">
          <Perforation />
        </div>

        {/* Structured info */}
        <div className="px-6 py-4 sm:px-8">
          <dl className="divide-y divide-primary-50">
            <ReceiptRow label="Hospital" value={hospitalName} strong />
            {hospitalAddress && (
              <div className="pb-2.5 pt-0 text-right text-xs text-ink-subtle">{hospitalAddress}</div>
            )}
            <ReceiptRow label="Doctor" value={doctorName ? `Dr. ${doctorName}` : null} />
            <ReceiptRow label="Department" value={departmentName} />
            <ReceiptRow label="Patient" value={patientName} />
            <ReceiptRow label="Appointment Date" value={formatDate(appointment?.appointmentDate)} />
            <ReceiptRow
              label="Appointment Time"
              value={
                appointment?.timeSlot?.start
                  ? `${appointment.timeSlot.start}–${appointment.timeSlot.end}`
                  : null
              }
            />
            <ReceiptRow
              label="Estimated Reporting Time"
              value={formatTime(queueStatus?.estimatedReportingTime)}
            />
            <ReceiptRow
              label="Estimated Waiting Time"
              value={
                queueStatus?.estimatedWaitingMinutes != null
                  ? `~${queueStatus.estimatedWaitingMinutes} min`
                  : null
              }
            />
            <ReceiptRow label="Current Queue Position" value={queueStatus?.queuePosition ?? null} />
          </dl>
        </div>

        <div className="px-6 sm:px-8">
          <Perforation />
        </div>

        {/* Reference footer */}
        <div className="px-6 py-4 sm:px-8">
          <dl className="divide-y divide-primary-50">
            <ReceiptRow label="Booking Reference" value={bookingNumber} />
            <ReceiptRow label="Appointment ID" value={appointmentId} />
            <ReceiptRow label="Booked On" value={formatDateTime(appointment?.createdAt)} />
          </dl>
        </div>
      </div>

      {/* Actions — print and share use real, already-available browser
          capabilities; nothing here calls a backend endpoint that
          doesn't exist. */}
      <div className="mt-5 grid grid-cols-2 gap-2.5 print:hidden">
        <Button variant="secondary" onClick={handlePrint}>
          <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
            <path
              d="M6 9V4h12v5M6 18H4a1 1 0 01-1-1v-6a1 1 0 011-1h16a1 1 0 011 1v6a1 1 0 01-1 1h-2M6 14h12v6H6v-6z"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Print
        </Button>
        <Button variant="secondary" onClick={handleShare}>
          <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
            <path
              d="M12 5v9m0-9l-3.5 3.5M12 5l3.5 3.5M6 13v5a1 1 0 001 1h10a1 1 0 001-1v-5"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {shareState === 'copied' ? 'Copied!' : 'Share'}
        </Button>
      </div>
      {shareState === 'unavailable' && (
        <p className="mt-2 text-center text-xs text-ink-subtle print:hidden">
          Sharing isn't supported on this browser.
        </p>
      )}

      <div className="mt-3 flex justify-center gap-3 print:hidden">
        {appointmentId && (
          <Link to={`${ROUTES.PATIENT.APPOINTMENT_TRACK}/${appointmentId}`}>
            <Button>Track this appointment</Button>
          </Link>
        )}
        <Link to={ROUTES.PATIENT.ROOT}>
          <Button variant="ghost">Back to dashboard</Button>
        </Link>
      </div>
    </div>
  );
};

export default TokenReceipt;
