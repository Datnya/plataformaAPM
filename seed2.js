const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');

async function main() {
  const db = new sqlite3.Database('./prisma/dev.db');
  
  // All have the same password for testing
  const hashPass = await bcrypt.hash("Brendilu7700", 10);
  
  // 1. Update existing admin
  db.run("UPDATE users SET name = ?, password = ? WHERE email = ?", ["Datnya", hashPass, "dmonzon@apmgroup.pe"]);

  // 2. Insert Consultor (Ignore Unique constraint errors if already exists)
  const consultorId = Math.random().toString(36).substring(2, 15);
  db.run("INSERT OR REPLACE INTO users (id, name, email, password, role, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))", 
        [consultorId, "Tatiana", "datnyamonzon1@gmail.com", hashPass, "CONSULTOR", "ACTIVO"]);

  // 3. Insert Cliente
  const clientId = Math.random().toString(36).substring(2, 15);
  db.run("INSERT OR REPLACE INTO users (id, name, email, password, role, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))", 
        [clientId, "Logra Consulting", "consultas@lograconsulting.com", hashPass, "CLIENTE", "ACTIVO"]);
        
  console.log("Usuarios semilla procesados.");
}
main();
