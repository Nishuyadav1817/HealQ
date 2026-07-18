/**
 * Standard success-response shape so the frontend can always rely on
 * { success, statusCode, message, data } regardless of endpoint.
 */
class ApiResponse {
  constructor(statusCode, data, message = 'Success') {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400;
  }
}

module.exports = ApiResponse;
