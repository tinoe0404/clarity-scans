import bcrypt from "bcryptjs";

/**
 * Hashes a plaintext password using bcrypt with 12 rounds.
 */
export async function hashPassword(plaintext: string): Promise<string> {
  const salt = await bcrypt.genSalt(12);
  return await bcrypt.hash(plaintext, salt);
}

/**
 * Verifies a plaintext password against a bcrypt hash.
 */
export async function verifyPassword(plaintext: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(plaintext, hash);
}

// Standalone script execution
if (require.main === module) {
  const password = process.argv[2];

  if (!password) {
    console.error("Usage: npx tsx src/lib/hashPassword.ts <password>");
    process.exit(1);
  }

  hashPassword(password)
    .then((hash) => {
      console.log("\n--------------------------------------------------");
      console.log("BCRYPT HASH GENERATED SUCCESSFULLY");
      console.log("--------------------------------------------------");
      console.log(hash);
      console.log("--------------------------------------------------");
      console.log("\nINSTRUCTIONS:");
      console.log("1. Copy the hash above.");
      console.log("2. Set it as ADMIN_PASSWORD_HASH in your .env.local file.");
      console.log("3. Never store the plaintext password in your codebase.\n");
    })
    .catch((err) => {
      console.error("Error generating hash:", err);
      process.exit(1);
    });
}
