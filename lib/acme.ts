import acme from "acme-client";

const ZEROSSL_EAB_KEY_ID = process.env.ZEROSSL_EAB_KEY_ID;
const ZEROSSL_EAB_HMAC_KEY = process.env.ZEROSSL_EAB_HMAC_KEY;

export const CA_DIRECTORY_URLS: Record<string, string> = {
  zeroSSL: "https://acme.zerossl.com/v2/DV90",
  letsEncrypt: "https://acme-v02.api.letsencrypt.org/directory",
};

export const getAcmeClient = async (domain: string, ca: string) => {
  if (!ZEROSSL_EAB_KEY_ID || !ZEROSSL_EAB_HMAC_KEY) {
    console.error("Missing ZeroSSL EAB credentials.");
    throw new Error("Server misconfiguration: ZeroSSL credentials missing.", {
      cause: 500,
    });
  }

  const [privateKey, csr] = await acme.crypto.createCsr({
    commonName: domain,
    altNames: [domain],
    keySize: 2048,
  });

  const client = new acme.Client({
    directoryUrl: CA_DIRECTORY_URLS[ca],
    accountKey: privateKey,
    ...(CA_DIRECTORY_URLS[ca] === "zerossl" && {
      externalAccountBinding: {
        kid: ZEROSSL_EAB_KEY_ID,
        hmacKey: ZEROSSL_EAB_HMAC_KEY,
      },
    }),
  });

  return { client, csr, privateKey };
};
