/**
 * UpcharGanga's patient-facing Button. Re-exports the shared components/ui/Button
 * so the whole app — Patient, Auth, Admin, Reception, and Doctor Assistant
 * alike — renders buttons from one single implementation instead of a
 * forked copy that could silently drift out of sync.
 */
export { default } from '../../../../components/ui/Button';
