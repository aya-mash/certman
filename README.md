# SSL Certificate Issuer with ZeroSSL

This project automates the process of issuing SSL certificates using the ZeroSSL ACME API. It provides a user-friendly interface for generating certificates and supports both HTTP-01 and DNS-based challenges. Built with Next.js, TypeScript, and the acme-client library, this tool simplifies the process of securing your domains with SSL/TLS certificates.

## Features

- **Automatic Certificate Issuance**: Uses ZeroSSL's ACME API to issue SSL certificates.
- **HTTP-01 Challenge Support**: Automatically handles HTTP-01 challenges for domain validation.
- **Skip Challenge Option**: Supports skipping challenges for DNS-based validation or pre-configured setups.
- **User-Friendly Interface**: A simple web interface for issuing certificates.
- **Secure Storage**: Stores private keys and certificates securely in a MongoDB database.

## Prerequisites

Before you begin, ensure you have the following:

- Node.js (v18 or higher)
- A ZeroSSL account with EAB credentials
- A MongoDB database (local or cloud-based, e.g., MongoDB Atlas)
- Environment variables configured (see Environment Variables)

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/ssl-certificate-issuer.git
   cd ssl-certificate-issuer
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up the database:

   - Update the MongoDB connection string in the `.env` file (see Environment Variables).
   - Ensure your MongoDB server is running.

4. Configure environment variables (see Environment Variables).

5. Start the development server:

   ```bash
   npm run dev
   ```

## Environment Variables

Create a `.env` file in the root directory and add the following variables:

```env
# MongoDB
MONGODB_URI="mongodb://localhost:27017/ssl_certificates"

# ZeroSSL
ZEROSSL_EAB_KEY_ID="your-zerossl-eab-key-id"
ZEROSSL_EAB_HMAC_KEY="your-zerossl-eab-hmac-key"

# NextAuth
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

## Usage

### 1. Issue a Certificate

- Open the application in your browser (`http://localhost:3000`).
- Enter the domain and email address.
- Choose whether to skip the challenge (for DNS-based validation).
- Click **Issue Certificate**.

### 2. Handle HTTP-01 Challenge (if not skipped)

- Copy the `keyAuthorization` value displayed on the screen.
- Create a file at the specified URL (e.g., `http://example.com/.well-known/acme-challenge/<token>`).
- Paste the `keyAuthorization` as the content of the file.
- The system will automatically verify the challenge and issue the certificate.

### 3. Download Certificate

Once the certificate is issued, it will be displayed on the screen. You can copy it or download it for use on your server.

## API Endpoints

### `POST /api/certificates/order`

Issues a new SSL certificate.

**Request Body:**

```json
{
  "domain": "example.com",
  "email": "admin@example.com",
  "skipChallenge": false
}
```

**Response:**

```json
{
  "message": "Certificate issued successfully!",
  "certificate": "-----BEGIN CERTIFICATE-----..."
}
```

### `GET /api/certificates/keyAuthorization`

Fetches the keyAuthorization for a domain.

**Query Parameters:**

- `domain`: The domain to fetch the keyAuthorization for.

**Response:**

```json
{
  "keyAuthorization": "key-auth-value",
  "token": "challenge-token"
}
```

## Technologies Used

### Frontend:

- Next.js
- React
- TailwindCSS

### Backend:

- Next.js API Routes
- `acme-client`

### Database:

- MongoDB

### Authentication:

- NextAuth.js

### Deployment:

- Vercel (optional)

## Dependencies

- `@heroicons/react` `^2.2.0`
- `@next-auth/prisma-adapter` `^1.0.7`
- `@prisma/client` `^6.3.1`
- `@radix-ui/react-avatar` `^1.1.3`
- `@radix-ui/react-checkbox` `^1.1.4`
- `@radix-ui/react-select` `^2.1.6`
- `@radix-ui/react-slot` `^1.1.2`
- `@radix-ui/react-tabs` `^1.1.3`
- `@radix-ui/react-toast` `^1.2.6`
- `acme-client` `^5.4.0`
- `autoprefixer` `^10.4.20`
- `axios` `^1.7.9`
- `class-variance-authority` `^0.7.1`
- `clsx` `^2.1.1`
- `lucide-react` `^0.475.0`
- `mongodb` `^6.13.0`
- `next` `15.1.7`
- `next-auth` `^4.24.11`
- `node-forge` `^1.3.1`
- `prisma` `^6.3.1`
- `react` `^19.0.0`
- `react-dom` `^19.0.0`
- `react-icons` `^5.4.0`
- `tailwind-merge` `^3.0.1`
- `tailwindcss-animate` `^1.0.7`

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/your-feature`).
3. Commit your changes (`git commit -m 'Add some feature'`).
4. Push to the branch (`git push origin feature/your-feature`).
5. Open a pull request.

## License

This project is licensed under the MIT License. See the LICENSE file for details.

## Acknowledgments

- **ZeroSSL** for providing free SSL certificates.
- **acme-client** for simplifying ACME protocol interactions.
- **Next.js** for the awesome framework.

## Support

If you encounter any issues or have questions, please open an issue.

Enjoy securing your domains with ease! 🚀
