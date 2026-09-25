/**
 * TEMPORARY scaffold marker — not a real page. Lets every route in the
 * architecture render to something and be navigated to/verified visually
 * before the actual feature pages are built. Delete usages of this as
 * each real page is implemented.
 */
const ComingSoon = ({ title }) => (
  <div className="flex h-full min-h-[60vh] flex-col items-center justify-center gap-2 text-center">
    <p className="text-sm font-medium uppercase tracking-wide text-ink-subtle">Coming soon</p>
    <h2 className="text-xl font-semibold text-ink">{title}</h2>
    <p className="max-w-sm text-sm text-ink-muted">
      This screen hasn&apos;t been built yet — you&apos;re seeing the layout shell only.
    </p>
  </div>
);

export default ComingSoon;
