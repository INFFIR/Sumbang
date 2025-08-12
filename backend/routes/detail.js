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

// ENHANCED: Anti-duplicate history insert function
const insertHistoryWithDuplicateCheck = async (requestId, status, keterangan, updatedBy, aksi) => {
  const timestamp = getTimestamp();
  
  // Validation
  if (!updatedBy || updatedBy.trim() === '') {
    console.error('❌ ERROR: updatedBy is empty!');
    throw new Error('updatedBy tidak boleh kosong');
  }
  
  console.log('=== ATTEMPTING HISTORY INSERT ===');
  console.log('Request ID:', requestId);
  console.log('Status:', status);
  console.log('Updated By:', updatedBy);
  console.log('Timestamp:', timestamp);
  console.log('Aksi:', aksi);
  
  // Cek duplikat dalam 3 detik terakhir dengan kombinasi yang sama
  const duplicateCheckQuery = `
    SELECT id, updated_by, status, updated_at, 
           TIMESTAMPDIFF(SECOND, updated_at, NOW()) as seconds_ago
    FROM request_data_history 
    WHERE request_id = ? 
      AND status = ? 
      AND aksi = ?
      AND TIMESTAMPDIFF(SECOND, updated_at, NOW()) <= 3
    ORDER BY updated_at DESC
    LIMIT 1
  `;
  
  const [existingRecords] = await pool.query(duplicateCheckQuery, [requestId, status, aksi]);
  
  if (existingRecords.length > 0) {
    const existing = existingRecords[0];
    console.warn('⚠️  DUPLICATE DETECTED!');
    console.warn('Existing:', existing);
    console.warn('Current:', { requestId, status, updatedBy, timestamp });
    
    // Jika record sama persis dari user yang sama, skip
    if (existing.updated_by === updatedBy) {
      console.warn('❌ SKIPPING: Same user record exists within 3 seconds');
      return { 
        skipped: true, 
        reason: 'Duplicate from same user prevented', 
        existingId: existing.id,
        secondsAgo: existing.seconds_ago
      };
    }
    
    // Jika ada record 'system' dan sekarang real user, update existing
    if (existing.updated_by === 'system' && updatedBy !== 'system') {
      console.warn('🔄 UPDATING: Replacing system record with real user');
      await pool.query(
        'UPDATE request_data_history SET updated_by = ?, keterangan = ?, updated_at = ? WHERE id = ?',
        [updatedBy, keterangan, timestamp, existing.id]
      );
      return { 
        updated: true, 
        reason: 'System record replaced with real user', 
        updatedId: existing.id 
      };
    }
    
    // Jika ada record real user dan sekarang 'system', skip system
    if (existing.updated_by !== 'system' && updatedBy === 'system') {
      console.warn('❌ SKIPPING: Real user record exists, blocking system duplicate');
      return { 
        skipped: true, 
        reason: 'System duplicate blocked', 
        existingId: existing.id 
      };
    }
  }
  
  // Proceed with insert jika tidak ada duplikat
  const historyQuery = `
    INSERT INTO request_data_history (request_id, status, keterangan, updated_at, updated_by, aksi)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  
  try {
    const result = await pool.query(historyQuery, [requestId, status, keterangan, timestamp, updatedBy, aksi]);
    console.log('✅ History inserted successfully with ID:', result[0].insertId);
    return { 
      success: true, 
      insertId: result[0].insertId,
      message: 'History recorded successfully'
    };
  } catch (error) {
    console.error('❌ Error inserting history:', error);
    console.error('Query params:', [requestId, status, keterangan, timestamp, updatedBy, aksi]);
    throw error;
  }
};

// Helper function to update existing history with keterangan
const updateLatestHistoryWithKeterangan = async (requestId, keterangan, updatedBy) => {
  const timestamp = getTimestamp();
  
  console.log('=== UPDATING LATEST HISTORY ===');
  console.log('Request ID:', requestId);
  console.log('Updated By:', updatedBy);
  
  // Cari record history terbaru untuk request ini (yang memiliki status)
  const [latestHistory] = await pool.query(
    `SELECT id, status FROM request_data_history 
     WHERE request_id = ? AND status IS NOT NULL 
     ORDER BY updated_at DESC LIMIT 1`,
    [requestId]
  );

  if (latestHistory.length > 0) {
    await pool.query(
      `UPDATE request_data_history 
       SET keterangan = ?, updated_at = ?, updated_by = ? 
       WHERE id = ?`,
      [keterangan, timestamp, updatedBy, latestHistory[0].id]
    );
    console.log('✅ History updated for request:', requestId);
    return true;
  }
  
  console.log('❌ No history found to update');
  return false;
};

// Validation middleware
const validateUserContext = (req, res, next) => {
  if (!req.user || !req.user.username || req.user.username.trim() === '') {
    console.error('❌ Invalid user context:', req.user);
    return res.status(401).json({ 
      error: "Invalid user context. Please login again." 
    });
  }
  
  console.log('✅ Valid user context:', {
    username: req.user.username,
    role: req.user.role,
    ip: req.ip
  });
  
  next();
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
    console.error('Error fetching detail:', error);
    res.status(500).json({ error: "Server error" });
  }
});

// GET History untuk frontend - TANPA FILTER SYSTEM (karena tidak akan ada lagi)
router.get("/history/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await pool.query(
      `SELECT id, request_id, status, keterangan, updated_at, updated_by, aksi
       FROM request_data_history 
       WHERE request_id = ? 
       ORDER BY updated_at DESC`,
      [id]
    );

    console.log(`📊 History fetched for request ${id}: ${rows.length} records`);
    res.json(rows);
  } catch (error) {
    console.error("Error fetching history:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// POST Update Status (Legacy - tanpa keterangan)
router.post("/update-status/:id", authenticateToken, validateUserContext, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const timestamp = getTimestamp();
  const updatedBy = req.user.username;

  console.log(`🔄 Updating status for request ${id} to ${status} by ${updatedBy}`);

  try {
    const [result] = await pool.query(
      "UPDATE request_data SET status = ?, date = ? WHERE id = ?",
      [status, timestamp, id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Data tidak ditemukan" });
    }

    // Insert ke history dengan duplicate check
    const historyResult = await insertHistoryWithDuplicateCheck(id, status, null, updatedBy, 'UPDATE');
    console.log('History operation result:', historyResult);

    res.status(200).json({ 
      message: "Status updated successfully",
      historyResult: historyResult
    });
  } catch (error) {
    console.error("Error updating status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// POST Update Status with Keterangan - ENDPOINT UTAMA
router.post("/update-status-with-keterangan/:id", authenticateToken, validateUserContext, async (req, res) => {
  const { id } = req.params;
  const { status, keterangan } = req.body;
  const timestamp = getTimestamp();
  const updatedBy = req.user.username;

  console.log(`🔄 Updating status+keterangan for request ${id}: ${status} by ${updatedBy}`);

  try {
    // Update status dan keterangan di tabel utama
    const [result] = await pool.query(
      "UPDATE request_data SET status = ?, keterangan = ?, date = ? WHERE id = ?",
      [status, keterangan || null, timestamp, id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Data tidak ditemukan" });
    }

    // Insert ke history dengan duplicate check
    const historyResult = await insertHistoryWithDuplicateCheck(id, status, keterangan || null, updatedBy, 'UPDATE');
    console.log('History operation result:', historyResult);

    res.status(200).json({ 
      message: "Status dan keterangan berhasil diupdate",
      historyResult: historyResult
    });
  } catch (error) {
    console.error("Error updating status with keterangan:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// POST Update Status with Photo Upload (specifically for Done status)
router.post("/update-status-with-photo/:id", authenticateToken, validateUserContext, upload.single("foto_selesai"), async (req, res) => {
  const { id } = req.params;
  const { keterangan } = req.body;
  const timestamp = getTimestamp();
  const fotoSelesai = req.file ? req.file.buffer : null;
  const updatedBy = req.user.username;

  console.log(`📸 Updating status to Done with photo for request ${id} by ${updatedBy}`);

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

    // Insert ke history dengan duplicate check
    const finalKeterangan = keterangan || "Status diselesaikan dengan foto";
    const historyResult = await insertHistoryWithDuplicateCheck(id, "Done", finalKeterangan, updatedBy, 'UPDATE');
    console.log('History operation result:', historyResult);

    res.status(200).json({ 
      message: "Status berhasil diubah menjadi Done dan foto telah diupload",
      historyResult: historyResult
    });
  } catch (error) {
    console.error("Error updating status with photo:", error);
    res.status(500).json({ error: "Terjadi kesalahan pada server" });
  }
});

// POST Soft Delete
router.post("/delete/:id", authenticateToken, validateUserContext, async (req, res) => {
  const { id } = req.params;
  const timestamp = getTimestamp();
  const updatedBy = req.user.username;

  console.log(`🗑️ Soft deleting request ${id} by ${updatedBy}`);

  try {
    const [result] = await pool.query(
      "UPDATE request_data SET status = ?, date = ? WHERE id = ?",
      ["Deleted", timestamp, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Data tidak ditemukan atau sudah dihapus" });
    }

    // Insert ke history dengan duplicate check
    const historyResult = await insertHistoryWithDuplicateCheck(id, "Deleted", "Data dihapus (soft delete)", updatedBy, 'DELETE');
    console.log('History operation result:', historyResult);

    res.status(200).json({ 
      message: "Data berhasil dihapus (soft delete)",
      historyResult: historyResult
    });
  } catch (error) {
    console.error("Error saat soft delete:", error);
    res.status(500).json({ error: "Terjadi kesalahan pada server" });
  }
});

// POST Update Keterangan Saja
router.post("/update-keterangan/:id", authenticateToken, validateUserContext, async (req, res) => {
  const { id } = req.params;
  const { keterangan } = req.body;
  const timestamp = getTimestamp();
  const updatedBy = req.user.username;

  console.log(`💬 Updating keterangan for request ${id} by ${updatedBy}`);

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
    
    let historyResult;
    
    // Jika tidak ada history yang bisa diupdate, buat entry baru
    if (!updated) {
      const [currentData] = await pool.query(
        "SELECT status FROM request_data WHERE id = ?",
        [id]
      );
      
      if (currentData.length > 0) {
        historyResult = await insertHistoryWithDuplicateCheck(id, currentData[0].status, keterangan, updatedBy, 'UPDATE');
      } else {
        historyResult = await insertHistoryWithDuplicateCheck(id, null, keterangan, updatedBy, 'UPDATE');
      }
      console.log('History operation result:', historyResult);
    } else {
      historyResult = { updated: true, message: 'Existing history updated' };
    }

    res.status(200).json({ 
      message: "Keterangan berhasil diperbarui",
      historyResult: historyResult
    });
  } catch (error) {
    console.error("Error saat memperbarui keterangan:", error);
    res.status(500).json({ error: "Terjadi kesalahan pada server" });
  }
});

module.exports = router;