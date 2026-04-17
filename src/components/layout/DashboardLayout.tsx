"use client";

import { useAuth } from "@/context/AuthContext";
import Sidebar from "@/components/layout/Sidebar";
import MobileSidebar from "@/components/layout/MobileSidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return null; // Will be handled by page.tsx redirect
  }

  return (
    <div className="min-h-screen bg-surface">
      <Sidebar />
      <MobileSidebar />

      {/* Main Content */}
      <main className="pl-0 md:pl-[var(--sidebar-width)] min-h-screen transition-all duration-300">
        <div className="p-4 md:p-6 lg:p-8 animate-fade-in">{children}</div>
      </main>
    </div>
  );
}
