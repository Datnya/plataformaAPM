"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

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

  const formattedDate = certificate?.issue_date
    ? new Date(certificate.issue_date).toLocaleDateString("es-PE", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        timeZone: "UTC",
      })
    : "";

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
          <div style={styles.errorIcon}>✕</div>
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
          <div style={styles.checkIcon}>✓</div>
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
          <div style={styles.divider} />

          <div style={styles.row}>
            <span style={styles.label}>Fecha de emisión</span>
            <span style={styles.value}>{formattedDate}</span>
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

        {/* Download Button */}
        {certificate.pdf_url && (
          <a
            href={certificate.pdf_url}
            target="_blank"
            rel="noopener noreferrer"
            download={`Certificado_${certificate.participant_name.replace(/\s+/g, "_")}.pdf`}
            style={styles.downloadBtn}
          >
            📥 Descargar Certificado PDF
          </a>
        )}

        {/* View inline - Mobile Support via Google Docs Viewer */}
        {certificate.pdf_url && (
          <div style={styles.pdfPreview}>
            <iframe
              src={`https://docs.google.com/viewer?url=${encodeURIComponent(
                certificate.pdf_url
              )}&embedded=true`}
              style={styles.iframe}
              title="Certificado PDF"
              frameBorder="0"
            />
          </div>
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
    background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
    padding: "20px",
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
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
    background: "linear-gradient(135deg, #065f46 0%, #047857 100%)",
    padding: "32px 24px",
    textAlign: "center" as const,
  },
  checkIcon: {
    width: "56px",
    height: "56px",
    borderRadius: "50%",
    background: "rgba(255,255,255,0.2)",
    color: "#fff",
    fontSize: "28px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 16px",
    fontWeight: "bold",
  },
  title: {
    color: "#fff",
    fontSize: "22px",
    fontWeight: "700",
    margin: "0 0 8px",
  },
  subtitle: {
    color: "rgba(255,255,255,0.8)",
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
  downloadBtn: {
    display: "block",
    margin: "0 24px 20px",
    padding: "14px 24px",
    background: "linear-gradient(135deg, #065f46 0%, #047857 100%)",
    color: "#fff",
    textAlign: "center" as const,
    borderRadius: "10px",
    textDecoration: "none",
    fontWeight: "600",
    fontSize: "16px",
    transition: "opacity 0.2s",
  },
  pdfPreview: {
    margin: "0 24px 24px",
    borderRadius: "10px",
    overflow: "hidden",
    border: "1px solid #e5e7eb",
  },
  iframe: {
    width: "100%",
    height: "400px",
    border: "none",
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
