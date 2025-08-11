const express = require("express");
const multer = require("multer");
const pool = require("../src/db");
const moment = require("moment-timezone");
const { authenticateToken, authorizeRole }  = require("../src/authMiddleware");

const router = express.Router();

// Setup multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

// Format timestamp standar
const getTimestamp = () => moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss");

// Helper function to insert history
const insertHistory = async (requestId, status, keterangan, updatedBy, aksi) => {
  const timestamp = getTimestamp();
  const historyQuery = `
    INSERT INTO request_data_history (request_id, status, keterangan, updated_at, updated_by, aksi)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  await pool.query(historyQuery, [requestId, status, keterangan, timestamp, updatedBy, aksi]);
};

// Helper function to update existing history with keterangan
const updateLatestHistoryWithKeterangan = async (requestId, keterangan, updatedBy) => {
  const timestamp = getTimestamp();
  
  // Cari record history terbaru untuk request ini (yang bukan system dan memiliki status)
  const [latestHistory] = await pool.query(
    `SELECT id, status FROM request_data_history 
     WHERE request_id = ? AND status IS NOT NULL AND TRIM(updated_by) != 'system' 
     ORDER BY updated_at DESC LIMIT 1`,
    [requestId]
  );

  if (latestHistory.length > 0) {
    // Update record history yang sudah ada
    await pool.query(
      `UPDATE request_data_history 
       SET keterangan = ?, updated_at = ?, updated_by = ? 
       WHERE id = ?`,
      [keterangan, timestamp, updatedBy, latestHistory[0].id]
    );
    return true;
  }
  return false;
};

// GET Detail
router.get("/detail/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await pool.query(
      `SELECT nama, alamat, no_hp, no_whatsapp, permintaan, detail_permintaan, lokasi, surat, status, foto, keterangan, foto_selesai
       FROM request_data
       WHERE id = ? AND status != 'Deleted'`,
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
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// GET History untuk frontend
router.get("/history/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await pool.query(
      `SELECT id, request_id, status, keterangan, updated_at, updated_by, aksi
       FROM request_data_history WHERE TRIM(updated_by) != 'system' AND request_id = ? ORDER BY updated_at DESC`,
      [id]
    );

    res.json(rows);
  } catch (error) {
    console.error("Error fetching history:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// POST Update Status (Legacy - tanpa keterangan)
router.post("/update-status/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const timestamp = getTimestamp();
  const updatedBy = req.user.username;

  const query = "UPDATE request_data SET status = ?, date = ? WHERE id = ?";

  try {
    const [result] = await pool.query(query, [status, timestamp, id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Data tidak ditemukan" });
    }

    // Insert ke history dengan username
    await insertHistory(id, status, null, updatedBy, 'UPDATE');

    res.status(200).json({ message: "Status updated successfully" });
  } catch (error) {
    console.error("Error updating status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// POST Update Status with Keterangan - ENDPOINT BARU UTAMA
router.post("/update-status-with-keterangan/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { status, keterangan } = req.body;
  const timestamp = getTimestamp();
  const updatedBy = req.user.username;

  try {
    // Update status dan keterangan di tabel utama
    const [result] = await pool.query(
      "UPDATE request_data SET status = ?, keterangan = ?, date = ? WHERE id = ?",
      [status, keterangan || null, timestamp, id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Data tidak ditemukan" });
    }

    // Insert ke history dengan status dan keterangan sekaligus dalam satu record
    await insertHistory(id, status, keterangan || null, updatedBy, 'UPDATE');

    res.status(200).json({ message: "Status dan keterangan berhasil diupdate" });
  } catch (error) {
    console.error("Error updating status with keterangan:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// POST Update Status with Photo Upload (specifically for Done status)
router.post("/update-status-with-photo/:id", authenticateToken, upload.single("foto_selesai"), async (req, res) => {
  const { id } = req.params;
  const { keterangan } = req.body; // Ambil keterangan dari form data
  const timestamp = getTimestamp();
  const fotoSelesai = req.file ? req.file.buffer : null;
  const updatedBy = req.user.username;

  if (!fotoSelesai) {
    return res.status(400).json({ error: "Foto penyelesaian harus diupload" });
  }

  try {
    // Update status, foto, dan keterangan
    const [result] = await pool.query(
      "UPDATE request_data SET status = ?, foto_selesai = ?, keterangan = ?, date = ? WHERE id = ?",
      ["Done", fotoSelesai, keterangan || null, timestamp, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Data tidak ditemukan" });
    }

    // Insert ke history dengan status Done dan keterangan sekaligus
    const finalKeterangan = keterangan || "Status diselesaikan dengan foto";
    await insertHistory(id, "Done", finalKeterangan, updatedBy, 'UPDATE');

    res.status(200).json({ message: "Status berhasil diubah menjadi Done dan foto telah diupload" });
  } catch (error) {
    console.error("Error updating status with photo:", error);
    res.status(500).json({ error: "Terjadi kesalahan pada server" });
  }
});

// POST Soft Delete
router.post("/delete/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const timestamp = getTimestamp();
  const updatedBy = req.user.username;

  try {
    const [result] = await pool.query(
      "UPDATE request_data SET status = ?, date = ? WHERE id = ?",
      ["Deleted", timestamp, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Data tidak ditemukan atau sudah dihapus" });
    }

    // Insert ke history dengan username
    await insertHistory(id, "Deleted", "Data dihapus (soft delete)", updatedBy, 'UPDATE');

    res.status(200).json({ message: "Data berhasil dihapus (soft delete)" });
  } catch (error) {
    console.error("Error saat soft delete:", error);
    res.status(500).json({ error: "Terjadi kesalahan pada server" });
  }
});

// POST Update Keterangan Saja (untuk tombol simpan keterangan manual)
router.post("/update-keterangan/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { keterangan } = req.body;
  const timestamp = getTimestamp();
  const updatedBy = req.user.username;

  try {
    // Update keterangan di tabel utama
    const [result] = await pool.query(
      "UPDATE request_data SET keterangan = ?, date = ? WHERE id = ?",
      [keterangan, timestamp, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Data tidak ditemukan" });
    }

    // Coba update history yang sudah ada dengan keterangan
    const updated = await updateLatestHistoryWithKeterangan(id, keterangan, updatedBy);
    
    // Jika tidak ada history yang bisa diupdate, buat entry baru (fallback)
    if (!updated) {
      // Ambil status saat ini dari request_data
      const [currentData] = await pool.query(
        "SELECT status FROM request_data WHERE id = ?",
        [id]
      );
      
      if (currentData.length > 0) {
        await insertHistory(id, currentData[0].status, keterangan, updatedBy, 'UPDATE');
      } else {
        await insertHistory(id, null, keterangan, updatedBy, 'UPDATE');
      }
    }

    res.status(200).json({ message: "Keterangan berhasil diperbarui" });
  } catch (error) {
    console.error("Error saat memperbarui keterangan:", error);
    res.status(500).json({ error: "Terjadi kesalahan pada server" });
  }
});

module.exports = router;