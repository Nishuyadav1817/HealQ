/**
 * Replacement for `express-mongo-sanitize`.
 *
 * express-mongo-sanitize@2 works by doing `req.query = sanitize(req.query)`,
 * `req.body = sanitize(req.body)`, etc. That's fine for `body`/`params`
 * (still plain writable properties on the request), but Express 5 turned
 * `req.query` into a getter-only accessor derived from the parsed URL —
 * assigning to it throws:
 *
 *   TypeError: Cannot set property query of #<IncomingMessage> which has
 *   only a getter
 *
 * The fix is to sanitize `req.query` (and any nested object) IN PLACE —
 * deleting/rewriting keys on the existing object — instead of replacing
 * the reference. `body` and `params` remain safe to reassign, but we
 * sanitize them in place too for consistency.
 */

const isPlainObject = (val) => val !== null && typeof val === 'object' && !Array.isArray(val);

/**
 * Recursively strips any key that starts with '$' or contains '.',
 * mutating the object/array it's given rather than returning a new one.
 */
const sanitizeInPlace = (target) => {
  if (Array.isArray(target)) {
    target.forEach((item) => sanitizeInPlace(item));
    return target;
  }

  if (!isPlainObject(target)) {
    return target;
  }

  Object.keys(target).forEach((key) => {
    if (key.startsWith('$') || key.includes('.')) {
      delete target[key];
      return;
    }

    const value = target[key];
    if (isPlainObject(value) || Array.isArray(value)) {
      sanitizeInPlace(value);
    }
  });

  return target;
};

const sanitize = (req, res, next) => {
  if (req.body) sanitizeInPlace(req.body);
  if (req.params) sanitizeInPlace(req.params);
  if (req.query) sanitizeInPlace(req.query); // mutated, never reassigned

  next();
};

module.exports = sanitize;
