const mongoose = require('mongoose');

/**
 * Runs `fn(session)` inside a MongoDB session transaction — commits on
 * success, aborts on any thrown error. Used anywhere a single admin action
 * must touch more than one collection atomically (e.g. creating a Doctor
 * creates both a User AND a Doctor document; soft-deleting a Hospital
 * cascades to its Departments and Doctors).
 *
 * Requires MongoDB to run as a replica set (a single-node local replica
 * set is enough for development; MongoDB Atlas supports this by default).
 * A standalone `mongod` does NOT support transactions.
 */
const withTransaction = async (fn) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const result = await fn(session);
    await session.commitTransaction();
    return result;
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};

module.exports = withTransaction;
