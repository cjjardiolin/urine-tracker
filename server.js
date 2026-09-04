const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const app = express();
const PORT = 5001;

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

const db = new sqlite3.Database("./data/urine.db");

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient TEXT NOT NULL,
      volume INTEGER NOT NULL,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

app.get("/", (req, res) => {
  db.all(
    "SELECT * FROM records ORDER BY created_at DESC",
    [],
    (err, rows) => {
      if (err) {
        return res.send(err.message);
      }

      const total = rows.reduce((a, b) => a + b.volume, 0);

      res.render("index", {
        records: rows,
        total
      });
    }
  );
});

app.post("/add", (req, res) => {
  const { patient, volume, notes } = req.body;

  db.run(
    `INSERT INTO records(patient, volume, notes)
     VALUES (?, ?, ?)`,
    [patient, volume, notes],
    () => {
      res.redirect("/");
    }
  );
});

app.post("/delete/:id", (req, res) => {
  db.run(
    "DELETE FROM records WHERE id = ?",
    [req.params.id],
    () => {
      res.redirect("/");
    }
  );
});

app.listen(PORT, () => {
  console.log(`Running on port ${PORT}`);
});
