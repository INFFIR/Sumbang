const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const pool = require("../src/db");
const { authenticateToken, authorizeRole }  = require("../src/authMiddleware");

const router = express.Router();
const saltRounds = 10;

const generateUserId = () => {
  const randomDigits = Math.floor(Math.random() * 1000);
  const paddedDigits = String(randomDigits).padStart(3, '0');
  return `5${paddedDigits}`;
};

// app.get('/manage-users', authenticateToken, authorizeRole('Admin'), (req, res) => {
//   res.json({ message: 'Welcome, admin' });
// });

// GET: ambil semua user dengan kolom lengkap
router.get("/manage-users", authenticateToken, authorizeRole('Admin'), async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT id, username, email, role FROM users");
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// POST: tambah user baru dengan email dan role
router.post("/manage-users", authenticateToken, async (req, res) => {
  const { username, email, password, role } = req.body;

  if (!username || !email || !password ) {
    return res.status(400).json({ error: "Semua field (username, email, password, role) harus diisi." });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const userId = generateUserId();

    const [result] = await pool.query(
      "INSERT INTO users (id, username, email, password, role) VALUES (?, ?, ?, ?, ?)",
      [userId, username, email, hashedPassword, "Admin"]
    );

    res.status(201).json({ id: userId, username, email, role });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// PUT: update data user termasuk email dan role
router.put("/manage-users/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { username, email, password, role } = req.body;

  try {
    let hashedPassword = password;
    if (password) {
      hashedPassword = await bcrypt.hash(password, saltRounds);
    }

    const [result] = await pool.query(
      "UPDATE users SET username = ?, email = ?, password = ?, role = ? WHERE id = ?",
      [username, email, hashedPassword, role, id]
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ error: "User not found" });

    res.json({ id, username, email, role });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// DELETE: hapus user
router.delete("/manage-users/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query("DELETE FROM users WHERE id = ?", [id]);
    if (result.affectedRows === 0)
      return res.status(404).json({ error: "User not found" });
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
