import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

let transporter;

const ensureTransporter = () => {
  if (transporter) return transporter;
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Boolean(process.env.SMTP_SECURE === 'true'),
    auth: process.env.SMTP_USER
      ? {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        }
      : undefined,
  });
  return transporter;
};

export const sendReminderEmail = async ({ to, subject, text, html }) => {
  if (!process.env.SMTP_HOST || !process.env.SMTP_FROM) {
    console.warn('SMTP not configured; skipping email send');
    return;
  }
  const mailer = ensureTransporter();
  await mailer.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject,
    text,
    html,
  });
};

export const sendOtpEmail = async ({ to, code, subject }) => {
  if (!process.env.SMTP_HOST || !process.env.SMTP_FROM) {
    console.warn('SMTP not configured; skipping OTP email');
    return;
  }
  const emailSubject = subject || 'Your verification code';
  const text = `Your JobTracker verification code is ${code}. It expires in 10 minutes.`;
  const html = `<p>Your JobTracker verification code is <strong>${code}</strong>.</p><p>It expires in 10 minutes.</p>`;
  const mailer = ensureTransporter();
  await mailer.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject: emailSubject,
    text,
    html,
  });
};
