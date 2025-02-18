/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "@/lib/prisma";
import { authOptions } from "@/lib/authSession";
import { CA_DIRECTORY_URLS, getAcmeClient } from "@/lib/acme";
import * as jose from "jose";

const eabKid = process.env.ZEROSSL_EAB_KEY_ID;
const eabHmacKey = process.env.ZEROSSL_EAB_HMAC_KEY;

const createExternalAccountBinding = async (accountKeyJwk: jose.JWK) => {
  try {
    if (!eabKid || !eabHmacKey) {
      throw new Error(
        "Client Misconfiguration: Missing ZeroSSL EAB credentials."
      );
    }

    const protectedHeader = {
      alg: "HS256",
      kid: eabKid,
      url: "https://acme.zerossl.com/v2/DV90/newAccount",
    };

    const hmacKeyJwk = {
      kty: "oct",
      k: Buffer.from(eabHmacKey, "base64").toString("base64"),
      alg: "HS256",
    };

    const hmacKey = await jose.importJWK(hmacKeyJwk, "HS256");

    const jws = await new jose.CompactSign(
      new TextEncoder().encode(JSON.stringify(accountKeyJwk))
    )
      .setProtectedHeader(protectedHeader)
      .sign(hmacKey);

    return jws;
  } catch (error: any) {
    console.error("Error creating EAB:", error);
    throw error;
  }
};

export async function POST(request: Request) {
  if (request.method !== "POST") {
    return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
  }

  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { domain, email, challengeType, ca } = await request.json();
    if (!domain || !email || !challengeType || !ca) {
      return NextResponse.json(
        { error: "Missing required parameters." },
        { status: 400 }
      );
    }

    if (!CA_DIRECTORY_URLS[ca]) {
      return NextResponse.json({ error: "Unsupported CA" }, { status: 400 });
    }

    const { client,csr,privateKey } = await getAcmeClient(domain, ca);

    const accountKey = await jose.generateKeyPair("ES256", {
      extractable: true,
    });
    const accountKeyJwk = await jose.exportJWK(accountKey.privateKey);
    const jws = await createExternalAccountBinding(accountKeyJwk);

    await client.createAccount({
      termsOfServiceAgreed: true,
      contact: [`mailto:${email}`],
      externalAccountBinding: {
        payload: {
          kid: eabKid,
          hmacKey: eabHmacKey,
        },
        signature: jws,
      },
    });

    const order = await client.createOrder({
      identifiers: [{ type: "dns", value: domain }],
    });

    const authorizations = await client.getAuthorizations(order);
    const { challenges } = authorizations[0];
    const challenge = challenges.find((c) => c.type === challengeType);

    if (!challenge) {
      console.error("Challenge not found.");
      return NextResponse.json(
        { error: "Challenge not found." },
        { status: 500 }
      );
    }

    const keyAuthorization = await client.getChallengeKeyAuthorization(
      challenge
    );

    if (!keyAuthorization) {
      console.error("Could not get key authorization:");
      return NextResponse.json(
        { error: "Could not get key authorization." },
        { status: 500 }
      );
    }

    console.log("Key Authorization:", keyAuthorization);

    const createdCertificate = await db.certificate.create({
      data: {
        domain,
        userId: session.user.id,
        status: "pending",
        csr: String(csr),
        email,
        content: "",
        expires: String(order.expires),
        keyAuthorization,
        privateKey: String(privateKey),
        token: challenge.token,
        url: "",
      } as any,
    });

    const createdOrder = await db.order.create({
      data: {
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        finalize: order.finalize,
        status: "pending",
        url: order.url,
        certificateId: createdCertificate?.id,
      },
    });

    return NextResponse.json({
      message: "Certificate successfully ordered. Waiting for verification...",
      key: keyAuthorization,
      orderId: createdOrder.id,
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
