/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { PrismaClient } from "@prisma/client";
import acme from "acme-client";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const prisma = new PrismaClient();

const ZEROSSL_EAB_KEY_ID = process.env.ZEROSSL_EAB_KEY_ID; // Add this to your .env file
const ZEROSSL_EAB_HMAC_KEY = process.env.ZEROSSL_EAB_HMAC_KEY; // Add this to your .env file

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { domain, email } = await request.json();

  if (!domain || !email) {
    return NextResponse.json(
      { error: "Domain and email are required" },
      { status: 400 }
    );
  }

  try {
    const client = new acme.Client({
      directoryUrl: "https://acme.zerossl.com/v2/DV90",
      accountKey: await acme.crypto.createPrivateKey(),
      externalAccountBinding: {
        kid: ZEROSSL_EAB_KEY_ID as string,
        hmacKey: ZEROSSL_EAB_HMAC_KEY as string,
      },
    });

    await client.createAccount({
      termsOfServiceAgreed: true,
      externalAccountBinding: {
        kid: ZEROSSL_EAB_KEY_ID as string,
        hmacKey: ZEROSSL_EAB_HMAC_KEY as string,
      },
      contact: [`mailto:${email}`],
    });

    const order = await client.createOrder({
      identifiers: [{ type: "dns", value: domain }],
    });

    const authorizations = await client.getAuthorizations(order);
    const challenge = authorizations[0].challenges.find(
      (c) => c.type === "http-01"
    );

    if (!challenge) {
      throw new Error("HTTP-01 challenge not found");
    }

    const keyAuthorization = await client.getChallengeKeyAuthorization(
      challenge
    );

    console.log("Key Authorization:", keyAuthorization);

    await client.verifyChallenge(authorizations[0], challenge);
    await client.completeChallenge(challenge);

    await client.waitForValidStatus(challenge);

    const [, csr] = await acme.crypto.createCsr({
      commonName: domain,
      altNames: [domain],
      keySize: 2048,
    });

    const { certificate, url, status, expires } = await client.finalizeOrder(
      order,
      csr
    );

    const data: any = {
      domain,
      email,
      content: certificate,
      status,
      url,
      expires,
      userId: session.user.id,
    };

    const certificateRecord = await prisma.certificate.create({
      data,
    });

    return NextResponse.json({
      message: "Certificate issued successfully",
      certificate: certificateRecord,
      keyAuthorization,
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { error: error.message || "Failed to issue certificate" },
      { status: 500 }
    );
  }
}
