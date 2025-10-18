import express from "express";
import cors from "cors";
import sqlite3 from "sqlite3";
import bcrypt from "bcryptjs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); // login.html va register.html uchun

// SQLite ulanish
const db = new sqlite3.Database("users.db", (err) => {
  if (err) console.error(err.message);
  else console.log("✅ SQLite3 bazasi ulandi");
});

// jadval yaratish
db.run(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  email TEXT UNIQUE,
  password TEXT
)
`);

// 🔹 Ro‘yxatdan o‘tish
app.post("/register", (req, res) => {
  const { name, email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "Email va parol kerak" });

  const hash = bcrypt.hashSync(password, 10);
  db.run(
    "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
    [name, email, hash],
    (err) => {
      if (err) return res.status(400).json({ error: "Email allaqachon mavjud" });
      res.json({ success: true });
    }
  );
});

// 🔹 Kirish
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  db.get("SELECT * FROM users WHERE email = ?", [email], (err, row) => {
    if (err) return res.status(500).json({ error: "Server xatosi" });
    if (!row) return res.status(400).json({ error: "Foydalanuvchi topilmadi" });

    const valid = bcrypt.compareSync(password, row.password);
    if (!valid) return res.status(400).json({ error: "Noto‘g‘ri parol" });

    res.json({ success: true, message: `Xush kelibsiz, ${row.name || row.email}` });
  });
});

app.listen(5000, () => console.log("🚀 Server http://localhost:5000 da ishlayapti"));
