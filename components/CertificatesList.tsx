"use client";

import { Certificate } from "@prisma/client";

interface CertificatesListProps {
  certificates: Certificate[];
}

export default function CertificatesList({
  certificates = [],
}: Readonly<CertificatesListProps>) {
  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">Your Certificates</h2>
      {certificates.length === 0 ? (
        <p>No certificates found.</p>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left">Domain</th>
                <th className="text-left">Status</th>
                <th className="text-left">Expires</th>
                <th className="text-left">URL</th>
              </tr>
            </thead>
            <tbody>
              {certificates.map((cert) => (
                <tr key={cert.id} className="border-t">
                  <td className="py-2">{cert.domain}</td>
                  <td className="py-2">{cert.status}</td>
                  <td className="py-2">
                    {new Date(cert.expires).toLocaleDateString()}
                  </td>
                  <td className="py-2">
                    <a
                      href={cert.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      Download
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
