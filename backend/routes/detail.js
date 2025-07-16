const express = require("express");
const pool = require("../src/db");
const moment = require("moment-timezone");
const authenticateToken = require("../src/authMiddleware");

const router = express.Router();

// GET Detail
router.get("/detail/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await pool.query(
      `SELECT nama, alamat, no_hp, no_whatsapp, permintaan, detail_permintaan, lokasi, surat, status, foto 
       FROM request_data 
       WHERE id = ? AND status != 'Deleted'`, // filter agar data 'Deleted' tidak muncul
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Request not found or has been deleted" });
    }

    const requestData = rows[0];

    const suratBase64 = requestData.surat
      ? requestData.surat.toString("base64")
      : null;
    const fotoBase64 = requestData.foto
      ? requestData.foto.toString("base64")
      : null;

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
  const timestamp = moment().tz("Asia/Jakarta").format("HH:mm, DD MMMM YYYY");

  const query = "UPDATE request_data SET status = ?, date = ? WHERE id = ?";

  try {
    await pool.query(query, [status, timestamp, id]);
    res.status(200).json({ message: "Status updated successfully" });
  } catch (error) {
    console.error("Error updating status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// POST Soft Delete
router.post("/delete/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const timestamp = moment().tz("Asia/Jakarta").format("HH:mm, DD MMMM YYYY");

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

module.exports = router;
