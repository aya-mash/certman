import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import IssueCertificateForm from "@/components/IssueCertificateClientForm";
import IssueCertificateAutoForm from "@/components/IssueCertificateAutoForm";
import CertificatesList from "@/components/CertificatesList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import IssueCertificateShForm from "@/components/IssueCertificateShForm";
import { Header } from "@/components/Header";
import Footer from "@/components/Footer";
import { Toaster } from "@/components/ui/toaster";
import { authOptions } from "@/lib/authSession";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/api/auth/signin");
  }

  return (
    <>
      <Header session={session} />
      <main className="flex min-h-screen flex-col items-center justify-between bg-black bg-opacity-50 p-24 ">
        <Tabs
          defaultValue="certificates"
          className="w-full bg-white p-6 rounded-md mx-auto shadow-md space-y-4"
        >
          <h1 className="text-2xl font-bold mb-4">SSL Certificate Issuer</h1>
          <TabsList>
            <TabsTrigger value="certificates">Your Certificates</TabsTrigger>
            <TabsTrigger value="auto">ACME Auto</TabsTrigger>
            <TabsTrigger value="client">ACME Client</TabsTrigger>
            <TabsTrigger value="sh">ACME.SH</TabsTrigger>
          </TabsList>
          <TabsContent value="certificates">
            <CertificatesList userId={session.user.id} />
          </TabsContent>
          <TabsContent value="auto">
            <IssueCertificateAutoForm />
          </TabsContent>
          <TabsContent value="client">
            <IssueCertificateForm />
          </TabsContent>
          <TabsContent value="sh">
            <IssueCertificateShForm />
          </TabsContent>
        </Tabs>
        <Toaster />
      </main>
      <Footer />
    </>
  );
}
