const mongoose = require('mongoose');
const { Schema } = mongoose;
const {
  NOTIFICATION_TYPE,
  NOTIFICATION_CHANNEL,
  DELIVERY_STATUS,
} = require('../../constants/enums');

/**
 * Notification Schema
 * One document per notification sent to a user (in-app, SMS, email, or
 * push). Persisted (not just fired-and-forgotten via Socket.IO) so the
 * patient/staff has a notification history/inbox, and so delivery status
 * can be tracked and retried.
 */
const notificationSchema = new Schema(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Recipient is required'],
      index: true,
    },

    type: {
      type: String,
      enum: Object.values(NOTIFICATION_TYPE),
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    channel: {
      type: String,
      enum: Object.values(NOTIFICATION_CHANNEL),
      default: NOTIFICATION_CHANNEL.IN_APP,
    },

    // Optional link back to the appointment this notification concerns —
    // lets the frontend deep-link "View Appointment" from the notification.
    relatedAppointment: {
      type: Schema.Types.ObjectId,
      ref: 'Appointment',
      default: null,
    },

    isRead: {
      type: Boolean,
      default: false,
    },

    readAt: {
      type: Date,
      default: null,
    },

    deliveryStatus: {
      type: String,
      enum: Object.values(DELIVERY_STATUS),
      default: DELIVERY_STATUS.PENDING,
    },

    sentAt: {
      type: Date,
      default: null,
    },

    // Error detail if delivery failed (e.g. SMS gateway error) — useful for
    // debugging/retry jobs without storing full gateway payloads.
    failureReason: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

// Notification inbox: "unread notifications for this user, most recent first".
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

// TTL index: auto-delete notifications 90 days after creation to keep the
// collection lean (adjust expireAfterSeconds to your retention policy).
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 90 });

module.exports = mongoose.model('Notification', notificationSchema);
