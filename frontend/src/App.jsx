import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from './services/queryClient';
import { AuthProvider } from './context/AuthContext';
import AppRoutes from './routes/AppRoutes';

/**
 * Provider order matters here: QueryClientProvider wraps AuthProvider
 * because AuthContext will eventually use React Query for the /auth/me
 * and mutation calls; AuthProvider wraps BrowserRouter's consumer
 * (AppRoutes) because every route guard needs auth state. React Query
 * Devtools only mounts in development — Vite strips it entirely from a
 * production build via import.meta.env.DEV.
 */
const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
    {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
  </QueryClientProvider>
);

export default App;
