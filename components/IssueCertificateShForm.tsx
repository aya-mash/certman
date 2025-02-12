/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

export default function Form() {
  const [domain, setDomain] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [saveLocally, setSaveLocally] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const requestCertificate = useCallback(async () => {
    if (!domain.trim()) {
      setStatus("Please enter a valid domain.");
      return;
    }

    setIsLoading(true);
    setStatus("Requesting...");

    try {
      const response = await fetch("/api/certificates/sh-issue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain, saveLocally }),
      });

      const data = await response.json();

      setStatus(data.message || "Request completed");
    } catch (error: any) {
      setStatus(
        error.message ?? "An error occurred while requesting the certificate."
      );
    } finally {
      setIsLoading(false);
    }
  }, [domain, saveLocally]);

  return (
    <Card className="container mx-auto bg-white p-6 rounded-lg shadow-md">
      <CardContent className="py-6">
        <label
          htmlFor="domain"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Domain
        </label>
        <Input
          id="domain"
          type="text"
          placeholder="example.com"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          className="mb-4"
          aria-label="Domain input field"
        />

        <label className="flex items-center space-x-2 mb-4">
          <Checkbox
            id="saveLocally"
            checked={saveLocally}
            onCheckedChange={(checked: boolean) => setSaveLocally(checked)}
            aria-label="Save certificate locally"
          />
          <span className="text-sm text-gray-700">
            Save certificate locally
          </span>
        </label>

        <Button
          onClick={requestCertificate}
          disabled={isLoading || !domain.trim()}
          className="w-full"
        >
          {isLoading ? "Processing..." : "Request Certificate"}
        </Button>

        {status && <p className="mt-4 text-sm text-gray-700">{status}</p>}
      </CardContent>
    </Card>
  );
}
