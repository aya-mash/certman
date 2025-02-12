"use client";

import Image from "next/image";
import { Button } from "./ui/button";
import { signOut } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Session } from "next-auth";
import { LoadingButton } from "./LoadingButton";
import { FaGithub, FaGoogle } from "react-icons/fa";

export const Header = async ({ session }: { session?: Session }) => {
  return (
    <header className="fixed p-2 top-0 w-full bg-background z-50">
      <div className="container mx-auto flex justify-between">
        <div className="flex items-center space-x-2">
          <Image
            src="/logo.png"
            width={200}
            height={60}
            alt="Foonda Logo"
            className="h-12 py-1 w-auto object-contain filter invert"
          />
          <h1 className="text-foreground text-3xl font-bold">CertMan</h1>
        </div>
        {session ? (
          <div className="flex items-center space-x-2">
            <Avatar>
              <AvatarImage src={session.user?.image ?? ""} />
              <AvatarFallback>
                {session.user?.name
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <p className="text-foreground">{session.user?.name}</p>
            <Button onClick={() => signOut()}>Sign out</Button>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <LoadingButton provider="google" icon={<FaGoogle />}>
              Sign in with Google
            </LoadingButton>
            <LoadingButton provider="github" icon={<FaGithub />}>
              Sign in with GitHub
            </LoadingButton>
          </div>
        )}
      </div>
    </header>
  );
};
