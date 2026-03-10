import { NextResponse, type NextRequest } from "next/server";
import { checkDatabaseHealth } from "@/lib/db";
import { storage } from "@/lib/blob";

export const revalidate = 0; // Never cache Health status
export const fetchCache = "force-no-store";

export async function GET(_request: NextRequest) {
  // Execute checks in parallel mapping external network limits safely
  const [dbStatus, blobStats] = await Promise.allSettled([
    checkDatabaseHealth(),
    storage.getStorageStats().catch((e) => ({ error: e.message })),
  ]);

  const dbRes =
    dbStatus.status === "fulfilled" ? dbStatus.value : { healthy: false, error: "DB Timeout" };
  const blobRes = blobStats.status === "fulfilled" ? blobStats.value : { error: "Storage Timeout" };

  const isHealthy = dbRes.healthy && !("error" in blobRes);

  const payload = {
    healthy: isHealthy,
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
    version: process.env.npm_package_version || "0.1.0",
    database: dbRes,
    storage: blobRes,
  };

  return NextResponse.json(payload, { status: isHealthy ? 200 : 503 });
}
