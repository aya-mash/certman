/* eslint-disable @typescript-eslint/no-explicit-any */
import { exec } from "child_process";
import { db as prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import path from "path";
import { NextApiRequest, NextApiResponse } from "next";
import { authOptions } from "@/lib/authSession";

export async function POST(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();
  const session = await getServerSession(authOptions);
  if (!session) return res.status(401).json({ message: "Unauthorized" });

  const {
    domain,
    issuingMode,
    saveLocally,
  }: {
    domain: string;
    issuingMode: "automatic" | "manual";
    saveLocally: boolean;
  } = req.body;
  if (!domain) return res.status(400).json({ message: "Domain is required" });

  try {
    const savePath = saveLocally ? path.join("/etc/ssl/certs/", domain) : "";
    const certHomeOption = saveLocally ? `--cert-home ${savePath}` : "";
    const command = `~/.acme.sh/acme.sh --issue -d ${domain} --standalone ${certHomeOption}`;

    exec(command, async (error, stdout, stderr) => {
      if (error) return res.status(500).json({ message: stderr });

      const data: any = {
        domain,
        issuingMode,
        userEmail: session.user?.email ?? "",
        status: "Issued",
        saveLocally,
      };

      await prisma.certificate.create({
        data,
      });

      res.status(200).json({ message: "Certificate requested successfully" });
    });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
}
