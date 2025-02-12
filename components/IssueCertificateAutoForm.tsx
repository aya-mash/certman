/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import axios from "axios";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { toast } from "@/hooks/use-toast";

export default function Form() {
  const [domain, setDomain] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [result, setResult] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const issueCert = async () => {
    if (!domain || !email) {
      setResult("Domain and email are required");
      return;
    }

    setIsLoading(true);
    setResult("");

    try {
      const response = await axios.post("/api/certificates/auto", {
        domain,
        email,
      });
      setResult(response.data.message);
      toast({
        title: "✅ Success",
        description: "Certificate issued successfully!",
      });
    } catch (error: any) {
      console.dir(error);
      toast({
        title: "Error",
        description:
          error.response?.data?.error || "Failed to issue certificate.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="container mx-auto bg-white p-6 rounded-lg shadow-md">
      <div className="mb-4">
        <label htmlFor="domain" className="block text-sm font-medium mb-2">
          Domain:
        </label>
        <input
          id="domain"
          type="text"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          className="w-full p-2 border rounded-md"
          placeholder="example.com"
        />
      </div>
      <div className="mb-4">
        <label htmlFor="email" className="block text-sm font-medium mb-2">
          Email:
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border rounded-md"
          placeholder="admin@example.com"
        />
      </div>
      <div className="space-x-2">
        <Button
          onClick={issueCert}
          disabled={isLoading || email === "" || domain === ""}
          className="px-4 py-2 text-white rounded-md"
        >
          {isLoading ? "Issuing Certificate..." : "Issue Certificate"}
        </Button>
      </div>
      {result && (
        <p className="mt-4 text-sm text-gray-700 whitespace-pre-line">
          {result}
        </p>
      )}
    </Card>
  );
}
