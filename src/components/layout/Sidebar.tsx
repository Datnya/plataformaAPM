"use client";

import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { navItems } from "@/lib/nav-items";
import { LogOut } from "lucide-react";
import { LOGO_WHITE_PATH } from "@/lib/constants";

export default function Sidebar() {
  const { userRole, currentView, setCurrentView, logout } = useAuth();

  const filteredItems = navItems.filter((item) =>
    item.roles.includes(userRole)
  );

  return (
    <aside
      className="fixed top-0 left-0 bottom-0 w-[var(--sidebar-width)] flex-col z-40 transition-transform duration-300 hidden md:flex"
      style={{ background: "#0a0a0a" }}
    >
      {/* Logo */}
      <div className="flex items-center justify-center py-5 px-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <Image
          src={LOGO_WHITE_PATH}
          alt="APM Group Logo"
          width={140}
          height={45}
          className="object-contain"
          priority
        />
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <p className="text-[10px] uppercase tracking-widest font-semibold px-3 mb-3" style={{ color: "rgba(255,255,255,0.35)" }}>
          Navegación
        </p>
        <ul className="space-y-1">
          {filteredItems.map((item) => {
            const isActive = currentView === item.view;

            return (
              <li key={item.view + item.label}>
                <button
                  onClick={() => setCurrentView(item.view)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 text-left"
                  style={{
                    background: isActive ? "rgba(180,195,7,0.15)" : "transparent",
                    color: isActive ? "#b4c307" : "rgba(255,255,255,0.7)",
                    fontWeight: isActive ? 600 : 500,
                    border: "none",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                      e.currentTarget.style.color = "rgba(255,255,255,0.95)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color = "rgba(255,255,255,0.7)";
                    }
                  }}
                >
                  <span className="flex-shrink-0" style={{ color: isActive ? "#b4c307" : "rgba(255,255,255,0.5)" }}>{item.icon}</span>
                  <span>{item.label}</span>
                  {isActive && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: "#b4c307" }} />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom */}
      <div className="p-4" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
          style={{ color: "#ef4444", background: "transparent", border: "none", cursor: "pointer" }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(239,68,68,0.08)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
        >
          <LogOut size={18} strokeWidth={1.8} />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
}
