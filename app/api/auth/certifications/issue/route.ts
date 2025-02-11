/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { PrismaClient } from "@prisma/client";
import acme from "acme-client";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { domain, email } = await request.json();

  try {
    const client = new acme.Client({
      directoryUrl: acme.directory.letsencrypt.production,
      accountKey: await acme.crypto.createPrivateKey(),
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

    const [privateKey, csr] = await acme.crypto.createCsr({
      commonName: domain,
      altNames: [domain],
      keySize: 2048,
    });

    const { status, expires, certificate } = await client.finalizeOrder(
      order,
      csr
    );

    const data: any = {
      domain,
      email,
      privateKey,
      content: certificate, // Save the certificate content
      status, // Set the initial status
      url: `https://${domain}/certificate`, // Example URL
      expires, // Set the expiry date
      userId: session.user.id,
    };

    const certificateRecord = await prisma.certificate.create({
      data,
    });

    return NextResponse.json({
      message: "Certificate issued successfully",
      certificate: certificateRecord,
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
