/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { Formik, Form, FormikValues, FormikHelpers } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { toast } from "@/hooks/use-toast";
import { CopyableCode } from "./CopyableCode";
import FormikInputField from "./FormikInputField";
import FormikSelectField from "./FormikSelectField";

const domainRegex =
  /^(?!:\/\/)([a-zA-Z0-9-_]+\.)*[a-zA-Z0-9][a-zA-Z0-9-_]+\.[a-zA-Z]{2,11}$/;

const validationSchema = Yup.object({
  domain: Yup.string()
    .matches(domainRegex, "Invalid domain format")
    .required("Domain is required"),
  email: Yup.string()
    .email("Invalid email")
    .required("Email address is required"),
  challengeType: Yup.string()
    .required("Challenge Type is required")
    .oneOf(["http-01", "dns-01"]),
  ca: Yup.string()
    .required("Certificate Authority is required")
    .oneOf(["zeroSSL", "letsEncrypt"]),
});

type CertificateFormValues = {
  domain: string;
  email: string;
  challengeType: string;
  ca: string;
};

type KeyAuthorization = {
  key: string;
  token: string;
  orderId: string;
};

export default function CertificateForm() {
  const [keyAuthorization, setKeyAuthorization] = useState<
    KeyAuthorization | false
  >(false);
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [isFinalizing, setIsFinalizing] = useState<boolean>(false);

  const finalizeOrder = async (orderId: string, ca: string) => {
    if (!orderId || !ca) {
      toast({
        title: "Error",
        description: "Missing required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsFinalizing(true);

    try {
      const response = await axios.put(`/api/certificates/finalize`, {
        orderId,
        ca,
      });
      setIsVerified(true);
      toast({
        title: "Success",
        description: "Certificate issued successfully!",
        variant: "default",
      });
      return response.data.message;
    } catch (error: any) {
      console.error("Failed to finalize order:", error);
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to finalize order.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsFinalizing(false);
    }
  };

  const handleSubmit = async (
    values: FormikValues,
    { setSubmitting }: FormikHelpers<CertificateFormValues>
  ) => {
    try {
      const response = await axios.post("/api/certificates/order", values);
      toast({
        title: "Success",
        description: "Certificate request submitted!",
        variant: "default",
      });
      setKeyAuthorization({
        key: response.data?.keyAuthorization,
        token: response.data?.token,
        orderId: response.data?.orderId,
      });
    } catch (error: any) {
      console.error("Failed to issue certificate:", error);
      toast({
        title: "Error",
        description:
          error.response?.data?.error || "Failed to issue certificate.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="w-full bg-white p-8 rounded-xl shadow-lg">
      <Formik
        initialValues={{
          domain: "",
          email: "",
          challengeType: "",
          ca: "",
        }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, values, dirty, isValid }) => (
          <Form className="space-y-4">
            <FormikInputField
              name="domain"
              label="Domain"
              placeholder="example.com"
            />
            <FormikInputField
              name="email"
              label="Email Address"
              placeholder="admin@example.com"
            />

            <FormikSelectField
              name="challengeType"
              label="Challenge Type"
              options={[
                { label: "HTTP-01", value: "http-01" },
                { label: "DNS-01", value: "dns-01" },
              ]}
              placeholder="Select a challenge type"
            />

            <FormikSelectField
              name="ca"
              label="Certificate Authority"
              options={[
                { label: "ZeroSSL", value: "zeroSSL" },
                { label: "Let's Encrypt", value: "letsEncrypt" },
              ]}
              placeholder="Select a certificate authority"
            />

            <Button
              type="submit"
              disabled={isSubmitting || !isValid || !dirty}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              {isSubmitting ? "Submitting..." : "Issue Certificate"}
            </Button>

            {keyAuthorization && (
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-700">
                  Authorization Key
                </h3>
                <CopyableCode
                  title="Key Authorization: "
                  code={keyAuthorization.key}
                  details={
                    keyAuthorization.token &&
                    `Copy the Key Authorization below and create a file at: \n
                    http://${values.domain}/.well-known/acme-challenge/${keyAuthorization.token}\n
                    Paste the Key Authorization as the content of that file, then the system will detect verification automatically.`
                  }
                />
              </div>
            )}

            {keyAuthorization && (
              <Button
                onClick={async () => {
                  try {
                    await finalizeOrder(keyAuthorization.orderId, values.ca);
                  } catch (error) {
                    console.error("Error finalizing order:", error);
                  }
                }}
                disabled={!keyAuthorization.key || isFinalizing}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 mt-4"
              >
                {isFinalizing ? "Finalizing..." : "Finalize Order"}
              </Button>
            )}

            {isVerified && (
              <p className="mt-4 text-sm text-green-700">
                ✅ Your certificate has been successfully issued!
              </p>
            )}
          </Form>
        )}
      </Formik>
    </Card>
  );
}
