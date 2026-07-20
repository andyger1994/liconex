import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function proxy(request: NextRequest) {
  if (process.env.NEXT_PUBLIC_DEMO_MODE === "true") {
    if (request.nextUrl.pathname === "/") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({ request });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          request.cookies.set({ name, value: "", ...options });
          response = NextResponse.next({ request });
          response.cookies.set({ name, value: "", ...options });
        }
      }
    }
  );

  const {
    data: { user }
  } = await supabase.auth.getUser();

  const isAuthRoute = request.nextUrl.pathname.startsWith("/login") || request.nextUrl.pathname.startsWith("/reset-password");
  const isAppRoute = request.nextUrl.pathname === "/" || request.nextUrl.pathname.startsWith("/dashboard") || request.nextUrl.pathname.startsWith("/jobs") || request.nextUrl.pathname.startsWith("/materials") || request.nextUrl.pathname.startsWith("/vehicles") || request.nextUrl.pathname.startsWith("/calendar") || request.nextUrl.pathname.startsWith("/clients") || request.nextUrl.pathname.startsWith("/employees") || request.nextUrl.pathname.startsWith("/expenses") || request.nextUrl.pathname.startsWith("/time") || request.nextUrl.pathname.startsWith("/reports");

  if (!user && isAppRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (user && (isAuthRoute || request.nextUrl.pathname === "/")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest).*)"]
};

