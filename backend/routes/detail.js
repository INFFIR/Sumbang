//backend detail.js

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

// POST Update Status
router.post("/update-status/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const timestamp = getTimestamp();

  const query = "UPDATE request_data SET status = ?, date = ? WHERE id = ?";

  try {
    await pool.query(query, [status, timestamp, id]);
    res.status(200).json({ message: "Status updated successfully" });
  } catch (error) {
    console.error("Error updating status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// POST Update Status with Photo Upload (specifically for Done status)
router.post("/update-status-with-photo/:id", authenticateToken, upload.single("foto_selesai"), async (req, res) => {
  const { id } = req.params;
  const timestamp = getTimestamp();
  const fotoSelesai = req.file ? req.file.buffer : null;

  if (!fotoSelesai) {
    return res.status(400).json({ error: "Foto penyelesaian harus diupload" });
  }

  try {
    const [result] = await pool.query(
      "UPDATE request_data SET status = ?, foto_selesai = ?, date = ? WHERE id = ?",
      ["Done", fotoSelesai, timestamp, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Data tidak ditemukan" });
    }

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