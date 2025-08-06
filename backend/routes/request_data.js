const express = require("express");
const multer = require("multer");
const moment = require("moment-timezone");
const pool = require("../src/db");
const { authenticateToken, authorizeRole }  = require("../src/authMiddleware");
const router = express.Router();
const { sendMail, sendStatusUpdateMail } = require("../routes/sendMailer");

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    console.log('File being uploaded:', {
      fieldname: file.fieldname,
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size
    });
    
    if (file.fieldname === 'fileSurat') {
      if (file.mimetype === 'application/pdf') {
        cb(null, true);
      } else {
        cb(new Error('File surat harus berupa PDF'), false);
      }
    } else if (file.fieldname === 'foto') {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Foto harus berupa file gambar'), false);
      }
    } else {
      cb(null, true);
    }
  }
});

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
  authenticateToken,
  upload.fields([{ name: "fileSurat" }, { name: "foto" }]),
  async (req, res) => {
    console.log("=== SUBMIT REQUEST DEBUG ===");
    console.log("Headers:", req.headers);
    console.log("Body:", req.body);
    console.log("Files:", req.files);
    console.log("User from token:", req.user);

    try {
      // Validasi user dari token
      if (!req.user || !req.user.id || !req.user.email || !req.user.username) {
        console.error("Invalid user data from token:", req.user);
        return res.status(401).json({ error: "Invalid authentication data" });
      }

      const {
        nama,
        alamat,
        noHp,
        noWhatsapp,
        permintaan,
        detailPermintaan,
        lokasi,
        keterangan = "", // Default empty string jika tidak ada
      } = req.body;

      // Validasi required fields
      const requiredFields = { nama, alamat, noHp, noWhatsapp, permintaan, detailPermintaan, lokasi };
      const missingFields = Object.entries(requiredFields)
        .filter(([key, value]) => !value || value.trim() === "")
        .map(([key]) => key);

      if (missingFields.length > 0) {
        console.error("Missing required fields:", missingFields);
        return res.status(400).json({ 
          error: "Missing required fields", 
          missingFields 
        });
      }

      const fileSurat = req.files && req.files["fileSurat"] 
        ? req.files["fileSurat"][0].buffer 
        : null;

      const foto = req.files && req.files["foto"] 
        ? req.files["foto"][0].buffer 
        : null;

      // Validasi file surat (required)
      if (!fileSurat) {
        console.error("File surat is required but not provided");
        return res.status(400).json({ error: "File surat pengajuan harus diupload" });
      }

      const date = moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss");
      console.log("Formatted date:", date);

      // Ambil data user dari token
      const userId = req.user.id;
      const email = req.user.email;
      const username = req.user.username;

      console.log("User data:", { userId, email, username });

      // Test database connection
      console.log("Testing database connection...");
      await pool.query("SELECT 1");
      console.log("Database connection OK");

      // Simpan ke database dengan error handling yang lebih detail
      console.log("Inserting data to database...");
      const insertQuery = `
        INSERT INTO request_data (
          id_user, nama, alamat, no_whatsapp, no_hp, permintaan, detail_permintaan, lokasi, surat, foto, status, date, keterangan
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Verifikasi', ?, ?)
      `;
      
      const insertValues = [
        userId,
        nama.trim(),
        alamat.trim(),
        noWhatsapp.trim(),
        noHp.trim(),
        permintaan,
        detailPermintaan.trim(),
        lokasi.trim(),
        fileSurat,
        foto,
        date,
        keterangan.trim(),
      ];

      console.log("Insert values:", insertValues.map((val, index) => 
        val instanceof Buffer ? `Buffer(${val.length} bytes)` : val
      ));

      const [result] = await pool.query(insertQuery, insertValues);
      console.log("Database insert result:", result);

      // Kirim email dengan error handling
      console.log("Sending email notification...");
try {
  console.log("=== EMAIL DEBUG START ===");
  console.log("Email recipient:", email);
  console.log("Username:", username);
  console.log("Timestamp:", new Date().toISOString());
  
  // Cek parameter yang dikirim ke sendMail
  if (!email) {
    console.error("❌ Email parameter is null/undefined");
    throw new Error("Email recipient tidak valid");
  }
  
  if (!username) {
    console.error("❌ Username parameter is null/undefined");
    throw new Error("Username tidak valid");
  }
  
  console.log("Calling sendMail function...");
  await sendMail(email, username);
  
  console.log("✅ Email sent successfully");
  console.log("=== EMAIL DEBUG END ===");
  
  res.status(200).json({
    message: "Data berhasil dikirim dan email notifikasi telah dikirim",
    reportId: result.insertId
  });
  
} catch (emailError) {
  console.error("=== EMAIL ERROR DETAILS ===");
  console.error("Error Type:", emailError.constructor.name);
  console.error("Error Message:", emailError.message);
  console.error("Error Code:", emailError.code);
  console.error("Error Stack:", emailError.stack);
  
  // Jika ada response dari SMTP server
  if (emailError.response) {
    console.error("SMTP Response:", emailError.response);
  }
  
  // Jika ada responseCode
  if (emailError.responseCode) {
    console.error("SMTP Response Code:", emailError.responseCode);
  }
  
  // Analisis error berdasarkan tipe
  if (emailError.code === 'EAUTH') {
    console.error("🔧 SOLUSI: Authentication failed");
    console.error("   - Cek EMAIL_USER dan EMAIL_PASS di .env");
    console.error("   - Untuk Gmail: gunakan App Password");
  } else if (emailError.code === 'ECONNECTION') {
    console.error("🔧 SOLUSI: Connection failed");
    console.error("   - Cek koneksi internet");
    console.error("   - Cek firewall port 587/465");
  } else if (emailError.code === 'ETIMEDOUT') {
    console.error("🔧 SOLUSI: Connection timeout");
    console.error("   - Network issue atau port diblokir");
  } else if (emailError.code === 'ENOTFOUND') {
    console.error("🔧 SOLUSI: SMTP host not found");
    console.error("   - Cek EMAIL_HOST setting");
  }
  
  console.error("===============================");

  res.status(200).json({
    message: "Data berhasil dikirim",
    warning: "Email notifikasi gagal dikirim, tapi laporan sudah tersimpan",
    reportId: result.insertId,
    // Tambahkan info error untuk debugging (hanya di development)
    ...(process.env.NODE_ENV === 'development' && {
      errorDetails: {
        message: emailError.message,
        code: emailError.code
      }
    })
  });
}


    } catch (error) {
      console.error("=== SUBMIT ERROR ===");
      console.error("Error type:", error.constructor.name);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
      console.error("Error code:", error.code);
      console.error("Error errno:", error.errno);
      
      // Handle different types of errors
      if (error.code === 'ER_NO_SUCH_TABLE') {
        return res.status(500).json({ 
          error: "Database table not found. Please check database structure.",
          details: error.message 
        });
      }
      
      if (error.code === 'ER_BAD_FIELD_ERROR') {
        return res.status(500).json({ 
          error: "Database field error. Please check column names.",
          details: error.message 
        });
      }
      
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ 
          error: "File terlalu besar. Maksimal 10MB per file.",
          details: error.message 
        });
      }
      
      if (error.message.includes('File surat harus berupa PDF')) {
        return res.status(400).json({ 
          error: "File surat harus berupa PDF",
          details: error.message 
        });
      }
      
      if (error.message.includes('Foto harus berupa file gambar')) {
        return res.status(400).json({ 
          error: "Foto harus berupa file gambar",
          details: error.message 
        });
      }

      // Generic server error
      res.status(500).json({ 
        error: "Server error", 
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

router.put("/update-status/:id", authenticateToken, authorizeRole(['Admin']), async (req, res) => {
  const { id } = req.params;
  const { status, keterangan } = req.body;

  try {
    // Update status di database
    await pool.query(
      "UPDATE request_data SET status = ?, keterangan = ? WHERE id = ?",
      [status, keterangan, id]
    );

    // Ambil data user untuk mengirim email
    const [reportData] = await pool.query(`
      SELECT rd.*, u.email, u.username 
      FROM request_data rd 
      JOIN users u ON rd.id_user = u.id 
      WHERE rd.id = ?
    `, [id]);

    if (reportData.length > 0) {
      const { email, username } = reportData[0];
      
      // Kirim email update status
      await sendStatusUpdateMail(email, username, status, keterangan);
    }

    res.status(200).json({ message: "Status updated and email notification sent successfully" });
  } catch (error) {
    console.error("Error updating status:", error);
    res.status(500).json({ error: "Server error" });
  }
});

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