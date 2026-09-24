/**
 * Reception's initials avatar — same idea as the Patient panel's
 * PAvatar (no photo upload exists on the backend, so this is always an
 * initials mark), styled in the reception gold accent instead of
 * primary green so it reads as this panel's own identity.
 */
const getInitials = (name = '') =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || 'R';

const SIZES = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
};

const RAvatar = ({ name, size = 'md', className = '' }) => (
  <span
    className={`inline-flex shrink-0 items-center justify-center rounded-full bg-role-reception/10 font-display font-bold text-role-reception ${SIZES[size]} ${className}`}
    aria-hidden="true"
  >
    {getInitials(name)}
  </span>
);

export default RAvatar;
