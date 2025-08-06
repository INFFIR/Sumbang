// Load variabel dari .env
require("dotenv").config();

// Import nodemailer
const nodemailer = require("nodemailer");

// Konfigurasi transporter menggunakan Gmail SMTP
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // dari .env
    pass: process.env.EMAIL_PASS, // dari .env
  },
});

// Konfigurasi email
const mailOptions = {
  from: `"Sumbang Notifikasi" <${process.env.EMAIL_USER}>`,
  to: "nandaadela2903@gmail.com", // ganti dengan email tujuan
  subject: "Laporan SUMBANG",
  text: "Halo! Ini adalah email uji coba dari aplikasi lokal kamu.",
  html: `
<html>
  <head>
    <meta charset="UTF-8" />
    <title>Email Tanggapan Laporan</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        background-color: #f4f4f4;
        margin: 0;
        padding: 0;
      }

      .email-container {
        background-color: #ffffff;
        max-width: 600px;
        margin: 40px auto;
        padding: 20px;
        border-radius: 8px;
        text-align: center;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
      }

      .logo-container img {
        height: 80px;
        margin: 0 15px;
        vertical-align: middle;
      }

      .message {
        font-size: 18px;
        margin-top: 30px;
        color: #333333;
      }
    </style>
  </head>
  <body>
    <div class="email-container">
      <div class="logo-container">
        <img src="cid:logo_pemkot" alt="Logo Pemerintah Kota Batu" />
        <img src="cid:logo_pemkot" alt="Logo Dinas Perhubungan Kota Batu" />
      </div>
      <div class="message">
        <p><strong>Terimakasih, laporan anda akan kami tindak lanjuti.</strong></p>
      </div>
    </div>
  </body>
</html>

  `,
};

// Kirim email
transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    return console.log("Gagal mengirim email:", error);
  }
  console.log("Email berhasil dikirim:", info.response);
});
