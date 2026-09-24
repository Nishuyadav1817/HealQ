import React from "react";
/** Reflects this dashboard's socket connection state (see
 * useQueueLiveUpdates) — green pulse when live updates are actually
 * flowing, grey when the socket isn't connected so staff know to trust
 * the 15s polling fallback instead. */
const LiveIndicator = ({ isConnected }) => (
  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-muted">
    <span className={`h-2 w-2 rounded-full ${isConnected ? 'animate-pulse bg-success' : 'bg-ink-subtle'}`} />
    {isConnected ? 'Live' : 'Refreshing periodically'}
  </span>
);

export default LiveIndicator;
