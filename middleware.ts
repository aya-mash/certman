// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const NEXT_PUBLIC_API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

export function middleware(request: NextRequest) {
  // Set CORS headers
  const response = NextResponse.next();

  response.headers.set("Access-Control-Allow-Origin", NEXT_PUBLIC_API_URL);
  response.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );

  if (request.method === "OPTIONS") {
    return new NextResponse(null, { status: 204 });
  }

  return response;
}

export const config = {
  matcher: "/api/:path*",
};
