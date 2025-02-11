import forge from "node-forge";

// Helper function to generate a CSR (Certificate Signing Request)
export async function generateCSR(domain, email) {
  const pki = forge.pki;

  const keys = pki.rsa.generateKeyPair(2048);
  const csr = pki.createCertificationRequest();
  csr.publicKey = keys.publicKey;
  csr.setSubject([
    { name: "commonName", value: domain },
    { name: "emailAddress", value: email },
  ]);
  csr.sign(keys.privateKey);

  return pki.certificationRequestToPem(csr);
}
