/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import acme from "acme-client";
import { db } from "@/lib/prisma";
import { authOptions } from "@/lib/authSession";

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

    const order = await client.createOrder({
      identifiers: [{ type: "dns", value: domain }],
    });

    const authorizations = await client.getAuthorizations(order);
    const { expires, challenges, status } = authorizations[0];
    const challenge = challenges.find((c) => c.type === "http-01");

    if (!challenge) {
      console.error("HTTP-01 challenge not found.");
      return NextResponse.json(
        { error: "HTTP-01 challenge not found." },
        { status: 500 }
      );
    }

    const keyAuthorization = await client.getChallengeKeyAuthorization(
      challenge
    );

    const url = client.getAccountUrl();

    console.log("Key Authorization:", keyAuthorization);

    const createdData = await db.certificate.create({
      data: {
        domain,
        email,
        keyAuthorization,
        token: challenge.token,
        content: "",
        url,
        privateKey: String(privateKey),
        expires: String(expires),
        status,
        userId: session.user.id,
      },
    });

    const interval = setInterval(async () => {
      try {
        const updatedChallenge = await client.completeChallenge(challenge);

        if (updatedChallenge.status === "valid") {
          const [, csr] = await acme.crypto.createCsr({
            commonName: domain,
            altNames: [domain],
            keySize: 2048,
          });

          const { certificate: cert } = await client.finalizeOrder(order, csr);

          await db.certificate.update({
            where: { id: createdData.id },
            data: {
              content: cert,
              status: "valid",
            },
          });

          clearInterval(interval);
          return NextResponse.json({
            message: "Certificate issued successfully",
            certificate: cert,
          });
        }

        if (updatedChallenge.status === "invalid") {
          clearInterval(interval);
          return NextResponse.json(
            {
              error: "HTTP-01 challenge failed.",
              message: "Please try again later.",
            },
            { status: 400 }
          );
        }
      } catch (error: any) {
        console.error("Verification check failed:", error);
      }
    }, 30000); // Check every 30 seconds

    return NextResponse.json({
      message: "Challenge created. Waiting for verification...",
      keyAuthorization,
      token: challenge.token,
    });
  } catch (error: any) {
    console.error("Error in POST endpoint:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
