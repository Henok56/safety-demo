require("dotenv").config();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const emailHeader = (title, color) => `
<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;border:1px solid #e5e7eb;border-radius:8px;">
<div style="background:${color};padding:20px">
<h2 style="color:white;margin:0;">Task & Training Notification System</h2>
<p style="color:#e5e7eb">${title}</p>
</div>
<div style="padding:20px">
<p style="background:#fef9c3;padding:10px;border-left:4px solid #eab308">
This is an automated notification. Please do not reply.
</p>
`;

const emailFooter = () => `
</div>
<div style="background:#f9fafb;padding:15px;text-align:center;font-size:12px;color:#999">
© ${new Date().getFullYear()} Task & Training Notification System
</div>
</div>
`;

exports.sendScheduleEmail = async ({ toEmail, employeeName, schedule }) => {
  await transporter.sendMail({
    from: `"Task & Training System" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: "New Task Assignment",
    html: `
${emailHeader("New Schedule Assignment","#2563eb")}

<p>Hello <b>${employeeName}</b>,</p>

<p>You have been assigned a new activity.</p>

<table style="width:100%;border-collapse:collapse">
<tr>
<td style="border:1px solid #ddd;padding:8px"><b>Activity</b></td>
<td style="border:1px solid #ddd;padding:8px">${schedule.shift}</td>
</tr>

<tr>
<td style="border:1px solid #ddd;padding:8px"><b>Due Date</b></td>
<td style="border:1px solid #ddd;padding:8px">${schedule.date}</td>
</tr>

<tr>
<td style="border:1px solid #ddd;padding:8px"><b>Notes</b></td>
<td style="border:1px solid #ddd;padding:8px">${schedule.location}</td>
</tr>
</table>

${emailFooter()}
`
  });
};

exports.sendCrashAlert = async ({ error }) => {
  await transporter.sendMail({
    from: `"System Monitor" <${process.env.EMAIL_USER}>`,
    to: process.env.ADMIN_EMAIL,
    subject: "🚨 Server Crash Alert",
    html: `
${emailHeader("Server Error","#dc2626")}

<p>A server error occurred:</p>

<pre style="background:#f3f4f6;padding:12px">${error}</pre>

${emailFooter()}
`
  });
};

exports.sendBackupEmail = async ({ date, size }) => {
  await transporter.sendMail({
    from: `"Backup System" <${process.env.EMAIL_USER}>`,
    to: process.env.ADMIN_EMAIL,
    subject: `Backup Complete ${date}`,
    html: `
${emailHeader("Backup Completed","#16a34a")}

<p>Backup completed successfully.</p>

<p>Date: ${date}</p>
<p>Size: ${(size / 1024).toFixed(2)} KB</p>

${emailFooter()}
`
  });
};