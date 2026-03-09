# Radiographer Dashboard Setup & Authentication

This guide explains how to set up and test the authentication system for the radiographer dashboard.

## 1. Prerequisites

Ensure you have the following environment variables in your `.env.local` file:

- `NEXTAUTH_SECRET`: A secure 32-character string.
- `NEXTAUTH_URL`: Your application's base URL.
- `ADMIN_USERNAME`: The username for dashboard access.
- `ADMIN_PASSWORD_HASH`: The bcrypt hash of your admin password.

## 2. Generate NEXTAUTH_SECRET

You can generate a secure secret using openssl:

```bash
openssl rand -base64 32
```

Add the output to your `.env.local`:
```text
NEXTAUTH_SECRET=your_generated_secret_here
NEXTAUTH_URL=http://localhost:3000
```

## 3. Generate ADMIN_PASSWORD_HASH

Use the provided utility script to generate a bcrypt hash for your password:

```bash
npx tsx src/lib/hashPassword.ts yourpasswordhere
```

**Instructions:**
1. Run the command above with your desired password.
2. Copy the resulting hash.
3. Add it to your `.env.local`:
   ```text
   ADMIN_USERNAME=hospital_admin
   ADMIN_PASSWORD_HASH=$2b$12$...your_hash_here...
   ```

## 4. Testing Locally

1. Start the development server:
   ```bash
   npm run dev
   ```
2. Visit `http://localhost:3000/admin`.
3. You should be redirected to `http://localhost:3000/admin/login`.
4. Enter the `ADMIN_USERNAME` and the plaintext password you hashed earlier.
5. On success, you will be redirected back to the dashboard.

## 5. Deployment

When deploying to Vercel:
1. Copy all auth-related environment variables to the Vercel Dashboard.
2. Ensure `NEXTAUTH_URL` is set to your production domain (e.g., `https://your-app.vercel.app`).
3. Vercel handles `httpOnly` cookies and secure flags automatically for HTTPS.
