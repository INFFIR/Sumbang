const express = require("express");
const router = express.Router();
const { sendMail } = require("./sendMailer"); // Import the function properly

router.post('/send-email', async (req, res) => {
  const { email, username } = req.body;

  if (!email || !username) {
    return res.status(400).json({ message: "Email dan username tidak ditemukan." });
  }

  try {
    // Use the sendMail function from sendMailer.js
    await sendMail(email, username);
    return res.status(200).json({ message: "Email terkirim." });
  } catch (error) {
    console.error("Gagal mengirim email:", error);
    return res.status(500).json({ 
      message: "Gagal mengirim email.", 
      error: error.message 
    });
  }
});

module.exports = router;