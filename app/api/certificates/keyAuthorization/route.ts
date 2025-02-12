/* eslint-disable @typescript-eslint/no-explicit-any */
import { db } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const domain = searchParams.get("domain");

  if (!domain) {
    return NextResponse.json({ error: "Domain is required" }, { status: 400 });
  }

  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const certificate = await db.certificate.findFirst({
      where: { domain },
    });

    if (!certificate) {
      return NextResponse.json(
        { error: "Certificate not found", message: "Certificate not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        keyAuthorization: certificate.keyAuthorization,
        token: certificate.token,
      },
      {
        status: 200,
      }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error.message || "Failed to get key authorization",
        message: error.message || "Failed to get key authorization",
      },
      {
        status: 500,
      }
    );
  }
}
