const nodemailer = require('nodemailer');
const config = require('../config/env');

/**
 * Thin wrapper around Nodemailer. If SMTP isn't configured (e.g. local
 * development), we log the email instead of throwing — this keeps the
 * forgot-password flow fully testable without a real mail provider.
 * In production, config.env === 'production' should always have SMTP set
 * (enforced by env.js's REQUIRED_IN_PRODUCTION check for the core secrets;
 * SMTP itself is treated as optional-but-expected here).
 */
const createTransporter = () => {
  if (!config.smtp.host) return null;

  return nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.port === 465,
    auth: config.smtp.user ? { user: config.smtp.user, pass: config.smtp.pass } : undefined,
  });
};

const sendEmail = async ({ to, subject, html }) => {
  const transporter = createTransporter();

  if (!transporter) {
    console.log(`[email:dev-fallback] To: ${to}\nSubject: ${subject}\n${html}\n`);
    return;
  }

  await transporter.sendMail({
    from: config.smtp.fromEmail,
    to,
    subject,
    html,
  });
};

module.exports = sendEmail;
