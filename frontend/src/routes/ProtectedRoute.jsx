import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from '../constants/routePaths';
import FullScreenLoader from '../components/common/FullScreenLoader';

/**
 * Gate for every authenticated route tree. Usage:
 *   <Route element={<ProtectedRoute allowedRoles={[USER_ROLES.ADMIN]} />}>
 *     <Route element={<AdminLayout />}>...</Route>
 *   </Route>
 *
 * Three states, checked in order:
 *  1. Still bootstrapping (AuthContext hasn't finished its silent
 *     refresh attempt yet) -> show a loader, render nothing else.
 *  2. Not authenticated -> redirect to /login.
 *  3. Authenticated but wrong role -> redirect to /unauthorized (NOT the
 *     login page — the person IS logged in, just not allowed here).
 */
const ProtectedRoute = ({ allowedRoles }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <FullScreenLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={ROUTES.UNAUTHORIZED} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
