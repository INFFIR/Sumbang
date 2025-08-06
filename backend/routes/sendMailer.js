require("dotenv").config();
const nodemailer = require("nodemailer");

console.log("Email config:", {
  user: process.env.EMAIL_USER,
  pass: process.env.EMAIL_PASS ? "***SET***" : "***NOT SET***"
});

// ❌ MASALAH 1: DOUBLE DECLARATION - Ada 2 fungsi sendMail yang berbeda!
// ❌ MASALAH 2: Transporter dibuat 2 kali (global dan di dalam fungsi)
// ❌ MASALAH 3: createTransporter typo sudah diperbaiki tapi masih ada konflik

// SOLUSI: Buat 1 transporter global dan 1 fungsi sendMail saja
let transporter;

async function initializeTransporter() {
  try {
    console.log("Initializing email transporter...");
    
    // Validasi environment variables dulu
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      throw new Error("EMAIL_USER atau EMAIL_PASS tidak diset di environment variables");
    }
    
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      // Tambahan konfigurasi untuk debugging
      debug: process.env.NODE_ENV === 'development',
      logger: process.env.NODE_ENV === 'development'
    });

    // Test koneksi transporter secara async
    console.log("Testing SMTP connection...");
    await transporter.verify();
    console.log("✅ Email transporter ready to send emails");
    
    return true;
  } catch (error) {
    console.error("❌ Error setting up email transporter:", error.message);
    
    // Detailed error handling
    if (error.code === 'EAUTH') {
      console.error("💡 Authentication Error Solutions:");
      console.error("   1. Pastikan 2FA diaktifkan di akun Gmail");
      console.error("   2. Generate App Password di Google Account Settings");
      console.error("   3. Gunakan App Password, bukan password biasa");
      console.error("   4. Format: EMAIL_PASS=abcd efgh ijkl mnop (16 karakter)");
    } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNECTION') {
      console.error("💡 Connection Error Solutions:");
      console.error("   1. Cek koneksi internet server");
      console.error("   2. Cek firewall - pastikan port 587 tidak diblokir");
      console.error("   3. Coba restart aplikasi");
    }
    
    transporter = null;
    return false;
  }
}

// Initialize transporter saat module di-load
initializeTransporter().catch(error => {
  console.error("Failed to initialize email transporter:", error.message);
});

