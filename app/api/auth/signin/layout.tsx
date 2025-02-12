import Footer from "@/components/Footer";
import React, { ReactNode } from "react";

const AuthLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="flex pt-20 pb-4 justify-center bg-black bg-opacity-50">
      {children}
      <Footer />
    </div>
  );
};

export default AuthLayout;
