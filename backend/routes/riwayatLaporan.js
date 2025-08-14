// riwayatLaporan.js
const express = require("express");
const router = express.Router();
const pool = require("../src/db"); 
// Route ini akan diakses sebagai /api/laporan/:id/riwayat
router.get("/laporan/:id/riwayat", async (req, res) => {
  const requestId = req.params.id;

  try {
    const [rows] = await pool.query(
      "SELECT status, keterangan, updated_at AS tanggal_diubah, updated_by AS diubah_oleh FROM request_data_history WHERE TRIM(updated_by) != 'system' AND request_id = ?",
      [requestId]
    );
    res.json(rows);
  } catch (error) {
    console.error("Error ambil riwayat:", error);
    res.status(500).json({ error: "Gagal mengambil data riwayat" });
  }
});

// Tambahkan route ini di laporan.js
router.get("/laporan/:id", async (req, res) => {
  const id = req.params.id;

  try {
    const [rows] = await pool.query(
      "SELECT * FROM request_data WHERE id = ?",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Data tidak ditemukan" });
    }

    const data = rows[0];

    // Konversi foto_selesai ke base64 jika ada
    if (data.foto_selesai) {
      data.foto_selesai = data.foto_selesai.toString("base64");
    }

    res.json(data);
  } catch (error) {
    console.error("Gagal mengambil data laporan:", error);
    res.status(500).json({ error: "Gagal mengambil data laporan" });
  }
});

// GET History untuk frontend - dengan authenticateToken
router.get("/history/:id", async (req, res) => {
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

router.get("/detail-riwayat/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await pool.query(
      `SELECT rd.nama, rd.permintaan, 
              rd.detail_permintaan, rd.lokasi, rd.status, rd.keterangan, rd.foto_selesai FROM request_data rd
       WHERE rd.id = ? AND rd.status != 'Deleted'`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Request not found or has been deleted" });
    }

    const requestData = rows[0];
    const fotoSelesaiBase64 = requestData.foto_selesai ? requestData.foto_selesai.toString("base64") : null;

    res.json({
      nama: requestData.nama,
      permintaan: requestData.permintaan,
      detail_permintaan: requestData.detail_permintaan,
      lokasi: requestData.lokasi,
      status: requestData.status,
      keterangan: requestData.keterangan,
      foto_selesai: fotoSelesaiBase64,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});



module.exports = router;
