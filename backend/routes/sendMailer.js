//sendMailer.js

require("dotenv").config();
const nodemailer = require("nodemailer");

console.log("Email config:", {
  user: process.env.EMAIL_USER,
  pass: process.env.EMAIL_PASS ? "***SET***" : "***NOT SET***"
});

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

// Function untuk generate standardized email template
function generateEmailTemplate(type, data) {
  const { username, toEmail, status, keterangan, statusColor, statusIcon, statusText } = data;
  
  // Base template yang sama untuk semua email
  return `
    <html>
      <head>
        <meta charset="UTF-8" />
        <title>${type} - SUMBANG System</title>
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
            border-top: 4px solid ${statusColor || '#2F5D9F'};
          }
          .header {
            background-color: ${statusColor || '#2F5D9F'};
            color: white;
            padding: 20px;
            border-radius: 8px 8px 0 0;
            margin: -30px -30px 20px -30px;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
          }
          .header p {
            margin: 5px 0 0 0;
            font-size: 14px;
            opacity: 0.9;
          }
          .message {
            font-size: 16px;
            color: #333333;
            margin: 20px 0;
            text-align: left;
          }
          .highlight {
            background-color: ${type === 'selesai' ? '#e8f5e8' : '#e3f2fd'};
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid ${statusColor || '#2F5D9F'};
            margin: 20px 0;
            text-align: center;
          }
          .highlight h3 {
            margin-top: 0;
            margin-bottom: 10px;
            color: ${statusColor || '#2F5D9F'};
          }
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eeeeee;
            font-size: 12px;
            color: #666666;
            text-align: center;
          }
          .status-badge {
            background-color: ${statusColor || '#ff9800'};
            color: white;
            padding: 10px 20px;
            border-radius: 25px;
            display: inline-block;
            font-weight: bold;
            margin: 10px 0;
            font-size: 14px;
          }
          .info-box {
            background-color: #f8f9fa;
            border: 1px solid #dee2e6;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
            text-align: left;
          }
          .info-box p {
            margin: 0 0 10px 0;
          }
          .info-box ul {
            margin: 10px 0;
            padding-left: 20px;
          }
          .info-box li {
            margin: 5px 0;
          }
          .steps-box {
            background-color: #f8f9fa;
            border: 1px solid #dee2e6;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
            text-align: left;
          }
          .steps-box h4 {
            margin: 0 0 15px 0;
            color: #333;
          }
          .steps-box ul {
            margin: 0;
            padding-left: 20px;
          }
          .steps-box li {
            margin: 8px 0;
          }
          .warning-box {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            border-left: 4px solid #fdcb6e;
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
          }
          .warning-box p {
            margin: 5px 0;
            color: #856404;
          }
          .thank-you-box {
            background: linear-gradient(135deg, ${statusColor || '#2F5D9F'}, ${statusColor ? statusColor + 'dd' : '#2F5D9F'});
            color: white;
            padding: 25px;
            border-radius: 10px;
            margin: 20px 0;
            text-align: center;
          }
          .thank-you-box h4 {
            margin: 0 0 10px 0;
            font-size: 18px;
          }
          .thank-you-box p {
            margin: 0;
            font-size: 15px;
            line-height: 1.5;
          }
          .photo-info {
            background-color: #e8f4fd;
            border: 1px solid #b3d9ff;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
            text-align: center;
          }
          .photo-info p {
            margin: 5px 0;
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="header">
            <h1>SISTEM SUMBANG</h1>
            <p>Sarana Prasarana Untuk Masyarakat Batu Gampang</p>
          </div>
          
          <div class="message">
            <p><strong>Halo ${username},</strong></p>
            
            <div class="highlight">
              <h3>${getMainMessage(type)}</h3>
              <div class="status-badge">${statusIcon || '📄'} ${statusText || 'SEDANG VERIFIKASI'}</div>
              <p><strong>Waktu:</strong> ${new Date().toLocaleString('id-ID')}</p>
            </div>
            
            <p>${getDescriptionMessage(type)}</p>
            
            <div class="info-box">
              <p><strong>📋 Informasi Laporan:</strong></p>
              <ul>
                <li><strong>Waktu ${type === 'konfirmasi' ? 'Diterima' : type === 'selesai' ? 'Selesai' : 'Update'}:</strong> ${new Date().toLocaleString('id-ID')}</li>
                <li><strong>Status:</strong> ${statusText || 'Sedang Verifikasi'}</li>
                <li><strong>Email Penerima:</strong> ${toEmail}</li>
              </ul>
            </div>
            
            ${keterangan ? `
              <div class="info-box">
                <p><strong>💬 Catatan ${type === 'selesai' ? 'dari Tim' : 'Status'}:</strong></p>
                <p style="color: #555; font-style: italic; margin: 10px 0;">${keterangan}</p>
              </div>
            ` : ''}
            
            ${getStepsSection(type)}
            
            ${type === 'selesai' ? getPhotoSection(data) : ''}
            
            <div class="warning-box">
              <p><strong>⚠️ Catatan Penting:</strong></p>
              <p>${getWarningMessage(type)}</p>
            </div>
            
            ${type === 'selesai' ? `
              <div class="thank-you-box">
                <h4>🙏 Terima Kasih!</h4>
                <p>Partisipasi Anda sangat berarti dalam membangun Batu Gampang yang lebih baik. Dengan laporan Anda, kami dapat meningkatkan sarana dan prasarana untuk kepentingan bersama.</p>
              </div>
            ` : ''}
          </div>
          
          <div class="footer">
            <p>📧 Email ini dikirim secara otomatis oleh sistem SUMBANG</p>
            <p>🔒 ${getFooterMessage(type)}</p>
            <p>&copy; ${new Date().getFullYear()} Sistem SUMBANG - Sarana Prasarana Untuk Masyarakat Batu Gampang</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

// Helper functions untuk dynamic content
function getMainMessage(type) {
  switch (type) {
    case 'konfirmasi':
      return '📨 Laporan Anda Telah Berhasil Diterima!';
    case 'update':
      return '🔄 Status Laporan Anda Telah Diupdate!';
    case 'selesai':
      return '🎊 Laporan Anda Telah Selesai Ditangani!';
    default:
      return 'Update Laporan SUMBANG';
  }
}

function getDescriptionMessage(type) {
  switch (type) {
    case 'konfirmasi':
      return 'Terima kasih telah mempercayai sistem SUMBANG untuk menyampaikan laporan Anda. Tim kami akan segera meninjau dan memproses laporan yang Anda kirimkan.';
    case 'update':
      return 'Kami ingin memberikan informasi terbaru mengenai status laporan yang Anda ajukan melalui sistem SUMBANG.';
    case 'selesai':
      return 'Kami dengan senang hati mengabarkan bahwa laporan yang Anda ajukan melalui sistem SUMBANG telah <strong>berhasil diselesaikan</strong>!';
    default:
      return 'Update terkait laporan Anda di sistem SUMBANG.';
  }
}

function getStepsSection(type) {
  switch (type) {
    case 'konfirmasi':
      return `
        <div class="steps-box">
          <h4>📋 Langkah Selanjutnya:</h4>
          <ul>
            <li>Tim kami akan memeriksa kelengkapan dokumen Anda</li>
            <li>Anda akan menerima email update terkait status laporan</li>
            <li>Proses verifikasi biasanya memakan waktu 1-3 hari kerja</li>
            <li>Jika ada kekurangan, tim akan menghubungi Anda melalui email</li>
          </ul>
        </div>
      `;
    case 'update':
      return `
        <div class="steps-box">
          <h4>📋 Langkah Selanjutnya:</h4>
          <ul>
            <li>Laporan Anda telah masuk tahap persetujuan</li>
            <li>Pemberitahuan lebih lanjut akan dikirim melalui email</li>
            <li>Tim akan memproses sesuai dengan prioritas dan jadwal</li>
          </ul>
        </div>
      `;
    case 'selesai':
      return `
        <div class="steps-box">
          <h4>✅ Status Penyelesaian:</h4>
          <ul>
            <li>Laporan Anda telah sepenuhnya diselesaikan</li>
            <li>Dokumentasi penyelesaian telah disimpan dalam sistem</li>
            <li>Anda dapat menghubungi kami jika ada pertanyaan lebih lanjut</li>
          </ul>
        </div>
      `;
    default:
      return '';
  }
}

function getWarningMessage(type) {
  switch (type) {
    case 'konfirmasi':
      return 'Mohon simpan email ini sebagai bukti pengajuan laporan Anda. Jika dalam 3 hari kerja belum ada update, silakan hubungi tim support kami.';
    case 'update':
      return 'Mohon simpan email ini sebagai bukti update status laporan Anda. Pantau terus perkembangan melalui email yang akan kami kirimkan.';
    case 'selesai':
      return 'Mohon simpan email ini sebagai bukti penyelesaian laporan Anda. Foto dokumentasi (jika ada) dapat dijadikan referensi.';
    default:
      return 'Mohon simpan email ini untuk dokumentasi laporan Anda.';
  }
}

function getFooterMessage(type) {
  switch (type) {
    case 'konfirmasi':
      return 'Jika Anda memiliki pertanyaan, silakan hubungi tim support kami';
    case 'update':
      return 'Update status akan terus kami kirimkan melalui email';
    case 'selesai':
      return 'Foto bukti penyelesaian dilampirkan untuk dokumentasi Anda (jika tersedia)';
    default:
      return 'Hubungi tim support jika ada pertanyaan';
  }
}

function getPhotoSection(data) {
  if (data.photoFile) {
    return `
      <div class="photo-info">
        <p><strong>📸 Foto Penyelesaian</strong></p>
        <p style="color: #666;">Foto dokumentasi penyelesaian telah dilampirkan dalam email ini sebagai bukti bahwa laporan Anda telah ditangani dengan baik.</p>
      </div>
    `;
  }
  return '';
}

// ✅ FIXED: Hanya 1 fungsi sendMail dengan template yang standardized
const sendMail = async (toEmail, username) => {
  console.log("=== EMAIL SENDING DEBUG ===");
  console.log("To email:", toEmail);
  console.log("Username:", username);
  console.log("Transporter available:", !!transporter);
  console.log("EMAIL_USER:", process.env.EMAIL_USER);
  console.log("EMAIL_PASS set:", !!process.env.EMAIL_PASS);

  // Validasi transporter
  if (!transporter) {
    console.error("Transporter not available, trying to reinitialize...");
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
    console.log("Transporter connection verified");

    // Data untuk template konfirmasi
    const templateData = {
      username,
      toEmail,
      statusColor: '#2F5D9F',
      statusIcon: '📨',
      statusText: 'SEDANG VERIFIKASI'
    };

    const mailOptions = {
      from: `"SUMBANG Notification" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: "Konfirmasi Laporan SUMBANG",
      html: generateEmailTemplate('konfirmasi', templateData),
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
    
    // Data untuk template update
    const templateData = {
      username,
      toEmail,
      status,
      keterangan,
      statusColor,
      statusIcon,
      statusText
    };

    const mailOptions = {
      from: `"SUMBANG Notification" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: `Update Status Laporan SUMBANG - ${statusText}`,
      html: generateEmailTemplate('update', templateData),
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ Status update email berhasil dikirim ke ${toEmail}:`, result.messageId);
    return result;
  } catch (error) {
    console.error("❌ Error mengirim status update email:", error);
    throw error;
  }
};

