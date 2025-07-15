const express = require("express");
const pool = require("../src/db");

const router = express.Router();

router.get("/verifikasi/data", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, nama, permintaan, lokasi, status, date FROM request_data"
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
