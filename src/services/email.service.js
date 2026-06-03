const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: process.env.EMAIL_USER,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN,
  },
});

// Verify the connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('Error connecting to email server:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});


// Function to send email
const sendEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"Backend Learning" <${process.env.EMAIL_USER}>`, // sender address
      to, // list of receivers
      subject, // Subject line
      text, // plain text body
      html, // html body
    });

    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error('Error sending email:', error);
  }
};


async function sendRegisterEmail(userEmail, name) {
    const subject = 'Welcome to Backend Learning!';
    const text = `Hi ${name},\n\nThank you for registering at Backend Learning. We're excited to have you on board! If you have any questions or need assistance, feel free to reach out to our support team.\n\nBest regards,\nThe Backend Learning Team`;
    const html = `<p>Hi ${name},</p><p>Thank you for registering at Backend Learning. We're excited to have you on board! If you have any questions or need assistance, feel free to reach out to our support team.</p><p>Best regards,<br>The Backend Learning Team</p>`;
    await sendEmail(userEmail, subject, text, html);
}

async function sendTransactionEmail(userEmail, name, amount, toaccount) {
    const subject = 'Transaction Confirmation';
    const text = `Hi ${name},\n\nA transaction of $${amount} has been completed to account ${toaccount}.\n\nBest regards,\nThe Backend Learning Team`;
    const html = `<p>Hi ${name},</p><p>A transaction of $${amount} has been completed to account ${toaccount}.</p><p>Best regards,<br>The Backend Learning Team</p>`;
    await sendEmail(userEmail, subject, text, html);
}

async function sendtransactionfailedEmail(userEmail, name, amount, toaccount) {
    const subject = 'Transaction Failed';
    const text = `Hi ${name},\n\nWe regret to inform you that a transaction of $${amount} to account ${toaccount} has failed. Please check your account balance and try again.\n\nBest regards,\nThe Backend Learning Team`;
    const html = `<p>Hi ${name},</p><p>We regret to inform you that a transaction of $${amount} to account ${toaccount} has failed. Please check your account balance and try again.</p><p>Best regards,<br>The Backend Learning Team</p>`;
    await sendEmail(userEmail, subject, text, html);
}

module.exports = { sendEmail, sendRegisterEmail, sendTransactionEmail, sendtransactionfailedEmail };