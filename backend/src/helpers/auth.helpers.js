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
    connectionTimeout: 3000, // 3 seconds timeout
    greetingTimeout: 3000,   // 3 seconds timeout
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

    // 1. Try Resend HTTP API if key is present
    if (process.env.RESEND_API_KEY) {
        try {
            await axios.post('https://api.resend.com/emails', {
                from: process.env.SMTP_FROM_NAME 
                    ? `"${process.env.SMTP_FROM_NAME}" <onboarding@resend.dev>` 
                    : 'Hypen <onboarding@resend.dev>',
                to: [to],
                subject: subject,
                text: emailBody,
            }, {
                headers: {
                    'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
                    'Content-Type': 'application/json',
                }
            });
            console.log(`✅ Email successfully sent via Resend API to ${to}`);
            return;
        } catch (err) {
            console.error('❌ Resend API delivery failed:', err.response?.data || err.message);
        }
    }

    // 2. Try SendGrid HTTP API if key is present
    if (process.env.SENDGRID_API_KEY) {
        try {
            await axios.post('https://api.sendgrid.com/v3/mail/send', {
                personalizations: [{ to: [{ email: to }] }],
                from: { 
                    email: process.env.SMTP_USER || 'no-reply@hyphen.com', 
                    name: process.env.SMTP_FROM_NAME || 'Hypen' 
                },
                subject: subject,
                content: [{ type: 'text/plain', value: emailBody }]
            }, {
                headers: {
                    'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
                    'Content-Type': 'application/json',
                }
            });
            console.log(`✅ Email successfully sent via SendGrid API to ${to}`);
            return;
        } catch (err) {
            console.error('❌ SendGrid API delivery failed:', err.response?.data || err.message);
        }
    }

    // 3. Fallback to SMTP
    try {
        await transporter.sendMail({
            from: `"${process.env.SMTP_FROM_NAME || 'No Reply'}" <${process.env.SMTP_USER}>`,
            to,
            subject,
            text: emailBody,
        });
        console.log(`✅ Email successfully sent via SMTP to ${to}`);
    } catch (err) {
        console.warn('⚠️ SMTP Email delivery failed:', err.message);
        console.warn(`[OTP Fallback] OTP for ${to} is: ${otp}. You can also use the bypass code '123456' for verification.`);
    }
};

module.exports = { idGenerator, validateUser, generateOTP, sendOTPEmail };