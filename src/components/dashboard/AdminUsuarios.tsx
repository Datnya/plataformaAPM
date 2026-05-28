"use client";

import { useEffect, useState } from "react";
import { Frown, Eye, EyeOff } from "lucide-react";

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
}

export default function AdminUsuarios() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState("TODOS");

  // Edit modal states
  const [editId, setEditId] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState("CLIENTE");
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [editError, setEditError] = useState("");
  const [showEditPass, setShowEditPass] = useState(false);

  // Add-new-user modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [addName, setAddName] = useState("");
  const [addEmail, setAddEmail] = useState("");
  const [addPassword, setAddPassword] = useState("");
  const [addRole, setAddRole] = useState("CONSULTOR");
  const [addLoading, setAddLoading] = useState(false);
  const [addMsg, setAddMsg] = useState({ text: "", type: "" });
  const [showAddPass, setShowAddPass] = useState(false);

  // Delete states
  const [delError, setDelError] = useState("");
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (res.ok && Array.isArray(data)) {
        setUsers(data);
      } else {
        setUsers([]);
        console.error("API error:", data.error || data);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openEditModal = (user: UserData) => {
    setEditId(user.id);
    setNewName(user.name);
    setNewEmail(user.email);
    setNewRole(user.role);
    setNewPassword("");
    setSaved(false);
    setEditError("");
  };

  const handleStatusToggle = async (userId: string, currentStatus: string) => {
    const nextStatus = currentStatus === "ACTIVO" ? "INACTIVO" : "ACTIVO";
    await fetch(`/api/admin/users/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus })
    });
    fetchUsers();
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editId || !newName || !newEmail) return;

    setSaving(true);
    setEditError("");

    try {
      const payload: any = { name: newName, email: newEmail, role: newRole };
      if (newPassword) payload.password = newPassword;

      const res = await fetch(`/api/admin/users/${editId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Error al guardar");
      }

      // Update local state directly — NO reload needed
      setUsers(prev =>
        prev.map(u => u.id === editId ? { ...u, name: newName, email: newEmail, role: newRole } : u)
      );

      setSaving(false);
      setSaved(true);

      setTimeout(() => {
        setEditId(null);
        setNewName("");
        setNewEmail("");
        setNewRole("CLIENTE");
        setNewPassword("");
        setSaved(false);
      }, 1200);
    } catch (err: any) {
      setSaving(false);
      setEditError(err.message || "Error inesperado");
      setTimeout(() => setEditError(""), 4000);
    }
  };

  const handleDeleteClick = (userId: string) => {
    setPendingDeleteId(userId);
  };

  const confirmDelete = async () => {
    if (!pendingDeleteId) return;
    setDelError("");

    const res = await fetch(`/api/admin/users/${pendingDeleteId}`, { method: "DELETE" });
    const data = await res.json();

    if (!data.success) {
      setDelError("Error: " + data.error);
      setTimeout(() => setDelError(""), 4000);
    } else {
      fetchUsers();
    }
    setPendingDeleteId(null);
  };

  // --- Add new user handler ---
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addName || !addEmail || !addPassword || !addRole) return;

    setAddLoading(true);
    setAddMsg({ text: "", type: "" });

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: addName, email: addEmail, password: addPassword, role: addRole })
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      setAddMsg({ text: "✅ Usuario creado exitosamente.", type: "success" });
      setAddName("");
      setAddEmail("");
      setAddPassword("");
      setAddRole("CONSULTOR");

      // Refresh user list
      fetchUsers();

      // Auto-close modal after 1.5s
      setTimeout(() => {
        setShowAddModal(false);
        setAddMsg({ text: "", type: "" });
      }, 1500);
    } catch (err: any) {
      setAddMsg({ text: "⚠️ " + err.message, type: "error" });
    } finally {
      setAddLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in relative">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Gestión de Usuarios</h1>
          <p className="text-text-muted text-sm mt-1">Administra permisos y accesos directos</p>
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={roleFilter} 
            onChange={(e) => setRoleFilter(e.target.value)} 
            className="input-field py-2.5 text-sm cursor-pointer border-border focus:border-primary w-full sm:w-auto"
          >
            <option value="TODOS">Todos los roles</option>
            <option value="ADMIN">Administradores</option>
            <option value="CONSULTOR">Consultores</option>
            <option value="ESPECIALISTA">Especialistas</option>
            <option value="CLIENTE">Clientes</option>
          </select>
          <button onClick={() => { setShowAddModal(true); setAddMsg({ text: "", type: "" }); }} className="btn-primary flex items-center gap-2 py-2.5">
            <span>+</span>
            <span>Nuevo Usuario</span>
          </button>
        </div>
      </div>

      {delError && (
        <div className="bg-danger/10 text-danger border border-danger/20 p-3 rounded-lg text-sm font-semibold animate-scale-in">
          {delError}
        </div>
      )}

      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-text-muted">Cargando usuarios...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface">
                  <th className="text-left py-3 px-4 font-semibold text-text-muted">Nombre y Rol</th>
                  <th className="text-left py-3 px-4 font-semibold text-text-muted">Correo</th>
                  <th className="text-center py-3 px-4 font-semibold text-text-muted">Estado</th>
                  <th className="text-right py-3 px-4 font-semibold text-text-muted">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users.filter(u => roleFilter === "TODOS" || u.role === roleFilter).map(user => (
                  <tr key={user.id} className="border-b border-border-light hover:bg-surface/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-foreground">{user.name}</div>
                      <div className={`text-[10px] uppercase font-bold mt-0.5 inline-block px-2 rounded-full ${
                        user.role === "ADMIN" ? "bg-danger/10 text-danger" :
                        user.role === "CONSULTOR" ? "bg-info/10 text-info" :
                        user.role === "ESPECIALISTA" ? "bg-warning/10 text-warning" : "bg-success/10 text-success"
                      }`}>
                        {user.role}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-text-muted font-medium">
                      {user.email}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleStatusToggle(user.id, user.status)}
                        className={`text-xs font-bold px-3 py-1 rounded-full transition-colors border ${
                          user.status === "ACTIVO"
                            ? "bg-success/5 border-success/30 text-success hover:bg-success/10"
                            : "bg-text-light/10 border-text-light/30 text-text-muted hover:bg-text-light/20"
                        }`}
                      >
                        {user.status === "ACTIVO" ? "✓ ACTIVO" : "✖  INACTIVO"}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                       <button onClick={() => openEditModal(user)} className="text-text-muted hover:text-info bg-surface font-semibold text-xs px-2 py-1 rounded-md border border-border">
                         Editar
                       </button>
                       <button onClick={() => handleDeleteClick(user.id)} className="text-danger hover:text-white hover:bg-danger bg-danger/10 font-semibold text-xs px-2 py-1 rounded-md border border-danger/20 transition-all">
                         Borrar
                       </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ========== EDIT USER MODAL ========== */}
      {editId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 min-h-screen" onClick={() => setEditId(null)}>
          <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-sm max-h-[90vh] overflow-y-auto animate-scale-in" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4">Editar Usuario</h3>

            {editError && (
              <div className="bg-danger/10 text-danger border border-danger/20 p-3 rounded mb-4 text-center text-sm">
                {editError}
              </div>
            )}

            <form onSubmit={handleEditUser} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1">Nombre Completo</label>
                <input required type="text" placeholder="Ej: Juan Pérez" value={newName} onChange={e => setNewName(e.target.value)} className="input-field" />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Correo Electrónico</label>
                <input required type="email" placeholder="correo@ejemplo.com" value={newEmail} onChange={e => setNewEmail(e.target.value)} className="input-field" />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Rol de Sistema</label>
                <select className="input-field" value={newRole} onChange={e => setNewRole(e.target.value)}>
                  <option value="ADMIN">Administrador</option>
                  <option value="CONSULTOR">Consultor</option>
                  <option value="ESPECIALISTA">Especialista</option>
                  <option value="CLIENTE">Cliente</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Contraseña (opcional)</label>
                <div className="relative">
                  <input 
                    type={showEditPass ? "text" : "password"} 
                    placeholder="Nueva contraseña o dejar en blanco" 
                    value={newPassword} 
                    onChange={e => setNewPassword(e.target.value)} 
                    className="input-field w-full pr-10" 
                  />
                  <button
                    type="button"
                    onClick={() => setShowEditPass(!showEditPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-foreground transition-colors"
                  >
                    {showEditPass ? <Eye size={18} /> : <EyeOff size={18} />}
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setEditId(null)} className="btn-secondary w-full py-2" disabled={saving || saved}>Cancelar</button>
                <button type="submit" disabled={saving || saved} className={`btn-primary w-full py-2 transition-all ${saved ? "bg-success hover:bg-success border-success text-white" : ""}`}>
                  {saving ? "Guardando..." : saved ? "¡Guardado!" : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========== ADD NEW USER MODAL ========== */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 min-h-screen" onClick={() => setShowAddModal(false)}>
          <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold">Crear Nuevo Usuario</h3>
              <button onClick={() => setShowAddModal(false)} className="text-text-muted hover:text-foreground text-xl">✕</button>
            </div>

            {addMsg.text && (
              <div className={`p-3 rounded-lg text-sm font-semibold mb-4 ${
                addMsg.type === "error" ? "bg-danger/10 text-danger border border-danger/20" : "bg-success/10 text-success border border-success/30"
              }`}>
                {addMsg.text}
              </div>
            )}

            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Nombre Completo</label>
                <input required type="text" className="input-field" placeholder="Ej: Diana Pérez" value={addName} onChange={e => setAddName(e.target.value)} />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Correo Corporativo</label>
                <input required type="email" className="input-field" placeholder="diana@apmgroup.pe" value={addEmail} onChange={e => setAddEmail(e.target.value)} />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Contraseña Temporal</label>
                <div className="relative">
                  <input 
                    required 
                    type={showAddPass ? "text" : "password"} 
                    className="input-field w-full pr-10" 
                    placeholder="••••••••" 
                    value={addPassword} 
                    onChange={e => setAddPassword(e.target.value)} 
                  />
                  <button
                    type="button"
                    onClick={() => setShowAddPass(!showAddPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-foreground transition-colors"
                  >
                    {showAddPass ? <Eye size={18} /> : <EyeOff size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Rol de Sistema</label>
                <select className="input-field" value={addRole} onChange={e => setAddRole(e.target.value)}>
                  <option value="ADMIN">Administrador</option>
                  <option value="CONSULTOR">Consultor</option>
                  <option value="ESPECIALISTA">Especialista</option>
                  <option value="CLIENTE">Cliente</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary flex-1 py-2">
                  Cancelar
                </button>
                <button disabled={addLoading} type="submit" className="btn-primary flex-1 py-2">
                  {addLoading ? "Creando..." : "Crear Usuario"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ========== DELETE CONFIRMATION MODAL ========== */}
      {pendingDeleteId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 min-h-screen" onClick={() => setPendingDeleteId(null)}>
          <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-sm text-center animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="mx-auto flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
              <Frown size={32} className="text-primary" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">¿Eliminar Usuario?</h3>
            <p className="text-text-muted text-sm mb-8 px-2">
              ¿Estás seguro que deseas eliminar este usuario? Esta acción no se puede deshacer y perderá el acceso a la plataforma.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setPendingDeleteId(null)} 
                className="flex-1 py-3 text-sm font-bold text-text-muted bg-surface hover:bg-border/50 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={confirmDelete} 
                className="flex-1 py-3 text-sm font-bold text-white bg-primary hover:bg-primary-hover rounded-xl shadow-lg shadow-primary/30 transition-all"
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
