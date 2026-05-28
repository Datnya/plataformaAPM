"use client";

import { useState } from "react";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { navItems } from "@/lib/nav-items";
import { LogOut, Menu, X } from "lucide-react";
import { LOGO_WHITE_PATH } from "@/lib/constants";

export default function MobileSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const { userRole, currentView, setCurrentView, logout } = useAuth();
  const filteredItems = navItems.filter((item) => item.roles.includes(userRole));

  return (
    <>
      {/* Hamburger button — visible only on mobile */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-[18px] left-4 z-[60] md:hidden w-9 h-9 flex items-center justify-center rounded-lg bg-white border border-border shadow-sm"
        aria-label="Abrir menú"
      >
        <Menu size={20} strokeWidth={1.8} />
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-[70] md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Slide-in sidebar */}
      <aside
        className={`fixed top-0 left-0 bottom-0 w-72 z-[80] transform transition-transform duration-300 md:hidden`}
        style={{
          background: "#0a0a0a",
          transform: isOpen ? "translateX(0)" : "translateX(-100%)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <Image
            src={LOGO_WHITE_PATH}
            alt="APM Group Logo"
            width={110}
            height={36}
            className="object-contain"
          />
          <button onClick={() => setIsOpen(false)} style={{ color: "rgba(255,255,255,0.6)", background: "none", border: "none", cursor: "pointer" }}>
            <X size={20} strokeWidth={1.8} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <ul className="space-y-1">
            {filteredItems.map((item) => {
              const isActive = currentView === item.view;
              return (
                <li key={item.view + item.label}>
                  <button
                    onClick={() => {
                      setCurrentView(item.view);
                      setIsOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left"
                    style={{
                      background: isActive ? "rgba(180,195,7,0.15)" : "transparent",
                      color: isActive ? "#b4c307" : "rgba(255,255,255,0.7)",
                      fontWeight: isActive ? 600 : 500,
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    <span className="flex-shrink-0" style={{ color: isActive ? "#b4c307" : "rgba(255,255,255,0.5)" }}>{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <button
            onClick={() => {
              logout();
              setIsOpen(false);
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
            style={{ color: "#ef4444", background: "transparent", border: "none", cursor: "pointer" }}
          >
            <LogOut size={18} strokeWidth={1.8} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>
    </>
  );
}
