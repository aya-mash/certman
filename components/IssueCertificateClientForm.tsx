/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import axios from "axios";
import { ClipboardDocumentIcon, CheckIcon } from "@heroicons/react/24/outline";

export default function Home() {
  const [domain, setDomain] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [result, setResult] = useState<string>("");
  const [keyAuthorization, setKeyAuthorization] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const issueCert = async () => {
    if (!domain || !email) {
      setResult("Domain and email are required");
      return;
    }

    setIsLoading(true);
    setResult("");
    setKeyAuthorization("");

    try {
      const response = await axios.post("/api/certificates/issue", {
        domain,
        email,
      });

      setResult("Certificate issued successfully");
      setKeyAuthorization(response.data.keyAuthorization);
    } catch (error: any) {
      setResult(error.response?.data?.error || "Failed to issue certificate");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(keyAuthorization).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
    });
  };

  return (
    <>
      <h1 className="text-3xl font-bold mb-8">SSL Certificate Generator</h1>
      <div className="bg-white p-6 rounded-lg shadow-md">
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
        <button
          onClick={issueCert}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:bg-blue-300"
        >
          {isLoading ? "Issuing Certificate..." : "Issue Certificate"}
        </button>
        {result && <p className="mt-4 text-sm text-gray-700">{result}</p>}
        {keyAuthorization && (
          <div className="mt-4">
            <label
              htmlFor="keyAuthorization"
              className="block text-sm font-medium mb-2"
            >
              Key Authorization:
            </label>
            <div className="flex items-center bg-gray-50 p-2 rounded-md">
              <code className="flex-1 text-sm break-all">
                {keyAuthorization}
              </code>
              <button
                onClick={handleCopy}
                className="ml-2 p-2 text-gray-500 hover:text-gray-700"
                aria-label="Copy to clipboard"
              >
                {isCopied ? (
                  <CheckIcon className="h-5 w-5 text-green-500" />
                ) : (
                  <ClipboardDocumentIcon className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
