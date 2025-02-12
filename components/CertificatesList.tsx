/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Button } from "./ui/button";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Certificate } from "@prisma/client";
import { LoadingButton } from "./LoadingButton";

export default function CertificatesList({
  userId,
}: {
  readonly userId: string;
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [certificates, setCertificates] = useState<Certificate[]>([]);

  useEffect(() => {
    // Fetch certificates for the logged-in user
    const fetchCertificates = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/certificates/?userId=${userId}`,
          {
            cache: "no-store",
          }
        );
        const { certificates } = await response.json();
        setCertificates(certificates);
      } catch (error) {
        console.error("Error fetching certificates:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCertificates();
  }, [userId, deleting]);

  const handleDelete = async (id: string) => {
    try {
      const confirmed = confirm("Are you sure you want to delete this?");
      if (confirmed) {
        setDeleting(true);
        const response = await fetch(`/api/certificates/?id=${id}`, {
          method: "DELETE",
        });
        const data = await response.json();
        toast({
          title: "Success",
          description: data.message,
        });
      }
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Error",
        description: error.message,
      });
    } finally {
      setDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

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
                <th className="text-left">Actions</th>
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
                  <td className="py-2 space-x-2">
                    <Button
                      onClick={() =>
                        window.open(cert.url, "_blank", "noopener noreferrer")
                      }
                      disabled={cert.status !== "issued"}
                    >
                      Download
                    </Button>
                    <Button
                      onClick={() =>
                        window.open(cert.url, "_blank", "noopener noreferrer")
                      }
                      disabled={cert.status !== "expired"}
                    >
                      Renew
                    </Button>
                    <LoadingButton
                      isLoading={deleting}
                      onClick={() => handleDelete(cert.id)}
                    >
                      Delete
                    </LoadingButton>
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
