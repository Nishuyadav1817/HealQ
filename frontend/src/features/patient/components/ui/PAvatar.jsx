/**
 * UpcharGanga's patient-facing avatar — initials on a soft brand-tinted
 * circle. No photo upload exists on the backend, so this is always an
 * initials mark (never a broken <img>), matching the same "honest about
 * what the screen can actually do" approach as ProfilePage. Same shape
 * as Reception's RAvatar and Doctor Assistant's DAvatar, styled in the
 * `role-patient` accent so all three read as one identity system.
 */
const getInitials = (name = '') =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || 'P';

const SIZES = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
};

const PAvatar = ({ name, size = 'md', className = '' }) => (
  <span
    className={`inline-flex shrink-0 items-center justify-center rounded-full bg-role-patient/10 font-display font-bold text-role-patient ${SIZES[size]} ${className}`}
    aria-hidden="true"
  >
    {getInitials(name)}
  </span>
);

export default PAvatar;
