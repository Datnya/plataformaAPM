"use client";

import { useAuth } from "@/context/AuthContext";
import { Award, BookOpen, Users, FileText } from "lucide-react";

export default function AdminMasHerramientas() {
  const { setCurrentView } = useAuth();

  const tools = [
    {
      title: "Generador de Propuestas Económicas",
      view: "propuestas",
      icon: FileText,
      description: "Crea propuestas en formato PDF para prospectos y clientes.",
    },
    {
      title: "Generador de Certificados",
      view: "certificados",
      icon: Award,
      description: "Crea y administra certificados del sistema.",
    },
    {
      title: "Manual de Usuario",
      view: "manual",
      icon: BookOpen,
      description: "Consulta guías y tutoriales de uso.",
    },
    {
      title: "Gestión de Usuarios",
      view: "usuarios",
      icon: Users,
      description: "Administra cuentas, roles y permisos.",
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 min-h-[80vh]">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-gray-800">Más Herramientas</h1>
          <p className="text-gray-500 mt-3 text-lg max-w-2xl mx-auto">
            Accede a configuraciones adicionales y herramientas de administración exclusivas.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto mt-12">
          {tools.map((tool) => (
            <button
              key={tool.view}
              onClick={() => setCurrentView(tool.view)}
              className="group flex flex-col items-center p-10 bg-white rounded-2xl border border-gray-200 hover:border-primary hover:shadow-lg transition-all duration-300 text-center focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              <div className="w-24 h-24 flex items-center justify-center rounded-full bg-gray-50 group-hover:bg-primary/10 transition-colors duration-300 mb-6 shadow-sm border border-gray-100 group-hover:border-primary/20">
                <tool.icon size={48} className="text-gray-400 group-hover:text-primary transition-colors duration-300" strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3 group-hover:text-primary transition-colors">
                {tool.title}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                {tool.description}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
