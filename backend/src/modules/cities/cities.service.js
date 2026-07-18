const City = require('./cities.model');
const ApiError = require('../../errors/ApiError');
const ApiFeatures = require('../../utils/apiFeatures.util');

const createCity = async (payload) => {
  const existing = await City.findOne({ name: payload.name, state: payload.state });
  if (existing) {
    throw new ApiError(409, `${payload.name}, ${payload.state} already exists.`);
  }
  return City.create(payload);
};

/**
 * isAdmin controls whether inactive (soft-deleted) cities are visible —
 * public browse endpoints must never leak them, but the admin dashboard
 * needs to see them in order to reactivate a city later.
 */
const getCities = async (queryString, isAdmin = false) => {
  const query = { ...queryString };
  if (!isAdmin) query.isActive = 'true';

  const features = new ApiFeatures(City.find(), query)
    .filter(['isActive', 'state', 'country'])
    .search(['name', 'state'])
    .sort()
    .paginate();

  const [cities, total] = await Promise.all([
    features.query,
    City.countDocuments(features.filterQuery),
  ]);

  return { cities, total, pagination: features.pagination };
};

const getCityById = async (id, isAdmin = false) => {
  const filter = { _id: id };
  if (!isAdmin) filter.isActive = true;

  const city = await City.findOne(filter);
  if (!city) {
    throw new ApiError(404, 'City not found.');
  }
  return city;
};

const updateCity = async (id, payload) => {
  const city = await City.findById(id);
  if (!city) {
    throw new ApiError(404, 'City not found.');
  }

  if (payload.name || payload.state) {
    const name = payload.name || city.name;
    const state = payload.state || city.state;
    const duplicate = await City.findOne({ name, state, _id: { $ne: id } });
    if (duplicate) {
      throw new ApiError(409, `${name}, ${state} already exists.`);
    }
  }

  Object.assign(city, payload);
  await city.save();
  return city;
};

/**
 * Soft delete only — City is a lightweight lookup entity with no
 * dependents to cascade, but is still never hard-deleted so historical
 * references (e.g. Hospital.address.city) never dangle.
 */
const softDeleteCity = async (id) => {
  const city = await City.findById(id);
  if (!city) {
    throw new ApiError(404, 'City not found.');
  }
  city.isActive = false;
  await city.save();
  return city;
};

module.exports = { createCity, getCities, getCityById, updateCity, softDeleteCity };
