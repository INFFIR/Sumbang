const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const pool = require("../src/db");
const authenticateToken = require("../src/authMiddleware");

const router = express.Router();
const saltRounds = 10;

const generateUserId = () => {
  const randomDigits = Math.floor(Math.random() * 1000);
  const paddedDigits = String(randomDigits).padStart(3, '0');
  return `5${paddedDigits}`;
};

router.get("/manage-users", authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT id, username, password FROM users");
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/manage-users", authenticateToken, async (req, res) => {
  const { username, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const userId = generateUserId();

    const [result] = await pool.query(
      "INSERT INTO users (id, username, password) VALUES (?, ?, ?)",
      [userId, username, hashedPassword]
    );

    res.status(201).json({ id: userId, username, password: hashedPassword });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

router.put("/manage-users/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { username, password } = req.body;

  try {
    let hashedPassword = password;
    if (password) {
      hashedPassword = await bcrypt.hash(password, saltRounds);
    }

    const [result] = await pool.query(
      "UPDATE users SET username = ?, password = ? WHERE id = ?",
      [username, hashedPassword, id]
    );
    if (result.affectedRows === 0)
      return res.status(404).json({ error: "User not found" });
    res.json({ id, username, password: hashedPassword });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

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
