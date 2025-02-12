/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import acme from "acme-client";
import { authOptions } from "../../auth/[...nextauth]/route";
import { db } from "@/lib/prisma";

const ZEROSSL_EAB_KEY_ID = process.env.ZEROSSL_EAB_KEY_ID;
const ZEROSSL_EAB_HMAC_KEY = process.env.ZEROSSL_EAB_HMAC_KEY;

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const domain = searchParams.get("domain");

    if (!domain) {
      return NextResponse.json(
        { error: "Domain is required." },
        { status: 400 }
      );
    }

    const certificate = await db.certificate.findFirst({
      where: { domain, userId: session.user.id },
    });

    if (!certificate) {
      return NextResponse.json(
        { error: "Certificate not found." },
        { status: 404 }
      );
    }

    if (!ZEROSSL_EAB_KEY_ID || !ZEROSSL_EAB_HMAC_KEY) {
      console.error("Missing ZeroSSL EAB credentials.");
      return NextResponse.json(
        { error: "Server misconfiguration: ZeroSSL credentials missing." },
        { status: 500 }
      );
    }

    const client = new acme.Client({
      directoryUrl: "https://acme.zerossl.com/v2/DV90",
      accountKey: certificate.privateKey,
      accountUrl: certificate.url,
      externalAccountBinding: {
        kid: ZEROSSL_EAB_KEY_ID,
        hmacKey: ZEROSSL_EAB_HMAC_KEY,
      },
    });

    const order = await client.getOrder({
      status: certificate.status,
      finalizeUrl: certificate.url,
    } as any);

    const [, csr] = await acme.crypto.createCsr({
      commonName: domain,
      altNames: [domain],
      keySize: 2048,
    });

    const { certificate: cert } = await client.finalizeOrder(order, csr);

    await db.certificate.update({
      where: { id: certificate.id },
      data: {
        content: cert,
        status: "valid",
      },
    });

    return NextResponse.json({
      message: "Certificate issued successfully!",
      certificate: cert,
    });
  } catch (error: any) {
    console.error("Error finalizing order:", error);
    return NextResponse.json(
      { error: error.message || "Failed to finalize order." },
      { status: 500 }
    );
  }
}
