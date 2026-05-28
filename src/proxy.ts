import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh the session to keep it alive
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protect API routes (except auth and public endpoints)
  if (request.nextUrl.pathname.startsWith("/api/")) {
    const isAuthRoute = request.nextUrl.pathname.startsWith("/api/auth/");
    const isPublicCertRoute = request.nextUrl.pathname.startsWith("/api/certificates/validate/");
    
    if (!isAuthRoute && !isPublicCertRoute && !user) {
      return NextResponse.json(
        { error: "No autenticado. Inicia sesion primero." },
        { status: 401 }
      );
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/api/:path*"],
};
