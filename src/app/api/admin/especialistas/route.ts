import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth-guard";

export async function GET() {
  try {
    const auth = await requireRole(["ADMIN"]);
    if ("error" in auth) return auth.error;

    const supabase = await createClient();

    // Fetch specialists
    const { data: users, error: usersError } = await supabase
      .from("users")
      .select("id, name, email")
      .eq("role", "ESPECIALISTA");

    if (usersError) throw usersError;

    // Fetch adhoc_services
    const { data: adhocServices, error: adhocError } = await supabase
      .from("adhoc_services")
      .select("*");

    if (adhocError) throw adhocError;

    // Fetch training_services
    const { data: trainingServices, error: trainingError } = await supabase
      .from("training_services")
      .select("*");

    if (trainingError) throw trainingError;

    // Merge them
    const results = users.map((u) => {
      // Find latest or default active service
      const userAdhoc = adhocServices.filter((s) => s.consultant_id === u.id);
      const userTraining = trainingServices.filter((s) => s.consultant_id === u.id);
      
      return {
        user: u,
        adhoc_service: userAdhoc[userAdhoc.length - 1] || null,
        training_service: userTraining[userTraining.length - 1] || null,
      };
    });

    return NextResponse.json(results);
  } catch (error) {
    console.error("Error fetching especialistas:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
