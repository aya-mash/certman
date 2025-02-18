/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "@/lib/prisma";
import { authOptions } from "@/lib/authSession";
import { getAcmeClient } from "@/lib/acme";

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (request.method !== "PUT") {
    return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
  }

  try {
    const { orderId, ca } = await request.json();
    if (!orderId) {
      return NextResponse.json(
        { error: "Missing required parameters." },
        { status: 400 }
      );
    }

    const order = await db.order.findUnique({ where: { id: orderId } });
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const { domain, csr, privateKey }: any = await db.certificate.findUnique({
      where: { id: order.certificateId },
    });

    const { client } = await getAcmeClient(domain, ca);

    const { certificate, status, expires, url } = await client.finalizeOrder(
      order as any,
      csr
    );

    const updatedCertificate = await db.certificate.update({
      where: { id: order.certificateId },
      data: {
        status,
        content: certificate,
        url,
        expires,
        privateKey: privateKey,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      message: "Certificate finalized successfully",
      certificate: updatedCertificate,
    });
  } catch (error: any) {
    console.error("Error in PUT endpoint:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
