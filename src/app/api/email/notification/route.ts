import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { emails, date, description } = await req.json();

    if (!emails || !date || !description) {
      return NextResponse.json({ error: "Faltan parámetros requeridos para el correo." }, { status: 400 });
    }

    // 1. Aquí se integraría SendGrid, Resend, o Nodemailer:
    // await resend.emails.send({ ... })
    
    // Contenido del correo estructurado según la Fase 6 de integración estricta
    const emailData = {
      from: "consultas@apmgroup.pe",
      to: typeof emails === "string" ? JSON.parse(emails) : emails, // array containing Client/Consultant emails
      subject: "APM Group - Notificación de Actividad Programada",
      html: `
        <p>APM Group te notifica que el día ${new Date(date).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} se realizará la siguiente actividad: ${description}.</p>
      `,
      text: `APM Group te notifica que el día ${new Date(date).toLocaleDateString('es-ES')} se realizará la siguiente actividad: ${description}.`
    };

    // Simularemos el envío exitoso para la demo
    console.log("Mock Email Sent: ", emailData);

    return NextResponse.json({ success: true, message: "Correos notificados con éxito." });
  } catch (error) {
    console.error("Email Error:", error);
    return NextResponse.json({ error: "No se pudo enviar el correo de notificación." }, { status: 500 });
  }
}
