import symbolAsset from '../../assets/brand/upcharganga-symbol.png';
import fullLogoAsset from '../../assets/brand/upcharganga-logo-full.png';

/**
 * The UpcharGanga mark — ONE shared logo used everywhere (navbar, auth,
 * every dashboard, loading states, token receipts, footer, mobile nav,
 * favicon). Sourced from the official brand asset (a face-inspired
 * healthcare symbol in teal/blue with a gold "+"), not redrawn.
 *
 * `LogoMark` is the symbol-only crop — square, reproducible at small
 * sizes (sidebars, collapsed nav, favicon). It carries no wordmark, so
 * call sites that need the brand name pair it with their own text.
 */
const LogoMark = ({ size = 36, className = '' }) => (
  <img
    src={symbolAsset}
    alt="UpcharGanga"
    width={size}
    height={size}
    style={{ height: size, width: size, objectFit: 'contain' }}
    className={className}
  />
);

/**
 * Full lockup: the complete brand asset, symbol + "UpcharGanga" wordmark
 * baked into a single image. Used in navs, auth screens, footers. Never
 * pair this with typed "UpcharGanga" text alongside it — the wordmark is
 * already part of the image.
 */
const Logo = ({ size = 34, showWordmark = true, className = '' }) => (
  <span className={`inline-flex items-center ${className}`}>
    {showWordmark ? (
      <img
        src={fullLogoAsset}
        alt="UpcharGanga"
        style={{ height: size, width: 'auto', objectFit: 'contain' }}
      />
    ) : (
      <LogoMark size={size} />
    )}
  </span>
);

export { LogoMark };
export default Logo;
