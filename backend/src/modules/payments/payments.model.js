const mongoose = require('mongoose');
const { Schema } = mongoose;
const { PAYMENT_METHOD, PAYMENT_STATUS, PAYMENT_GATEWAY } = require('../../constants/enums');

/**
 * Payment Schema
 * One document per payment attempt tied to an Appointment. Kept as its own
 * collection (not embedded in Appointment) because:
 *  - Payments have their own lifecycle/audit trail (retries, refunds) that
 *    shouldn't bloat the Appointment document.
 *  - Financial records often need independent indexing/reporting
 *    (e.g. daily revenue reports) separate from appointment queries.
 */
const paymentSchema = new Schema(
  {
    appointment: {
      type: Schema.Types.ObjectId,
      ref: 'Appointment',
      required: [true, 'Payment must be linked to an appointment'],
      index: true,
    },

    patient: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: 0,
    },

    currency: {
      type: String,
      default: 'INR',
    },

    method: {
      type: String,
      enum: Object.values(PAYMENT_METHOD),
      required: true,
    },

    gateway: {
      type: String,
      enum: Object.values(PAYMENT_GATEWAY),
      required: true,
    },

    status: {
      type: String,
      enum: Object.values(PAYMENT_STATUS),
      default: PAYMENT_STATUS.PENDING,
      index: true,
    },

    // Unique ID from the payment gateway (Razorpay/Stripe order/payment id).
    // `sparse: true` because cash payments won't have one.
    transactionId: {
      type: String,
      unique: true,
      sparse: true,
    },

    // Raw gateway response stored for audit/dispute resolution. Mixed type
    // since gateway payloads vary; not queried directly, so no need to
    // model its shape strictly.
    gatewayResponse: {
      type: Schema.Types.Mixed,
      default: null,
    },

    paidAt: {
      type: Date,
      default: null,
    },

    refund: {
      amount: { type: Number, default: 0 },
      reason: { type: String, trim: true, default: null },
      refundTransactionId: { type: String, default: null },
      refundedAt: { type: Date, default: null },
    },

    // For cash payments collected at the counter — which receptionist
    // recorded/received the payment (accountability trail).
    receivedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
);

// Revenue reporting: "all successful payments for this hospital in date range"
// (hospital reached via populate on appointment, or denormalize hospital
// here later if reporting performance demands it).
paymentSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Payment', paymentSchema);
