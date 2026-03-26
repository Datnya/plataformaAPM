const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');

async function main() {
  const db = new sqlite3.Database('./prisma/dev.db');
  const password = await bcrypt.hash("Brendilu7700", 10);
  const email = "dmonzon@apmgroup.pe";
  const name = "Diana Monzón";
  const role = "ADMIN";
  const status = "ACTIVO";
  const id = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15);

  db.get("SELECT id FROM users WHERE email = ?", [email], (err, row) => {
    if (err) return console.error(err);
    if (row) {
      db.run("UPDATE users SET password = ?, role = ?, status = ? WHERE email = ?", [password, role, status, email], (err) => {
        if (err) return console.error(err);
        console.log("Admin actualizado correctamente.");
      });
    } else {
      db.run("INSERT INTO users (id, name, email, password, role, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))", 
        [id, name, email, password, role, status], 
        (err) => {
        if (err) return console.error(err);
        console.log("Admin creado correctamente.");
      });
    }
  });
}
main();
