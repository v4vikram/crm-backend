import nodemailer from "nodemailer";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: Number(env.SMTP_PORT),
  secure: false,
  requireTLS: true,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000,

  // Force IPv4
  family: 4,
});
await transporter.verify();
logger.info("SMTP connected");

const sendMail = async (to: string, subject: string, html: string): Promise<void> => {
  await transporter.sendMail({ from: env.SMTP_FROM, to, subject, html });
  logger.info({ to, subject }, "Email sent");
};

export const sendPasswordResetEmail = async (to: string, resetUrl: string): Promise<void> => {
  await sendMail(
    to,
    "Reset your password",
    `<p>You requested a password reset.</p>
     <p><a href="${resetUrl}">Click here to reset your password</a></p>
     <p>This link expires in 15 minutes. If you didn't request this, you can ignore this email.</p>`,
  );
};
