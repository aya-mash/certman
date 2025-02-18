import { Loader2 } from "lucide-react";
import Image from "next/image";

const Fallback = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[100vh] px-4 text-center">
      <Image src="/logo.png" width={300} height={300} alt="AM Logo" />
      <div className="mb-4 text-2xl font-bold text-white">Loading...</div>
      <Loader2 className="animate-spin text-white" />
    </div>
  );
};

export default Fallback;
