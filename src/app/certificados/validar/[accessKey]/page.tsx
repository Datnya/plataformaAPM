"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Eye, Download, CheckCircle2, XCircle } from "lucide-react";
import Image from "next/image";

interface CertificateData {
  id: string;
  participant_name: string;
  participant_code: string;
  course_title: string;
  duration: string;
  issue_date: string;
  normas: string | null;
  pdf_url: string;
}

export default function ValidarCertificadoPage() {
  const params = useParams();
  const accessKey = params?.accessKey as string;

  const [certificate, setCertificate] = useState<CertificateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!accessKey) return;
    (async () => {
      try {
        const res = await fetch(`/api/certificates/validate/${accessKey}`);
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Certificado no encontrado");
        }
        const { certificate: cert } = await res.json();
        setCertificate(cert);
      } catch (err: any) {
        setError(err.message || "Error al validar el certificado");
      } finally {
        setLoading(false);
      }
    })();
  }, [accessKey]);

  // Date removed per user request

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.spinner} />
          <p style={styles.loadingText}>Validando certificado...</p>
        </div>
      </div>
    );
  }

  if (error || !certificate) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.errorIcon}>
            <XCircle size={32} />
          </div>
          <h1 style={styles.errorTitle}>Certificado no encontrado</h1>
          <p style={styles.errorText}>
            {error || "El enlace no corresponde a un certificado válido."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.logoContainer}>
            <Image src="/logo-apm.png" alt="APM Group Logo" width={140} height={50} style={{ objectFit: 'contain' }} priority />
          </div>
          <div style={styles.checkIcon}>
            <CheckCircle2 size={32} />
          </div>
          <h1 style={styles.title}>Certificado Válido</h1>
          <p style={styles.subtitle}>
            Este certificado ha sido verificado por APM Group
          </p>
        </div>

        {/* Certificate Details */}
        <div style={styles.details}>
          <div style={styles.row}>
            <span style={styles.label}>Participante</span>
            <span style={styles.value}>{certificate.participant_name}</span>
          </div>
          <div style={styles.divider} />

          <div style={styles.row}>
            <span style={styles.label}>Programa</span>
            <span style={styles.value}>{certificate.course_title}</span>
          </div>
          <div style={styles.divider} />

          <div style={styles.row}>
            <span style={styles.label}>Código</span>
            <span style={styles.value}>{certificate.participant_code}</span>
          </div>
          <div style={styles.divider} />

          <div style={styles.row}>
            <span style={styles.label}>Duración</span>
            <span style={styles.value}>{certificate.duration}</span>
          </div>

          {certificate.normas && (
            <>
              <div style={styles.divider} />
              <div style={styles.row}>
                <span style={styles.label}>Normas</span>
                <span style={styles.value}>{certificate.normas}</span>
              </div>
            </>
          )}
        </div>

        {/* View PDF Button - Opens in new tab (works on all mobile browsers) */}
        {certificate.pdf_url && (
          <a
            href={certificate.pdf_url}
            target="_blank"
            rel="noopener noreferrer"
            style={styles.viewBtn}
          >
            <Eye size={20} />
            <span>Ver Certificado PDF</span>
          </a>
        )}

        {/* Download Button - Uses blob fetch for cross-origin mobile download */}
        {certificate.pdf_url && (
          <button
            onClick={async () => {
              try {
                const res = await fetch(certificate.pdf_url);
                const blob = await res.blob();
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `Certificado_${certificate.participant_name.replace(/\s+/g, "_")}.pdf`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
              } catch {
                // Fallback: open in new tab
                window.open(certificate.pdf_url, "_blank");
              }
            }}
            style={styles.downloadBtn}
          >
            <Download size={20} />
            <span>Descargar Certificado PDF</span>
          </button>
        )}

        {/* Footer */}
        <p style={styles.footer}>
          © {new Date().getFullYear()} APM Group — Todos los derechos reservados
        </p>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#000000",
    padding: "20px",
    fontFamily: "'Poppins', sans-serif",
  },
  card: {
    background: "#ffffff",
    borderRadius: "16px",
    boxShadow: "0 25px 50px rgba(0,0,0,0.25)",
    maxWidth: "560px",
    width: "100%",
    overflow: "hidden",
  },
  header: {
    background: "#b0bf12", // APM Green
    padding: "32px 24px",
    textAlign: "center" as const,
  },
  logoContainer: {
    display: "flex",
    justifyContent: "center",
    marginBottom: "20px",
    background: "#ffffff",
    padding: "10px",
    borderRadius: "8px",
    width: "fit-content",
    margin: "0 auto 20px",
  },
  checkIcon: {
    width: "56px",
    height: "56px",
    borderRadius: "50%",
    background: "rgba(0,0,0,0.1)",
    color: "#000",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 16px",
  },
  title: {
    color: "#000000",
    fontSize: "22px",
    fontWeight: "700",
    margin: "0 0 8px",
  },
  subtitle: {
    color: "rgba(0,0,0,0.7)",
    fontSize: "14px",
    margin: 0,
  },
  details: {
    padding: "24px",
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "16px",
    padding: "10px 0",
  },
  label: {
    color: "#6b7280",
    fontSize: "13px",
    fontWeight: "600",
    textTransform: "uppercase" as const,
    letterSpacing: "0.05em",
    flexShrink: 0,
    minWidth: "100px",
  },
  value: {
    color: "#111827",
    fontSize: "15px",
    fontWeight: "500",
    textAlign: "right" as const,
    wordBreak: "break-word" as const,
  },
  divider: {
    height: "1px",
    background: "#e5e7eb",
  },
  viewBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    margin: "0 24px 12px",
    padding: "14px 24px",
    background: "#000000",
    color: "#b0bf12",
    textAlign: "center" as const,
    borderRadius: "10px",
    textDecoration: "none",
    fontWeight: "600",
    fontSize: "16px",
    transition: "opacity 0.2s",
  },
  downloadBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    width: "calc(100% - 48px)",
    margin: "0 24px 20px",
    padding: "14px 24px",
    background: "#b0bf12",
    color: "#000000",
    textAlign: "center" as const,
    borderRadius: "10px",
    border: "none",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "16px",
    transition: "opacity 0.2s",
  },
  footer: {
    textAlign: "center" as const,
    padding: "16px 24px",
    background: "#f9fafb",
    color: "#9ca3af",
    fontSize: "12px",
    margin: 0,
  },
  spinner: {
    width: "40px",
    height: "40px",
    border: "4px solid #e5e7eb",
    borderTop: "4px solid #047857",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    margin: "40px auto 16px",
  },
  loadingText: {
    color: "#6b7280",
    textAlign: "center" as const,
    padding: "0 0 40px",
  },
  errorIcon: {
    width: "56px",
    height: "56px",
    borderRadius: "50%",
    background: "#fef2f2",
    color: "#dc2626",
    fontSize: "28px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "40px auto 16px",
    fontWeight: "bold",
  },
  errorTitle: {
    color: "#111827",
    fontSize: "20px",
    fontWeight: "700",
    textAlign: "center" as const,
    margin: "0 0 8px",
  },
  errorText: {
    color: "#6b7280",
    fontSize: "14px",
    textAlign: "center" as const,
    padding: "0 24px 40px",
    margin: 0,
  },
};
