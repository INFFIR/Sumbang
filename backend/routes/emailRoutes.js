// emailRoutes.js

const express = require("express");
const router = express.Router();
const { sendMail, sendStatusUpdateMail } = require("./sendMailer");
const { authenticateToken } = require("../src/authMiddleware");
const pool = require("../src/db");

// Route untuk kirim email konfirmasi request (saat user submit laporan)
router.post('/send-email', authenticateToken, async (req, res) => {
  try {
    const { user_id } = req.user; // dari token JWT

    if (!user_id) {
      return res.status(400).json({ message: "User ID tidak ditemukan di token." });
    }

    // Ambil email dan username user dari database
    const [rows] = await pool.query(
      "SELECT email, username FROM users WHERE id = ?",
      [user_id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "User tidak ditemukan." });
    }

    const { email, username } = rows[0];

    if (!email) {
      return res.status(400).json({ message: "Email tidak tersedia untuk user ini." });
    }

    await sendMail(email, username);
    return res.status(200).json({ message: "Email konfirmasi berhasil dikirim." });

  } catch (error) {
    console.error("Gagal mengirim email konfirmasi:", error);
    return res.status(500).json({ 
      message: "Gagal mengirim email konfirmasi.", 
      error: error.message 
    });
  }
});

// Route untuk kirim email update status (dari admin panel)
router.post("/send-status-email", authenticateToken, async (req, res) => {
  try {
    const { toEmail, username, status, keterangan } = req.body;

    console.log("=== EMAIL STATUS ROUTE DEBUG ===");
    console.log("Request body:", req.body);

    if (!toEmail || !username || !status) {
      return res.status(400).json({ 
        error: "Email, username, dan status wajib diisi" 
      });
    }

    // Validasi format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(toEmail)) {
      return res.status(400).json({ 
        error: "Format email tidak valid" 
      });
    }

    // Send status update email using sendMailer function
    await sendStatusUpdateMail(toEmail, username, status, keterangan || "");
    
    console.log(`Status email berhasil dikirim ke ${toEmail}`);
    
    return res.status(200).json({ 
      message: `Email notifikasi status "${status}" berhasil dikirim ke ${toEmail}` 
    });

  } catch (error) {
    console.error("Error sending status email:", error);
    return res.status(500).json({ 
      error: "Gagal mengirim email status",
      message: error.message,
      details: error.code || "Unknown error"
    });
  }
});

// Route untuk test email connection (optional, untuk debugging)
router.get("/test-email", authenticateToken, async (req, res) => {
  try {
    const { sendMail } = require("./sendMailer");
    
    // Test dengan email admin atau email dari token
    const testEmail = req.user.email || "test@example.com";
    const testUsername = req.user.username || "Test User";
    
    await sendMail(testEmail, testUsername);
    
    res.json({ 
      success: true, 
      message: `Test email sent to ${testEmail}` 
    });
    
  } catch (error) {
    console.error("Email test failed:", error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

module.exports = router;