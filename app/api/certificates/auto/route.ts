/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import acme from "acme-client";
import { authOptions } from "../../auth/[...nextauth]/route";
import { db } from "@/lib/prisma";

const ZEROSSL_EAB_KEY_ID = process.env.ZEROSSL_EAB_KEY_ID;
const ZEROSSL_EAB_HMAC_KEY = process.env.ZEROSSL_EAB_HMAC_KEY;

export async function POST(request: Request) {
  try {
    if (!ZEROSSL_EAB_KEY_ID || !ZEROSSL_EAB_HMAC_KEY) {
      console.error("Missing ZeroSSL EAB credentials.");
      return NextResponse.json(
        { error: "Server misconfiguration: ZeroSSL credentials missing." },
        { status: 500 }
      );
    }

    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body;
    try {
      body = await request.json();
    } catch (err) {
      console.error("Invalid JSON in request body:", err);
      return NextResponse.json(
        { error: "Invalid JSON format in request body." },
        { status: 400 }
      );
    }

    const { domain, email } = body;

    if (!domain || !email) {
      return NextResponse.json(
        { error: "Domain and email are required." },
        { status: 400 }
      );
    }

    const privateKey = await acme.crypto.createPrivateKey();

    const client = new acme.Client({
      directoryUrl: "https://acme.zerossl.com/v2/DV90",
      accountKey: privateKey,
      externalAccountBinding: {
        kid: ZEROSSL_EAB_KEY_ID,
        hmacKey: ZEROSSL_EAB_HMAC_KEY,
      },
    });

    await client.createAccount({
      termsOfServiceAgreed: true,
      contact: [`mailto:${email}`],
    });

    const [, certificateCsr] = await acme.crypto.createCsr({
      commonName: domain,
      altNames: [domain],
      keySize: 2048,
    });

    const certificate = await client.auto({
      csr: certificateCsr,
      email,
      termsOfServiceAgreed: true,
      skipChallengeVerification: true,
      challengeCreateFn: async (authz, challenge, keyAuthorization) => {
        console.log("Creating change...");
        return Promise.resolve({ challenge, authz, keyAuthorization });
      },
      challengeRemoveFn: async () => {
        console.log("Removing challenge...");
      },
    });

    const createdData = await db.certificate.create({
      data: {
        domain,
        email,
        content: certificate.toString(),
        privateKey: String(privateKey),
        status: "valid",
        userId: session.user.id,
        keyAuthorization: "",
        token: "",
        url: "",
        expires: "",
      },
    });

    return NextResponse.json({
      message: "Certificate issued successfully!",
      certificate: createdData,
    });
  } catch (error: any) {
    console.error("Error issuing certificate:", error);
    return NextResponse.json(
      { error: error.message || "Failed to issue certificate." },
      { status: 500 }
    );
  }
}
