import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { CheckCircle, Download, FileText } from "lucide-react";

export default async function CertificateValidationPage({ params }: { params: { accessKey: string } }) {
  const { accessKey } = params;

  if (!accessKey) return notFound();

  const certificate = await prisma.certificate.findUnique({
    where: { accessKey },
    include: { project: { include: { client: true, consultant: true } } }
  });

  if (!certificate) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6 text-center">
         <div className="bg-white p-8 rounded-2xl shadow-sm border border-border max-w-md w-full">
            <div className="w-16 h-16 bg-danger/10 text-danger rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText size={32} />
            </div>
            <h1 className="text-xl font-bold mb-2">Certificado no encontrado</h1>
            <p className="text-text-muted text-sm">El identificador proporcionado no pertenece a ningún certificado válido emitido por APM Group.</p>
         </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-50 py-12 px-4 selection:bg-primary/20">
       <div className="w-full max-w-2xl bg-white rounded-3xl shadow-sm border border-border overflow-hidden">
          <div className="bg-primary/5 border-b border-primary/10 p-6 flex flex-col items-center text-center">
             <div className="w-16 h-16 bg-success/20 text-success rounded-full flex items-center justify-center mb-4">
                <CheckCircle size={32} />
             </div>
             <h1 className="text-xl md:text-2xl font-black text-foreground">Certificado Validado Exitosamente</h1>
             <p className="text-sm text-text-muted mt-2 font-medium">Este documento digital está respaldado por APM Consultores</p>
          </div>

          <div className="p-6 md:p-8 space-y-6">
             <div>
                <p className="text-xs uppercase tracking-wider font-bold text-text-muted mb-1">Otorgado a</p>
                <p className="text-2xl font-bold">{certificate.participantName}</p>
             </div>

             <div>
                <p className="text-xs uppercase tracking-wider font-bold text-text-muted mb-1">Por participar en</p>
                <p className="text-lg font-medium">{certificate.courseTitle}</p>
             </div>

             <div className="grid grid-cols-2 gap-4 bg-surface rounded-xl p-4 border border-border">
                <div>
                   <p className="text-[10px] uppercase font-bold text-text-muted">Fecha Emisión</p>
                   <p className="font-semibold text-sm">{new Date(certificate.issueDate).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" })}</p>
                </div>
                <div>
                   <p className="text-[10px] uppercase font-bold text-text-muted">Código Verificación</p>
                   <p className="font-mono font-medium text-xs break-all">{certificate.participantCode}</p>
                </div>
                <div>
                   <p className="text-[10px] uppercase font-bold text-text-muted">Duración</p>
                   <p className="font-semibold text-sm">{certificate.duration}</p>
                </div>
                <div>
                   <p className="text-[10px] uppercase font-bold text-text-muted">Empresa</p>
                   <p className="font-semibold text-sm truncate">{certificate.project.client?.companyName || "N/A"}</p>
                </div>
             </div>

             <div className="pt-6 border-t border-border flex flex-col sm:flex-row gap-3">
                 <a 
                   href={certificate.pdfUrl || "#"} 
                   target="_blank" 
                   rel="noopener noreferrer" 
                   className="flex-1 bg-primary hover:bg-primary-hover text-white text-center rounded-xl py-3.5 px-4 font-bold text-sm transition-colors flex items-center justify-center gap-2"
                 >
                    <FileText size={18} /> Previsualizar Certificado
                 </a>
                 <a 
                   href={certificate.pdfUrl || "#"} 
                   download={`${certificate.participantName.replace(/\s+/g,"_")}_Certificado.pdf`}
                   className="sm:flex-none bg-surface hover:bg-surface-hover text-foreground text-center rounded-xl py-3.5 px-6 font-bold text-sm border border-border transition-colors flex items-center justify-center gap-2"
                 >
                    <Download size={18} /> Descargar
                 </a>
             </div>
          </div>
       </div>

       <p className="mt-8 text-xs text-text-muted/60 font-medium">
          APM Platform &copy; {new Date().getFullYear()} — Plataforma Oficial de Control
       </p>
    </div>
  );
}
