/* eslint-disable @typescript-eslint/no-explicit-any */
import { Loader2 } from "lucide-react";
import { Button, ButtonProps } from "./ui/button";
import { ReactNode, useState } from "react";
import { signIn } from "next-auth/react";
import { toast } from "@/hooks/use-toast";

type LoadingButtonProps = ButtonProps & {
  icon?: ReactNode;
  isLoading?: boolean;
  provider: string;
};

export const LoadingButton = ({
  children,
  provider,
  icon,
  isLoading = false,
}: LoadingButtonProps) => {
  const [loading, setLoading] = useState(isLoading);
  return (
    <Button
      onClick={async () => {
        try {
          setLoading(true);
          await signIn(provider, { callbackUrl: "/" });
        } catch (error: any) {
          toast(error.message);
        } finally {
          setLoading(false);
        }
      }}
      disabled={isLoading}
    >
      {loading ? <Loader2 className="animate-spin" /> : icon} {children}
    </Button>
  );
};
