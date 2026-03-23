const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

const createTransport = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT, 10) || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const transporter = createTransport();
    const info = await transporter.sendMail({
      from: `"College Ticket System" <${process.env.EMAIL_FROM}>`,
      to,
      subject,
      html,
      text,
    });
    logger.info(`Email sent to ${to}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    logger.error(`Email service error: ${error.message}`);
    return { success: false, error: error.message };
  }
};

const sendTicketConfirmation = async (user, ticket) => {
  return sendEmail({
    to: user.email,
    subject: `Ticket ${ticket.ticketId} Created - ${ticket.title}`,
    html: `
      <h2>Your ticket has been received</h2>
      <p>Dear ${user.name},</p>
      <p>Your support ticket has been successfully created and is being reviewed.</p>
      <table>
        <tr><td><strong>Ticket ID:</strong></td><td>${ticket.ticketId}</td></tr>
        <tr><td><strong>Title:</strong></td><td>${ticket.title}</td></tr>
        <tr><td><strong>Status:</strong></td><td>${ticket.status}</td></tr>
        <tr><td><strong>Priority:</strong></td><td>${ticket.priority}</td></tr>
      </table>
      <p>We will get back to you as soon as possible.</p>
    `,
    text: `Ticket ${ticket.ticketId} created: ${ticket.title}`,
  });
};

const sendTicketUpdate = async (user, ticket, message) => {
  return sendEmail({
    to: user.email,
    subject: `Ticket ${ticket.ticketId} Updated - ${ticket.title}`,
    html: `
      <h2>Your ticket has been updated</h2>
      <p>Dear ${user.name},</p>
      <p>${message}</p>
      <table>
        <tr><td><strong>Ticket ID:</strong></td><td>${ticket.ticketId}</td></tr>
        <tr><td><strong>Status:</strong></td><td>${ticket.status}</td></tr>
      </table>
    `,
    text: `Ticket ${ticket.ticketId} updated. ${message}`,
  });
};

module.exports = { sendEmail, sendTicketConfirmation, sendTicketUpdate };
