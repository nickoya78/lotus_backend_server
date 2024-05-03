import nodemailer from 'nodemailer';

export const sendEmail = async (to: string, subject: string, text: string) => {
  try {
    // Create a transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Define the email options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
    };

    // Send the email
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error(`Failed to send email: ${error}`);
  }
};