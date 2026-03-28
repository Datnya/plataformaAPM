"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { navItems } from "@/lib/nav-items";
import { LogOut, Menu, X } from "lucide-react";

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
        className={`fixed top-0 left-0 bottom-0 w-72 bg-white z-[80] transform transition-transform duration-300 md:hidden
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Close */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <span className="font-bold text-sm">Menú</span>
          <button onClick={() => setIsOpen(false)}>
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
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left
                      ${isActive ? "bg-primary/10 text-primary-hover font-semibold" : "text-foreground/70 hover:bg-surface"}`}
                  >
                    <span className="flex-shrink-0">{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-border">
          <button
            onClick={() => {
              logout();
              setIsOpen(false);
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-danger hover:bg-danger/5 transition-colors"
          >
            <LogOut size={18} strokeWidth={1.8} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>
    </>
  );
}
