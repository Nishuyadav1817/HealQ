/**
 * Reusable query-building helper for list endpoints (filter + search +
 * sort + pagination). Used by Cities, Hospitals, Departments, and Doctors
 * list services so that pagination/filtering logic isn't duplicated four
 * times. Keeps `filterQuery` around separately so the caller can run an
 * accurate `countDocuments()` alongside the paginated `find()`.
 */
class ApiFeatures {
  constructor(query, queryString = {}) {
    this.query = query; // a Mongoose Query (e.g. Model.find())
    this.queryString = queryString; // typically req.query
    this.filterQuery = {}; // accumulated plain filter object, for counting
  }

  /** Applies exact-match filters for each field present in the querystring. */
  filter(allowedFields = []) {
    const conditions = {};
    allowedFields.forEach((field) => {
      if (this.queryString[field] !== undefined && this.queryString[field] !== '') {
        conditions[field] = this.queryString[field];
      }
    });
    this.filterQuery = { ...this.filterQuery, ...conditions };
    this.query = this.query.find(conditions);
    return this;
  }

  /** Case-insensitive partial match across the given fields via ?search=. */
  search(fields = []) {
    if (this.queryString.search && fields.length) {
      const regex = new RegExp(this.queryString.search.trim(), 'i');
      const orConditions = fields.map((field) => ({ [field]: regex }));
      this.filterQuery = { ...this.filterQuery, $or: orConditions };
      this.query = this.query.find({ $or: orConditions });
    }
    return this;
  }

  /** ?sort=name,-createdAt  (comma-separated, '-' prefix = descending) */
  sort() {
    if (this.queryString.sort) {
      this.query = this.query.sort(this.queryString.sort.split(',').join(' '));
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  /** ?page=1&limit=20 — limit is capped at 100 to prevent abuse. */
  paginate() {
    const page = Math.max(parseInt(this.queryString.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(this.queryString.limit, 10) || 20, 1), 100);
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    this.pagination = { page, limit };
    return this;
  }
}

module.exports = ApiFeatures;
