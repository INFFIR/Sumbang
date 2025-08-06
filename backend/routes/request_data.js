const express = require("express");
const multer = require("multer");
const moment = require("moment-timezone");
const pool = require("../src/db");
const { authenticateToken, authorizeRole }  = require("../src/authMiddleware");
const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get("/data", authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, nama, no_hp, lokasi, status, date, keterangan FROM request_data WHERE status != 'Deleted'"
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});


// router.get("/user", authenticateToken, async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const [rows] = await pool.query("SELECT id FROM users WHERE id = ?", [userId]);
//     if (rows.length > 0) {
//       res.json(rows[0]);
//     } else {
//       res.status(404).json({ error: "User not found" });
//     }
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Server error" });
//   }
// });

router.post(
  "/submit",
  authenticateToken,  // Pastikan pengguna sudah terautentikasi
  upload.fields([{ name: "fileSurat" }, { name: "foto" }]),
  async (req, res) => {
    const {
      nama,
      alamat,
      noHp,
      noWhatsapp,
      permintaan,
      detailPermintaan,
      lokasi,
      keterangan,
    } = req.body;

    // Ambil ID user dari request yang sudah terautentikasi
    const idUser = req.user.id;

    const fileSurat = req.files["fileSurat"]
      ? req.files["fileSurat"][0].buffer
      : null;
    const foto = req.files["foto"] ? req.files["foto"][0].buffer : null;

    const date = moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss");

    try {
      await pool.query(
        `INSERT INTO request_data (
          nama, alamat, no_whatsapp, no_hp, permintaan, detail_permintaan, lokasi, surat, foto, status, date, keterangan, id_user
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Verifikasi', ?, ?, ?)`,
        [
          nama,
          alamat,
          noWhatsapp,
          noHp,
          permintaan,
          detailPermintaan,
          lokasi,
          fileSurat,
          foto,
          date,
          keterangan,
          idUser,  // Masukkan ID user yang sudah login
        ]
      );
      res.status(200).json({ message: "Data submitted successfully" });
    } catch (error) {
      console.error(error); 
      res.status(500).json({ error: "Server error" });
    }   
  }
);


// router.put("/update-keterangan/:id", authenticateToken, async (req, res) => {
//   const { id } = req.params;
//   const { keterangan } = req.body;

//   try {
//     await pool.query(
//       "UPDATE request_data SET keterangan = ? WHERE id = ?",
//       [keterangan, id]
//     );
//     res.status(200).json({ message: "Keterangan updated successfully" });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Server error" });
//   }
// });


module.exports = router;