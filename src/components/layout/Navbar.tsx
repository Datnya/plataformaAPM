"use client";

import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { LOGO_PATH } from "@/lib/constants";

export default function Navbar() {
  const { userName, userRole } = useAuth();

  const roleLabels: Record<string, string> = {
    ADMIN: "Administrador",
    CONSULTOR: "Consultor",
    CLIENTE: "Cliente",
  };

  const roleColors: Record<string, string> = {
    ADMIN: "bg-primary/15 text-primary-hover",
    CONSULTOR: "bg-info/15 text-info",
    CLIENTE: "bg-success/15 text-success",
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-[var(--navbar-height)] bg-white border-b border-border flex items-center justify-between px-6">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <Image
          src={LOGO_PATH}
          alt="APM Group Logo"
          width={120}
          height={40}
          className="object-contain"
          priority
        />
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        <span
          className={`text-xs font-semibold px-3 py-1 rounded-full ${roleColors[userRole]}`}
        >
          {roleLabels[userRole]}
        </span>

        {/* User avatar */}
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium leading-tight">{userName}</p>
            <p className="text-xs text-text-muted leading-tight">
              {roleLabels[userRole]}
            </p>
          </div>
        </div>
      </div>
    </nav>
  );
}