// Function untuk mengirim email Done dengan foto attachment
const sendDoneEmailWithPhoto = async (toEmail, username, status, keterangan, photoFile) => {
  console.log("=== DONE EMAIL WITH PHOTO DEBUG ===");
  console.log("To email:", toEmail);
  console.log("Username:", username);
  console.log("Status:", status);
  console.log("Photo file:", photoFile ? "Available" : "Not available");

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
    // Test koneksi sebelum kirim
    await transporter.verify();
    
    // Data untuk template selesai
    const templateData = {
      username,
      toEmail,
      status,
      keterangan,
      photoFile,
      statusColor: '#4caf50',
      statusIcon: '✅',
      statusText: 'SELESAI'
    };

    // Prepare mail options
    const mailOptions = {
      from: `"SUMBANG Notification" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: `Laporan SUMBANG Selesai - Terima Kasih!`,
      html: generateEmailTemplate('selesai', templateData),
    };

    // Add photo attachment if available
    if (photoFile && photoFile.buffer) {
      mailOptions.attachments = [
        {
          filename: `foto_penyelesaian_${new Date().toISOString().split('T')[0]}.jpg`,
          content: photoFile.buffer,
          contentType: photoFile.mimetype || 'image/jpeg'
        }
      ];
      
      console.log("📎 Photo attachment added:", {
        filename: mailOptions.attachments[0].filename,
        size: photoFile.buffer.length,
        contentType: photoFile.mimetype
      });
    }

    console.log("Sending Done email with photo attachment:", {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject,
      hasAttachment: !!(photoFile && photoFile.buffer)
    });

    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ Done email dengan foto berhasil dikirim ke ${toEmail}:`, result.messageId);
    console.log(`📧 Response:`, result.response);
    return result;
    
  } catch (error) {
    console.error("❌ Error mengirim Done email dengan foto:", error);
    
    // Enhanced error handling
    if (error.code === 'EAUTH') {
      console.error("🔧 SOLUSI AUTHENTICATION ERROR:");
      console.error("   1. Pastikan App Password Gmail masih valid");
      console.error("   2. Cek EMAIL_USER dan EMAIL_PASS di .env");
    } else if (error.code === 'EMESSAGE') {
      console.error("🔧 SOLUSI MESSAGE ERROR:");
      console.error("   1. Cek ukuran foto attachment (max 25MB untuk Gmail)");
      console.error("   2. Cek format foto yang diupload");
    }
    
    throw error;
  }
};

// Export semua functions
module.exports = { 
  sendMail, 
  sendStatusUpdateMail,
  sendDoneEmailWithPhoto
};