"use client";

import Image from "next/image";
import { useState } from "react";
import { useAuth, UserRole } from "@/context/AuthContext";
import { Eye, EyeOff } from "lucide-react";
import { LOGO_PATH } from "@/lib/constants";

export default function LoginForm() {
  const { setIsAuthenticated, setUserRole, setUserName, setUserId } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  // New States:
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error al iniciar sesión.");
      }

      setUserRole(data.role as UserRole);
      setUserName(data.name || "Usuario APM");
      setUserId(data.id || "");
      setIsAuthenticated(true);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-surface">
      {/* Left Column: Image Area */}
      <div className="hidden lg:block lg:w-1/2 relative bg-gray-900 border-r border-border/50">
        <Image
          src="/inicio_registro_imagen.png"
          alt="APM Group Inicio"
          fill
          className="object-cover"
          style={{ objectPosition: '15% 50%' }}
          priority
        />
        {/* Black 20% Opacity Overlay (Even Lighter) */}
        <div className="absolute inset-0 bg-black/20 z-10 pointers-events-none" />
      </div>

      {/* Right Column: Form Area */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4">
        <div className="w-full max-w-md animate-scale-in">
          {/* Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-border p-8 md:p-10">
            {/* Logo */}
            <div className="flex justify-center mb-8">
              <Image
                src={LOGO_PATH}
                alt="APM Group Logo"
                width={180}
                height={60}
                className="object-contain"
                priority
              />
            </div>

            {/* Heading */}
            <h1 className="text-2xl font-bold text-center mb-1">
              Bienvenido de nuevo
            </h1>
            <p className="text-sm text-text-muted text-center mb-8">
              Ingresa tus credenciales para acceder a la plataforma
            </p>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium mb-1.5"
                >
                  Correo electrónico
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@correo.com"
                  className="input-field"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium mb-1.5"
                >
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="input-field pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-muted hover:text-primary transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {errorMsg && (
                <div className="bg-danger/10 border border-danger/20 text-danger text-sm font-semibold p-3 rounded-lg animate-fade-in text-center">
                  {errorMsg}
                </div>
              )}

              <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base flex justify-center items-center">
                {loading ? <span className="animate-spin text-xl leading-none">◌</span> : "Iniciar Sesión"}
              </button>
            </form>
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-text-light mt-6">
            © {new Date().getFullYear()} APM Group. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </div>
  );
}