// ✅ FIXED: Hanya 1 fungsi sendMail
const sendMail = async (toEmail, username) => {
  console.log("=== EMAIL SENDING DEBUG ===");
  console.log("To email:", toEmail);
  console.log("Username:", username);
  console.log("Transporter available:", !!transporter);
  console.log("EMAIL_USER:", process.env.EMAIL_USER);
  console.log("EMAIL_PASS set:", !!process.env.EMAIL_PASS);

  // Validasi transporter
  if (!transporter) {
    console.error("❌ Transporter not available, trying to reinitialize...");
    const initialized = await initializeTransporter();
    if (!initialized) {
      throw new Error("Email transporter not available. Please check email configuration.");
    }
  }

  // Validasi input
  if (!toEmail || !username) {
    throw new Error("Email dan username harus disediakan");
  }

  // Validasi format email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(toEmail)) {
    throw new Error(`Format email tidak valid: ${toEmail}`);
  }

  try {
    // ✅ FIXED: Test koneksi sebelum kirim email
    console.log("Testing transporter connection before sending...");
    await transporter.verify();
    console.log("✅ Transporter connection verified");

    const mailOptions = {
      from: `"SUMBANG Notification" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: "Konfirmasi Laporan SUMBANG",
      html: `
        <html>
          <head>
            <meta charset="UTF-8" />
            <title>Konfirmasi Laporan SUMBANG</title>
            <style>
              body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background-color: #f8f9fa;
                margin: 0;
                padding: 0;
                line-height: 1.6;
              }
              .email-container {
                background-color: #ffffff;
                max-width: 600px;
                margin: 40px auto;
                padding: 30px;
                border-radius: 12px;
                text-align: center;
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
                border-top: 4px solid #2F5D9F;
              }
              .header {
                background-color: #2F5D9F;
                color: white;
                padding: 20px;
                border-radius: 8px 8px 0 0;
                margin: -30px -30px 20px -30px;
              }
              .header h1 {
                margin: 0;
                font-size: 24px;
              }
              .message {
                font-size: 16px;
                color: #333333;
                margin: 20px 0;
                text-align: left;
              }
              .highlight {
                background-color: #e3f2fd;
                padding: 15px;
                border-radius: 8px;
                border-left: 4px solid #2F5D9F;
                margin: 20px 0;
              }
              .footer {
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #eeeeee;
                font-size: 12px;
                color: #666666;
              }
              .status-badge {
                background-color: #ff9800;
                color: white;
                padding: 8px 16px;
                border-radius: 20px;
                display: inline-block;
                font-weight: bold;
                margin: 10px 0;
              }
              .info-box {
                background-color: #f8f9fa;
                border: 1px solid #dee2e6;
                border-radius: 8px;
                padding: 15px;
                margin: 15px 0;
              }
            </style>
          </head>
          <body>
            <div class="email-container">
              <div class="header">
                <h1>🏢 SISTEM SUMBANG</h1>
                <p style="margin: 0;">Sarana Prasarana Untuk Masyarakat Batu Gampang</p>
              </div>
              
              <div class="message">
                <p><strong>Halo ${username},</strong></p>
                
                <div class="highlight">
                  <p><strong>✅ Laporan Anda telah berhasil diterima!</strong></p>
                  <div class="status-badge">⏳ STATUS: SEDANG VERIFIKASI</div>
                </div>
                
                <p>Terima kasih telah mempercayai sistem SUMBANG untuk menyampaikan laporan Anda. Tim kami akan segera meninjau dan memproses laporan yang Anda kirimkan.</p>
                
                <div class="info-box">
                  <p><strong>📋 Informasi Laporan:</strong></p>
                  <ul style="margin: 10px 0; padding-left: 20px;">
                    <li><strong>Waktu Diterima:</strong> ${new Date().toLocaleString('id-ID')}</li>
                    <li><strong>Status:</strong> Sedang Verifikasi</li>
                    <li><strong>Email Penerima:</strong> ${toEmail}</li>
                  </ul>
                </div>
                
                <p><strong>📌 Langkah selanjutnya:</strong></p>
                <ul style="text-align: left; margin-left: 20px;">
                  <li>Tim verifikasi akan memeriksa kelengkapan dokumen Anda</li>
                  <li>Anda akan menerima email update terkait status laporan</li>
                  <li>Proses verifikasi biasanya memakan waktu 1-3 hari kerja</li>
                  <li>Jika ada kekurangan, tim akan menghubungi Anda melalui email</li>
                </ul>
                
                <div class="highlight">
                  <p><strong>⚠️ Catatan Penting:</strong></p>
                  <p>Mohon simpan email ini sebagai bukti pengajuan laporan Anda. Jika dalam 3 hari kerja belum ada update, silakan hubungi tim support kami.</p>
                </div>
              </div>
              
              <div class="footer">
                <p>📧 Email ini dikirim secara otomatis oleh sistem SUMBANG</p>
                <p>🔒 Jika Anda memiliki pertanyaan, silakan hubungi tim support kami</p>
                <p>&copy; ${new Date().getFullYear()} Sistem SUMBANG - Sarana Prasarana Untuk Masyarakat Batu Gampang</p>
              </div>
            </div>
          </body>
        </html>
      `,
    };

    console.log("Sending email with options:", {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject
    });

    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ Email berhasil dikirim ke ${toEmail}:`, result.messageId);
    console.log(`📧 Response:`, result.response);
    return result;
    
  } catch (error) {
    console.error("❌ Error mengirim email:", error);
    
    // Enhanced error handling dengan solusi spesifik
    if (error.code === 'EAUTH') {
      console.error("🔧 SOLUSI AUTHENTICATION ERROR:");
      console.error("   1. Buka https://myaccount.google.com/security");
      console.error("   2. Aktifkan 2-Step Verification");
      console.error("   3. Generate App Password di https://myaccount.google.com/apppasswords");
      console.error("   4. Gunakan App Password di EMAIL_PASS, bukan password Gmail");
      console.error("   5. Format: EMAIL_PASS=abcd efgh ijkl mnop (16 karakter)");
    } else if (error.code === 'ENOTFOUND') {
      console.error("🔧 SOLUSI NETWORK ERROR:");
      console.error("   1. Cek koneksi internet server");
      console.error("   2. DNS issue - coba restart server atau network");
    } else if (error.code === 'ECONNECTION' || error.code === 'ETIMEDOUT') {
      console.error("🔧 SOLUSI CONNECTION ERROR:");
      console.error("   1. Cek firewall - pastikan port 587 & 465 terbuka");
      console.error("   2. Coba restart aplikasi");
      console.error("   3. Jika pakai VPS/hosting, hubungi provider");
    } else if (error.code === 'EMESSAGE') {
      console.error("🔧 SOLUSI MESSAGE ERROR:");
      console.error("   1. Cek format email recipient");
      console.error("   2. Cek content HTML email");
    }
    
    throw error;
  }
};

