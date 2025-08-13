//detail.js backend

const express = require("express");
const multer = require("multer");
const pool = require("../src/db");
const moment = require("moment-timezone");
const { authenticateToken, authorizeRole }  = require("../src/authMiddleware");
const { sendMail, sendStatusUpdateMail } = require("./sendMailer"); // Import email functions

const router = express.Router();

// Setup multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

// Format timestamp standar
const getTimestamp = () => moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss");

// GET Detail - UPDATED: Include email from users table
router.get("/detail/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await pool.query(
      `SELECT rd.nama, rd.alamat, rd.no_hp, rd.no_whatsapp, rd.permintaan, 
              rd.detail_permintaan, rd.lokasi, rd.surat, rd.status, rd.foto, 
              rd.keterangan, rd.foto_selesai, rd.id_user, u.email, u.username
       FROM request_data rd
       JOIN users u ON rd.id_user = u.id
       WHERE rd.id = ? AND rd.status != 'Deleted'`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Request not found or has been deleted" });
    }

    const requestData = rows[0];

    const suratBase64 = requestData.surat ? requestData.surat.toString("base64") : null;
    const fotoBase64 = requestData.foto ? requestData.foto.toString("base64") : null;
    const fotoSelesaiBase64 = requestData.foto_selesai ? requestData.foto_selesai.toString("base64") : null;

    res.json({
      nama: requestData.nama,
      alamat: requestData.alamat,
      no_hp: requestData.no_hp,
      no_whatsapp: requestData.no_whatsapp,
      permintaan: requestData.permintaan,
      detail_permintaan: requestData.detail_permintaan,
      lokasi: requestData.lokasi,
      surat: suratBase64,
      status: requestData.status,
      foto: fotoBase64,
      keterangan: requestData.keterangan,
      foto_selesai: fotoSelesaiBase64,
      email: requestData.email, // Include email
      username: requestData.username, // Include username
      id_user: requestData.id_user
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// POST Update Status - UPDATED: With email notification
router.put("/update-status/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { status, keterangan } = req.body;

  try {
    // Get laporan data with user email
    const [rows] = await pool.query(
      "SELECT rd.*, u.email, u.username FROM request_data rd JOIN users u ON rd.id_user = u.id WHERE rd.id = ?",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Laporan tidak ditemukan" });
    }

    const laporan = rows[0];

    // Update status di database
    await pool.query(
      "UPDATE request_data SET status = ?, keterangan = ? WHERE id = ?",
      [status, keterangan || "", id]
    );

    // Send email notification
    try {
      if (laporan.email) {
        await sendStatusUpdateMail(laporan.email, laporan.username, status, keterangan);
        return res.status(200).json({
          message: "Status berhasil diupdate dan email notifikasi terkirim"
        });
      } else {
        return res.status(200).json({
          message: "Status berhasil diupdate, tapi email tidak tersedia"
        });
      }
    } catch (emailErr) {
      console.error("Gagal mengirim email:", emailErr);
      return res.status(200).json({
        message: "Status berhasil diupdate, tapi email gagal dikirim"
      });
    }

  } catch (err) {
    console.error("Error update status:", err);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
});

// NEW ROUTE: Send status email (for frontend calls)
router.post("/send-status-email", authenticateToken, async (req, res) => {
  try {
    const { toEmail, username, status, keterangan } = req.body;

    console.log("=== SEND STATUS EMAIL DEBUG ===");
    console.log("Request body:", req.body);

    if (!toEmail || !username || !status) {
      return res.status(400).json({ 
        message: "Email, username, dan status wajib diisi" 
      });
    }

    // Send status update email
    await sendStatusUpdateMail(toEmail, username, status, keterangan || "");
    
    return res.status(200).json({ 
      message: `Email notifikasi status "${status}" berhasil dikirim ke ${toEmail}` 
    });

  } catch (error) {
    console.error("Error sending status email:", error);
    return res.status(500).json({ 
      message: "Gagal mengirim email notifikasi", 
      error: error.message 
    });
  }
});

// POST Update Status with Photo Upload (specifically for Done status) - UPDATED
// POST Update Status with Photo Upload (specifically for Done status) - UPDATED with email attachment
router.post("/update-status-with-photo/:id", authenticateToken, upload.single("foto_selesai"), async (req, res) => {
  const { id } = req.params;
  const timestamp = getTimestamp();
  const fotoSelesai = req.file ? req.file.buffer : null;

  if (!fotoSelesai) {
    return res.status(400).json({ error: "Foto penyelesaian harus diupload" });
  }

  try {
    // Get user data for email
    const [userData] = await pool.query(
      "SELECT rd.*, u.email, u.username FROM request_data rd JOIN users u ON rd.id_user = u.id WHERE rd.id = ?",
      [id]
    );

    if (userData.length === 0) {
      return res.status(404).json({ error: "Data tidak ditemukan" });
    }

    const user = userData[0];

    // Update status and photo
    const [result] = await pool.query(
      "UPDATE request_data SET status = ?, foto_selesai = ?, date = ? WHERE id = ?",
      ["Done", fotoSelesai, timestamp, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Data tidak ditemukan" });
    }

    // Send email notification for Done status with photo attachment
    try {
      if (user.email) {
        // Import the new function for sending email with photo
        const { sendDoneEmailWithPhoto } = require("./sendMailer");
        
        await sendDoneEmailWithPhoto(
          user.email, 
          user.username, 
          "Done", 
          "Laporan Anda telah selesai ditangani. Terima kasih atas laporan Anda.",
          req.file // Pass the photo file
        );
        
        console.log(`Done email with photo sent to ${user.email}`);
      }
    } catch (emailError) {
      console.error("Error sending Done email with photo:", emailError);
    }

    res.status(200).json({ 
      message: "Status berhasil diubah menjadi Done, foto telah diupload, dan email notifikasi dengan foto terkirim" 
    });
  } catch (error) {
    console.error("Error updating status with photo:", error);
    res.status(500).json({ error: "Terjadi kesalahan pada server" });
  }
});

// POST Soft Delete
router.post("/delete/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const timestamp = getTimestamp();

  try {
    const [result] = await pool.query(
      "UPDATE request_data SET status = ?, date = ? WHERE id = ?",
      ["Deleted", timestamp, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Data tidak ditemukan atau sudah dihapus" });
    }

    res.status(200).json({ message: "Data berhasil dihapus (soft delete)" });
  } catch (error) {
    console.error("Error saat soft delete:", error);
    res.status(500).json({ error: "Terjadi kesalahan pada server" });
  }
});

// POST Update Keterangan
router.post("/update-keterangan/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { keterangan } = req.body;
  const timestamp = getTimestamp();

  try {
    const [result] = await pool.query(
      "UPDATE request_data SET keterangan = ?, date = ? WHERE id = ?",
      [keterangan, timestamp, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Data tidak ditemukan" });
    }

    res.status(200).json({ message: "Keterangan berhasil diperbarui" });
  } catch (error) {
    console.error("Error saat memperbarui keterangan:", error);
    res.status(500).json({ error: "Terjadi kesalahan pada server" });
  }
});

module.exports = router;