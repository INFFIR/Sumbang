const express = require("express");
const pool = require("../src/db");
const authenticateToken = require("../src/authMiddleware");
const moment = require("moment-timezone");
const multer = require("multer");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// --- GET All Content (Public) ---
router.get("/manage/content", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, title, description, TO_BASE64(media) as media, url FROM content"
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// --- GET All Services (Public) ---
router.get("/manage/service", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, title, description FROM service"
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// --- CREATE Content ---
router.post("/manage/content/create", authenticateToken, upload.single("media"), async (req, res) => {
  const { title, description, url } = req.body;
  const media = req.file ? req.file.buffer : null;

  if (!title && !description && !media && !url) {
    return res.status(400).json({ error: "Minimal satu field harus diisi" });
  }

  if (media && url) {
    return res.status(400).json({ error: "Hanya salah satu dari media atau url yang boleh diisi" });
  }

  try {
    await pool.query(
      "INSERT INTO content (title, description, media, url) VALUES (?, ?, ?, ?)",
      [title || null, description || null, media, url || null]
    );
    res.status(200).json({ message: "Content berhasil ditambahkan" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// --- CREATE Service ---
router.post("/manage/service/create", authenticateToken, async (req, res) => {
  const { title, description } = req.body;
  if (!title && !description) return res.status(400).json({ error: "Minimal satu field harus diisi" });

  try {
    await pool.query("INSERT INTO service (title, description) VALUES (?, ?)", [title || null, description || null]);
    res.status(200).json({ message: "Service berhasil ditambahkan" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// --- EDIT Content ---
router.post("/manage/content/edit/:id", authenticateToken, upload.single("media"), async (req, res) => {
  const { title, description, url } = req.body;
  const media = req.file ? req.file.buffer : null;
  const { id } = req.params;

  if (media && url) {
    return res.status(400).json({ error: "Hanya salah satu dari media atau url yang boleh diisi" });
  }

  try {
    let query = "UPDATE content SET title = ?, description = ?, media = ?, url = ? WHERE id = ?";
    let mediaValue = media || null;
    let urlValue = url || null;

    if (media) urlValue = null;
    if (url) mediaValue = null;

    await pool.query(query, [title || null, description || null, mediaValue, urlValue, id]);
    res.status(200).json({ message: "Content berhasil diubah" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// --- EDIT Service ---
router.post("/manage/service/edit/:id", authenticateToken, async (req, res) => {
  const { title, description } = req.body;
  const { id } = req.params;

  try {
    await pool.query("UPDATE service SET title = ?, description = ? WHERE id = ?", [title || null, description || null, id]);
    res.status(200).json({ message: "Service berhasil diubah" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// --- DELETE Content ---
router.post("/manage/content/delete/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM content WHERE id = ?", [id]);
    res.status(200).json({ message: "Content berhasil dihapus" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// --- DELETE Service ---
router.post("/manage/service/delete/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM service WHERE id = ?", [id]);
    res.status(200).json({ message: "Service berhasil dihapus" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