// Function untuk mengirim email update status
const sendStatusUpdateMail = async (toEmail, username, status, keterangan) => {
  console.log("=== STATUS UPDATE EMAIL DEBUG ===");
  console.log("To email:", toEmail);
  console.log("Username:", username);
  console.log("Status:", status);
  console.log("Keterangan:", keterangan);

  // Validasi transporter
  if (!transporter) {
    console.error("❌ Transporter not available, trying to reinitialize...");
    const initialized = await initializeTransporter();
    if (!initialized) {
      throw new Error("Email transporter not available. Please check email configuration.");
    }
  }

  // Validasi input
  if (!toEmail || !username) {
    throw new Error("Email dan username harus disediakan");
  }

  // Validasi format email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(toEmail)) {
    throw new Error(`Format email tidak valid: ${toEmail}`);
  }

  let statusColor, statusIcon, statusText;
  
  switch (status) {
    case 'Disetujui':
      statusColor = '#4caf50';
      statusIcon = '✅';
      statusText = 'DISETUJUI';
      break;
    case 'Ditolak':
      statusColor = '#f44336';
      statusIcon = '❌';
      statusText = 'DITOLAK';
      break;
    case 'Sedang Proses':
      statusColor = '#ff9800';
      statusIcon = '⏳';
      statusText = 'SEDANG DIPROSES';
      break;
    default:
      statusColor = '#2196f3';
      statusIcon = '📄';
      statusText = status.toUpperCase();
  }

  try {
    // Test koneksi sebelum kirim
    await transporter.verify();
    
    const mailOptions = {
      from: `"SUMBANG Notification" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: `📢 Update Status Laporan SUMBANG - ${statusText}`,
      html: `
        <html>
          <head>
            <meta charset="UTF-8" />
            <title>Update Status Laporan SUMBANG</title>
            <style>
              body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background-color: #f8f9fa;
                margin: 0;
                padding: 0;
                line-height: 1.6;
              }
              .email-container {
                background-color: #ffffff;
                max-width: 600px;
                margin: 40px auto;
                padding: 30px;
                border-radius: 12px;
                text-align: center;
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
                border-top: 4px solid ${statusColor};
              }
              .header {
                background-color: ${statusColor};
                color: white;
                padding: 20px;
                border-radius: 8px 8px 0 0;
                margin: -30px -30px 20px -30px;
              }
              .header h1 {
                margin: 0;
                font-size: 24px;
              }
              .message {
                font-size: 16px;
                color: #333333;
                margin: 20px 0;
                text-align: left;
              }
              .status-highlight {
                background-color: ${statusColor}15;
                padding: 20px;
                border-radius: 8px;
                border-left: 4px solid ${statusColor};
                margin: 20px 0;
              }
              .footer {
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #eeeeee;
                font-size: 12px;
                color: #666666;
              }
              .status-badge {
                background-color: ${statusColor};
                color: white;
                padding: 8px 16px;
                border-radius: 20px;
                display: inline-block;
                font-weight: bold;
                margin: 10px 0;
              }
              .keterangan-box {
                background-color: #f8f9fa;
                border: 1px solid #dee2e6;
                border-radius: 8px;
                padding: 15px;
                margin: 15px 0;
                text-align: left;
              }
            </style>
          </head>
          <body>
            <div class="email-container">
              <div class="header">
                <h1>📢 UPDATE STATUS</h1>
                <p style="margin: 0;">Sistem SUMBANG</p>
              </div>
              
              <div class="message">
                <p><strong>Halo ${username},</strong></p>
                
                <div class="status-highlight">
                  <p><strong>${statusIcon} Status laporan Anda telah diupdate!</strong></p>
                  <div class="status-badge">${statusIcon} ${statusText}</div>
                  <p><strong>Waktu Update:</strong> ${new Date().toLocaleString('id-ID')}</p>
                </div>
                
                ${keterangan ? `
                  <div class="keterangan-box">
                    <p><strong>💬 Keterangan dari Tim:</strong></p>
                    <p style="color: #555; margin: 5px 0; font-style: italic;">${keterangan}</p>
                  </div>
                ` : ''}
                
                <p>Terima kasih atas kesabaran Anda. Tim SUMBANG berkomitmen untuk memberikan pelayanan terbaik bagi masyarakat.</p>
              </div>
              
              <div class="footer">
                <p>📧 Email ini dikirim secara otomatis oleh sistem SUMBANG</p>
                <p>&copy; ${new Date().getFullYear()} Sistem SUMBANG - Sarana Prasarana Untuk Masyarakat Batu Gampang</p>
              </div>
            </div>
          </body>
        </html>
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ Status update email berhasil dikirim ke ${toEmail}:`, result.messageId);
    return result;
  } catch (error) {
    console.error("❌ Error mengirim status update email:", error);
    throw error;
  }
};

// ✅ ADDED: Function untuk test email (debugging)
const testEmailConnection = async () => {
  try {
    console.log("=== EMAIL CONNECTION TEST ===");
    
    if (!transporter) {
      console.log("Initializing transporter...");
      await initializeTransporter();
    }
    
    if (!transporter) {
      throw new Error("Failed to initialize transporter");
    }
    
    console.log("Testing SMTP connection...");
    await transporter.verify();
    console.log("✅ SMTP connection successful");
    
    return { success: true, message: "Email connection OK" };
  } catch (error) {
    console.error("❌ Email connection test failed:", error.message);
    return { success: false, error: error.message, code: error.code };
  }
};

module.exports = { 
  sendMail, 
  sendStatusUpdateMail,
  testEmailConnection  // ✅ ADDED untuk debugging
};