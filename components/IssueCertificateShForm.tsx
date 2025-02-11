"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

export default function Form() {
  const [domain, setDomain] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [saveLocally, setSaveLocally] = useState<boolean>(false);

  const requestCertificate = async () => {
    setStatus("Requesting...");
    const response = await fetch("/api/request-cert", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ domain, saveLocally }),
    });
    const data = await response.json();
    setStatus(data.message || "Request completed");
  };

  return (
    <div className="p-6 max-w-lg mx-auto">6
      <h1 className="text-2xl font-bold mb-4">SSL Certificate Issuer</h1>
      <Card>
        <CardContent>
          <Input
            placeholder="Enter domain"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            className="mb-4"
          />
          <label className="flex items-center space-x-2 mb-4">
            <input
              type="checkbox"
              checked={saveLocally}
              onChange={(e) => setSaveLocally(e.target.checked)}
            />
            <span>Save locally</span>
          </label>
          <Button onClick={requestCertificate}>Request Certificate</Button>
          {status && <p className="mt-4 text-sm">{status}</p>}
        </CardContent>
      </Card>
    </div>
  );
}
