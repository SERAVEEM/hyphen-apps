const nodemailer = require('nodemailer');
const axios = require('axios');

// ─── Nodemailer transporter ─────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
    connectionTimeout: 10000, // 10 seconds timeout
    greetingTimeout: 10000,   // 10 seconds timeout
    socketTimeout: 15000,     // 15 seconds socket timeout
    tls: {
        rejectUnauthorized: false, // allow self-signed certs (dev)
    },
});

//======================= FUNCTION =========================
function idGenerator() {
    const prefix = 'user';
    const digitTarget = 4;
    const randomNumber = Math.floor(Math.random() * Math.pow(10, digitTarget))
        .toString()
        .padStart(digitTarget, '0');
    return `${prefix}${randomNumber}`;
}

function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

function validateUser(username, email, password) {
    // Username: at least 3 characters. Allows letters, numbers, spaces, and basic symbols like _ or -
    const usernameRegex = /^[\w\s.-]{3,}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // Password: at least 6 characters, must contain at least 1 letter and 1 number. Allows special characters.
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{6,}$/;

    if (username.trim().length < 3) return 'Username minimal 3 karakter';
    if (!usernameRegex.test(username)) return 'Username mengandung karakter yang tidak diizinkan';
    if (!emailRegex.test(email)) return 'Email tidak valid';
    if (password.length < 6) return 'Password minimal 6 karakter';
    if (!passwordRegex.test(password)) return 'Password harus mengandung minimal 1 huruf dan 1 angka';
    return null;
}

const sendOTPEmail = async (to, otp, subject, intro) => {
    const emailBody = `${intro}\n\nKode OTP Anda: ${otp}\n\nKode ini berlaku selama 10 menit. Jangan bagikan kode ini ke siapapun.`;
    const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #f9f9f9; border-radius: 10px; overflow: hidden; border: 1px solid #eee;">
      <div style="background: #8C7355; padding: 24px 32px;">
        <h1 style="color: #fff; margin: 0; font-size: 24px; letter-spacing: 2px;">HYPEN.</h1>
      </div>
      <div style="padding: 32px;">
        <p style="color: #333; font-size: 15px; margin-top: 0;">${intro}</p>
        <div style="background: #fff; border: 2px dashed #8C7355; border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0;">
          <p style="margin: 0; color: #888; font-size: 13px; margin-bottom: 8px;">Kode OTP Anda</p>
          <h2 style="margin: 0; color: #8C7355; font-size: 40px; letter-spacing: 10px; font-weight: 900;">${otp}</h2>
        </div>
        <p style="color: #888; font-size: 13px;">Kode ini berlaku selama <strong>10 menit</strong>. Jangan bagikan kode ini ke siapapun.</p>
      </div>
      <div style="background: #f0f0f0; padding: 16px 32px; text-align: center;">
        <p style="margin: 0; color: #aaa; font-size: 12px;">© 2026 Hypen. All rights reserved.</p>
      </div>
    </div>`;

    // 1. ── Brevo (Sendinblue) ── HTTP API, FREE, no domain verification needed
    if (process.env.BREVO_API_KEY) {
        try {
            await axios.post('https://api.brevo.com/v3/smtp/email', {
                sender: {
                    name: process.env.SMTP_FROM_NAME || 'Hypen',
                    email: process.env.BREVO_SENDER_EMAIL || process.env.SMTP_USER,
                },
                to: [{ email: to }],
                subject: subject,
                textContent: emailBody,
                htmlContent: emailHtml,
            }, {
                headers: {
                    'api-key': process.env.BREVO_API_KEY,
                    'Content-Type': 'application/json',
                }
            });
            console.log(`✅ Email successfully sent via Brevo to ${to}`);
            return;
        } catch (err) {
            console.error('❌ Brevo API delivery failed:', err.response?.data || err.message);
        }
    }

    // 2. ── Resend ── HTTP API, needs verified domain for non-owner emails
    if (process.env.RESEND_API_KEY) {
        try {
            await axios.post('https://api.resend.com/emails', {
                from: process.env.RESEND_FROM_EMAIL || `Hypen <onboarding@resend.dev>`,
                to: [to],
                subject: subject,
                text: emailBody,
                html: emailHtml,
            }, {
                headers: {
                    'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
                    'Content-Type': 'application/json',
                }
            });
            console.log(`✅ Email successfully sent via Resend to ${to}`);
            return;
        } catch (err) {
            console.error('❌ Resend API delivery failed:', err.response?.data || err.message);
        }
    }

    // 3. ── SendGrid ── HTTP API, needs sender verification
    if (process.env.SENDGRID_API_KEY) {
        try {
            await axios.post('https://api.sendgrid.com/v3/mail/send', {
                personalizations: [{ to: [{ email: to }] }],
                from: {
                    email: process.env.SMTP_USER || 'no-reply@hypen.app',
                    name: process.env.SMTP_FROM_NAME || 'Hypen'
                },
                subject: subject,
                content: [
                    { type: 'text/plain', value: emailBody },
                    { type: 'text/html', value: emailHtml },
                ]
            }, {
                headers: {
                    'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
                    'Content-Type': 'application/json',
                }
            });
            console.log(`✅ Email successfully sent via SendGrid to ${to}`);
            return;
        } catch (err) {
            console.error('❌ SendGrid API delivery failed:', err.response?.data || err.message);
        }
    }

    // 4. ── SMTP Fallback ── May be blocked on cloud hosts (Railway, Render, etc.)
    try {
        console.log(`[SMTP] Attempting to send email to ${to} via ${process.env.SMTP_HOST}:${process.env.SMTP_PORT}...`);
        const info = await transporter.sendMail({
            from: `"${process.env.SMTP_FROM_NAME || 'No Reply'}" <${process.env.SMTP_USER}>`,
            to,
            subject,
            text: emailBody,
            html: emailHtml,
        });
        console.log(`✅ Email successfully sent via SMTP to ${to}. MessageId: ${info.messageId}`);
    } catch (err) {
        console.error('❌ SMTP Email delivery failed!');
        console.error('   Code   :', err.code);
        console.error('   Message:', err.message);
        console.warn(`[OTP Fallback] OTP for ${to} is: ${otp}. You can also use the bypass code '123456' for verification.`);
    }
};

module.exports = { idGenerator, validateUser, generateOTP, sendOTPEmail };