const fetch = require("node-fetch");

/**
 * Sends a schedule notification email via EmailJS
 */
const sendScheduleEmail = async ({ toEmail, employeeName, schedule }) => {
  const templateParams = {
    to_email: toEmail,
    employee_name: employeeName,
    activity: schedule.activity,
    start_date: schedule.startDate,
    due_date: schedule.dueDate,
    notes: schedule.notes || "Follow schedule as per assigned dates",
  };

  console.log("📨 Sending email:", templateParams);

  try {
    const res = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        service_id: "service_6j0wde3",
        template_id: "template_40n0138",
        accessToken: "xzQEaXB-unqgRoF9c",
        template_params: templateParams,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("❌ EmailJS error:", res.status, text);
      throw new Error(`EmailJS failed with status ${res.status}`);
    }

    console.log(`✅ Email sent to ${toEmail}`);
  } catch (err) {
    console.error("⚠️ Email sending failed:", err.message);
  }
};

module.exports = { sendScheduleEmail };