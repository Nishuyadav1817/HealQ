import AdminShell from '../features/admin/components/AdminShell';
import { ROUTES } from '../constants/routePaths';
import {
  GridIcon,
  TrendIcon,
  DocIcon,
  CalendarIcon,
  HospitalIcon,
  DepartmentIcon,
  DoctorIcon,
  StaffIcon,
  PatientsIcon,
  CityIcon,
} from '../features/admin/components/icons/AdminIcons';

const ROOT = ROUTES.ADMIN.ROOT;

/**
 * Same 10 admin routes as before, grouped for the sidebar and paired
 * with an icon. No route is added, removed, or renamed here — this is
 * purely how AdminShell presents the existing navigation.
 */
const NAV_GROUPS = [
  {
    label: 'Overview',
    items: [
      { label: 'Overview', path: ROOT, end: true, icon: GridIcon },
      { label: 'Analytics', path: `${ROOT}/analytics`, icon: TrendIcon },
      { label: 'Reports', path: `${ROOT}/reports`, icon: DocIcon },
    ],
  },
  {
    label: 'Operations',
    items: [{ label: 'Appointments', path: `${ROOT}/appointments`, icon: CalendarIcon }],
  },
  {
    label: 'Directory',
    items: [
      { label: 'Hospitals', path: `${ROOT}/hospitals`, icon: HospitalIcon },
      { label: 'Departments', path: `${ROOT}/departments`, icon: DepartmentIcon },
      { label: 'Doctors', path: `${ROOT}/doctors`, icon: DoctorIcon },
      { label: 'Staff', path: `${ROOT}/staff`, icon: StaffIcon },
      { label: 'Patients', path: `${ROOT}/patients`, icon: PatientsIcon },
      { label: 'Cities', path: `${ROOT}/cities`, icon: CityIcon },
    ],
  },
];

/** Root layout for the Admin panel — wraps every /admin/* route. */
const AdminLayout = () => <AdminShell groups={NAV_GROUPS} />;

export default AdminLayout;
