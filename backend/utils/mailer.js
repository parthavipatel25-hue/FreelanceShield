const nodemailer = require("nodemailer");

// ======================================================
// SMTP TRANSPORTER
// ======================================================

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),

  secure:
    String(process.env.SMTP_SECURE).toLowerCase() === "true",

  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// ======================================================
// SEND PASSWORD RESET / TEMPORARY PASSWORD EMAIL
// ======================================================

const sendPasswordResetEmail = async ({
  email,
  fullname,
  temporaryPassword,
}) => {
  if (!email) {
    throw new Error("Recipient email is required.");
  }

  if (!temporaryPassword) {
    throw new Error("Temporary password is required.");
  }

  const mailOptions = {
    from:
      process.env.SMTP_FROM ||
      process.env.SMTP_USER,

    to: email,

    subject:
      "FreelanceShield - Temporary Password",

    text: `
Hello ${fullname},

FreelanceShield detected and reviewed a security issue related to your account.

An administrator has reset your password as a security measure.

Your temporary password is:

${temporaryPassword}

Please use this temporary password to log in.

For security reasons, you will be required to change your password after logging in.

If you did not expect this action, please contact FreelanceShield support.

Regards,
FreelanceShield Security Team
`,

    html: `
      <div style="
        font-family: Arial, sans-serif;
        max-width: 600px;
        margin: 0 auto;
        padding: 30px;
        background: #f9fafb;
      ">

        <div style="
          background: white;
          border-radius: 16px;
          padding: 30px;
          border: 1px solid #e5e7eb;
        ">

          <h2 style="
            color: #111827;
            margin-bottom: 10px;
          ">
            FreelanceShield Security Alert
          </h2>

          <p style="
            color: #374151;
            font-size: 15px;
          ">
            Hello <strong>${fullname}</strong>,
          </p>

          <p style="
            color: #374151;
            font-size: 15px;
            line-height: 1.6;
          ">
            FreelanceShield detected and reviewed a security issue
            related to your account.
          </p>

          <div style="
            background: #ecfdf5;
            border: 1px solid #a7f3d0;
            border-radius: 12px;
            padding: 18px;
            margin: 20px 0;
          ">

            <strong style="
              color: #047857;
              font-size: 16px;
            ">
              Temporary Password
            </strong>

            <p style="
              color: #374151;
              margin-bottom: 8px;
            ">
              Your password has been reset by an administrator.
            </p>

            <div style="
              background: #f3f4f6;
              border: 1px solid #d1d5db;
              border-radius: 8px;
              padding: 14px;
              text-align: center;
              font-family: monospace;
              font-size: 20px;
              font-weight: bold;
              letter-spacing: 1px;
              color: #111827;
            ">
              ${temporaryPassword}
            </div>

          </div>

          <div style="
            background: #fff7ed;
            border: 1px solid #fed7aa;
            border-radius: 10px;
            padding: 14px;
            margin: 20px 0;
          ">

            <strong style="color: #c2410c;">
              Important
            </strong>

            <p style="
              color: #374151;
              margin-bottom: 0;
              line-height: 1.6;
            ">
              Use this temporary password to log in.
              You will be required to change your password
              after logging in.
            </p>

          </div>

          <p style="
            color: #6b7280;
            font-size: 13px;
            line-height: 1.6;
          ">
            If you did not expect this password reset,
            please contact FreelanceShield support immediately.
          </p>

          <hr style="
            border: none;
            border-top: 1px solid #e5e7eb;
            margin: 25px 0;
          ">

          <p style="
            color: #9ca3af;
            font-size: 12px;
          ">
            FreelanceShield Security Team
          </p>

        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

// ======================================================
// SEND GENERAL SECURITY NOTIFICATION EMAIL
// ======================================================

const sendSecurityNotificationEmail = async ({
  email,
  fullname,
  subject,
  message,
}) => {
  if (!email) {
    throw new Error("Recipient email is required.");
  }

  const mailOptions = {
    from:
      process.env.SMTP_FROM ||
      process.env.SMTP_USER,

    to: email,

    subject:
      subject ||
      "FreelanceShield Security Notification",

    text: `
Hello ${fullname},

${message}

Regards,
FreelanceShield Security Team
`,

    html: `
      <div style="
        font-family: Arial, sans-serif;
        max-width: 600px;
        margin: 0 auto;
        padding: 30px;
        background: #f9fafb;
      ">

        <div style="
          background: white;
          border-radius: 16px;
          padding: 30px;
          border: 1px solid #e5e7eb;
        ">

          <h2 style="
            color: #111827;
            margin-bottom: 15px;
          ">
            FreelanceShield Security Notification
          </h2>

          <p style="
            color: #374151;
            font-size: 15px;
          ">
            Hello <strong>${fullname}</strong>,
          </p>

          <p style="
            color: #374151;
            line-height: 1.7;
            font-size: 15px;
          ">
            ${message}
          </p>

          <hr style="
            border: none;
            border-top: 1px solid #e5e7eb;
            margin: 25px 0;
          ">

          <p style="
            color: #9ca3af;
            font-size: 12px;
          ">
            FreelanceShield Security Team
          </p>

        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

// ======================================================
// EXPORTS
// ======================================================

module.exports = {
  sendPasswordResetEmail,
  sendSecurityNotificationEmail,
};