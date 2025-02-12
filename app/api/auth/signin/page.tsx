"use client";

import Image from "next/image";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingButton } from "@/components/LoadingButton";
import { FaGoogle, FaGithub } from "react-icons/fa";

const Page = () => {
  return (
    <Card className="flex flex-col items-center justify-center bg-background p-6">
      <CardHeader className="flex flex-col space-y-6">
        <CardTitle className="text-center text-3xl">
          Welcome to CertMan
        </CardTitle>
        <Image
          src="/logo.png"
          width={300}
          height={300}
          alt="Foonda Logo"
          className="w-auto object-contain filter invert"
        />
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center gap-4">
        <LoadingButton provider="google" icon={<FaGoogle />}>
          Sign in with Google
        </LoadingButton>
        <LoadingButton provider="github" icon={<FaGithub />}>
          Sign in with GitHub
        </LoadingButton>
      </CardContent>
    </Card>
  );
};

export default Page;
