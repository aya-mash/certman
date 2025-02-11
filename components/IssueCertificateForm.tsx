/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import axios from "axios";

export default function IssueCertificateForm() {
  const [domain, setDomain] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [result, setResult] = useState<string>("");

  const issueCert = async () => {
    try {
      const response = await axios.post("/api/certificates/issue", {
        domain,
        email,
      });
      setResult(JSON.stringify(response.data, null, 2));
    } catch (error: any) {
      setResult(error.response.data.error);
    }
  };

  return (
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
        />
      </div>
      <button
        onClick={issueCert}
        className="px-4 py-2 bg-blue-600 text-white rounded-md"
      >
        Issue Certificate
      </button>
      {result && <pre className="mt-4 p-4 bg-gray-50 rounded-md">{result}</pre>}
    </div>
  );
}
