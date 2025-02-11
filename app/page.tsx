import { getServerSession } from 'next-auth';
import { authOptions } from './api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import IssueCertificateForm from '@/components/IssueCertificateForm';

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/api/auth/signin');
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-8">SSL Certificate Generator</h1>
      <IssueCertificateForm />
    </div>
  );
}