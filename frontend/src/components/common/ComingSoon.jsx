/**
 * TEMPORARY scaffold marker — not a real page. Lets every route in the
 * architecture render to something and be navigated to/verified visually
 * before the actual feature pages are built. Delete usages of this as
 * each real page is implemented.
 */
const ComingSoon = ({ title }) => (
  <div className="flex h-full min-h-[60vh] flex-col items-center justify-center gap-3 text-center">
    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-50 text-primary-600">
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
        <path d="M12 8v4l2.5 2.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
    <p className="text-xs font-semibold uppercase tracking-wide text-ink-subtle">Coming soon</p>
    <h2 className="font-display text-xl font-bold text-ink">{title}</h2>
    <p className="max-w-sm text-sm text-ink-muted">
      This screen hasn&apos;t been built yet — you&apos;re seeing the layout shell only.
    </p>
  </div>
);

export default ComingSoon;
