import { Link } from 'react-router-dom';
import { ROUTES } from '../../../constants/routePaths';
import HealQMark from '../../patient/components/ui/HealQMark';

/** The one visual shell both auth pages share — HealQ mark/wordmark,
 * centered card, and a footer link that switches between the two. */
const AuthLayout = ({ title, subtitle, footerText, footerLinkText, footerLinkTo, children }) => (
  <div className="flex min-h-screen items-center justify-center bg-healq-50/50 px-4 py-12">
    <div className="w-full max-w-md">
      <div className="mb-8 text-center">
        <Link to={ROUTES.HOME} className="inline-flex items-center gap-2.5">
          <HealQMark size={40} />
          <span className="font-serif text-2xl font-semibold tracking-tight text-ink">HealQ</span>
        </Link>
      </div>

      <div className="rounded-2xl border border-healq-100 bg-white p-6 shadow-lg shadow-healq-900/5 sm:p-8">
        <h1 className="font-serif text-2xl font-semibold text-ink">{title}</h1>
        {subtitle && <p className="mt-1.5 text-sm text-ink-muted">{subtitle}</p>}
        <div className="mt-6">{children}</div>
      </div>

      <p className="mt-5 text-center text-sm text-ink-muted">
        {footerText}{' '}
        <Link to={footerLinkTo} className="font-medium text-healq-600 hover:text-healq-700">
          {footerLinkText}
        </Link>
      </p>
    </div>
  </div>
);

export default AuthLayout;
