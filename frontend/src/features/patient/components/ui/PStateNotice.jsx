/**
 * UpcharGanga's patient-facing empty/error/loading/success states. Re-exports
 * the shared components/ui/StateNotice (which now carries the icon
 * treatment, SuccessNotice, and CardSkeleton every panel uses) so this
 * pattern only exists once in the codebase.
 */
export { EmptyState, ErrorNotice, SuccessNotice, Spinner, CardSkeleton, StateIcon } from '../../../../components/ui/StateNotice';
