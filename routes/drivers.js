const express = require("express");
const db = require("../db");

const router = express.Router();

router.get("/", (req, res) => {
  const drivers = db.prepare("SELECT * FROM drivers WHERE active = 1").all();
  res.json(drivers);
});

router.post("/", (req, res) => {
  const { name, phone } = req.body;
  if (!name || !phone) return res.status(400).json({ error: "name ak phone obligatwa" });

  const result = db.prepare("INSERT INTO drivers (name, phone) VALUES (?, ?)").run(name, phone);
  const driver = db.prepare("SELECT * FROM drivers WHERE id = ?").get(result.lastInsertRowid);
  res.status(201).json(driver);
});

router.patch("/:id", (req, res) => {
  const { active } = req.body;
  db.prepare("UPDATE drivers SET active = ? WHERE id = ?").run(active ? 1 : 0, req.params.id);
  const driver = db.prepare("SELECT * FROM drivers WHERE id = ?").get(req.params.id);
  if (!driver) return res.status(404).json({ error: "Chofè pa jwenn" });
  res.json(driver);
});

module.exports = router;
