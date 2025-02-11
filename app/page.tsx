import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import IssueCertificateForm from "@/components/IssueCertificateClientForm";
import CertificatesList from "@/components/CertificatesList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import IssueCertificateShForm from "@/components/IssueCertificateShForm";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/api/auth/signin");
  }

  // Fetch certificates for the logged-in user
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/certificates`,
    {
      cache: "no-store",
    }
  );
  const { certificates } = await response.json();

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <Tabs defaultValue="account" className="w-[400px]">
        <TabsList>
          <TabsTrigger value="client">ACME Client</TabsTrigger>
          <TabsTrigger value="sh">ACME.SH</TabsTrigger>
        </TabsList>
        <TabsContent value="client">
          <IssueCertificateForm />
        </TabsContent>
        <TabsContent value="sh"><IssueCertificateShForm /></TabsContent>
        <CertificatesList certificates={certificates} />
      </Tabs>
    </main>
  );
}
