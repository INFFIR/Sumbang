//laporan.js 
const express = require("express");
const router = express.Router();
const pool = require("../src/db"); // sesuaikan

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

    //Konversi foto_selesai ke base64 jika ada
    if (data.foto_selesai) {
      data.foto_selesai = data.foto_selesai.toString("base64");
    }

    res.json(data);
  } catch (error) {
    console.error("Gagal mengambil data laporan:", error);
    res.status(500).json({ error: "Gagal mengambil data laporan" });
  }
});


module.exports = router;
