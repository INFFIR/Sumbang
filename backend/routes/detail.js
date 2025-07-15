const express = require("express");
const pool = require("../src/db");
const moment = require("moment-timezone");
const authenticateToken = require("../src/authMiddleware");

const router = express.Router();

router.get("/detail/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await pool.query(
      "SELECT nama, alamat, no_hp, no_whatsapp, permintaan, detail_permintaan, lokasi, surat, status, foto FROM request_data WHERE id = ?",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Request not found" });
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

module.exports = router;
