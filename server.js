const path = require('path');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

const requiredEnvKeys = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS'];
const missingKeys = requiredEnvKeys.filter((key) => !process.env[key]);

if (missingKeys.length > 0) {
  console.warn(`Eksik .env değişkenleri: ${missingKeys.join(', ')}`);
}

const smtpPort = Number(process.env.SMTP_PORT || 587);
const mailRecipient = process.env.RECIPIENT_EMAIL || process.env.MAIL_TO || process.env.SMTP_USER;
const mailFrom = process.env.MAIL_FROM || process.env.SMTP_USER;

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: smtpPort,
  secure: false,
  requireTLS: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname)));

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.post('/send-email', async (req, res) => {
  const { name, email, phone, message, agreement } = req.body || {};

  if (!name || !email || !phone || !message) {
    return res.status(400).json({
      ok: false,
      message: 'Name, email, phone and message fields are required.',
    });
  }

  if (String(agreement) !== 'true' && agreement !== true) {
    return res.status(400).json({
      ok: false,
      message: 'KVKK onayı gereklidir.',
    });
  }

  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return res.status(500).json({
      ok: false,
      message: 'SMTP ayarları eksik.',
    });
  }

  try {
    await transporter.sendMail({
      from: mailFrom,
      to: mailRecipient,
      replyTo: email,
      subject: `Yeni iletişim formu mesajı: ${name}`,
      text: [
        `Ad Soyad: ${name}`,
        `E-posta: ${email}`,
        `Telefon: ${phone}`,
        '',
        'Mesaj:',
        message,
      ].join('\n'),
      html: `
        <h2>Yeni iletişim formu mesajı</h2>
        <p><strong>Ad Soyad:</strong> ${name}</p>
        <p><strong>E-posta:</strong> ${email}</p>
        <p><strong>Telefon:</strong> ${phone}</p>
        <p><strong>Mesaj:</strong></p>
        <p>${String(message).replace(/\n/g, '<br>')}</p>
      `,
    });

    return res.json({ ok: true, message: 'Mesaj başarıyla iletildi.' });
  } catch (error) {
    console.error('E-posta gönderilemedi:', error);
    return res.status(500).json({
      ok: false,
      message: 'E-posta gönderilemedi.',
    });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});