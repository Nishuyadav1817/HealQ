/**
 * A visually obvious "this number can change under you" signal — used
 * anywhere a live socket value (queue position, ETA, status) is shown.
 * Purely presentational: it reflects whatever connection state is
 * passed in, it never opens its own socket. Same dot + label pattern as
 * Reception's and Doctor Assistant's LiveIndicator, so the "live" signal
 * looks and behaves identically in every panel — only the copy differs
 * slightly here since it sits on a colored hero band rather than a
 * plain header.
 */
const PLiveIndicator = ({ isConnected = true }) => (
  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-white/90">
    <span className={`h-2 w-2 rounded-full ${isConnected ? 'animate-pulse bg-gold-400' : 'bg-white/50'}`} />
    {isConnected ? 'Live' : 'Reconnecting…'}
  </span>
);

export default PLiveIndicator;
