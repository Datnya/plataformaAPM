"use client";

import { useState } from "react";

export default function AdminNuevoUsuario() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("CONSULTOR");
  
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ text: "", type: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !role) return;

    setLoading(true);
    setMsg({ text: "", type: "" });

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error);
      
      setMsg({ text: "✅ Usuario creado exitosamente.", type: "success" });
      setName("");
      setEmail("");
      setPassword("");
      setRole("CONSULTOR");
    } catch (err: any) {
      setMsg({ text: "⚠️ " + err.message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Crear Nuevo Usuario</h1>
        <p className="text-sm text-text-muted mt-1">
          Registra un nuevo consultor, cliente o administrador en la plataforma.
        </p>
      </div>

      <div className="card max-w-2xl animate-scale-in">
        {msg.text && (
          <div className={`p-3 rounded-lg text-sm font-semibold mb-6 ${
            msg.type === "error" ? "bg-danger/10 text-danger border border-danger/20" : "bg-success/10 text-success border border-success/30"
          }`}>
            {msg.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1.5">Nombre Completo</label>
            <input required type="text" className="input-field" placeholder="Ej: Diana Pérez" value={name} onChange={e => setName(e.target.value)} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Correo Corporativo</label>
            <input required type="email" className="input-field" placeholder="diana@apmgroup.pe" value={email} onChange={e => setEmail(e.target.value)} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Contraseña Temporal</label>
            <input required type="password" className="input-field" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Rol de Sistema</label>
            <select className="input-field" value={role} onChange={e => setRole(e.target.value)}>
              <option value="ADMIN">Administrador</option>
              <option value="CONSULTOR">Consultor</option>
              <option value="CLIENTE">Cliente</option>
            </select>
          </div>

          <div className="pt-4 border-t border-border">
            <button disabled={loading} type="submit" className="btn-primary w-full sm:w-auto px-8 py-3">
              {loading ? "Creando..." : "Crear Usuario"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
