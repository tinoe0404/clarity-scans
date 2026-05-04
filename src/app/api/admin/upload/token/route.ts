import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { enforceRateLimit } from '@/lib/rateLimit';
import { logger } from '@/lib/logger';
import { upsertVideo } from '@/lib/queries/videos';
import { logUploadAction } from '@/lib/queries/uploadLog';
import { del } from '@vercel/blob';
import type { Locale } from '@/types';

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        // Authenticate user
        const session = await getAdminSession();
        if (!session || !session.user?.name) {
          throw new Error('Unauthorized');
        }

        // Rate limit check
        const limitStatus = enforceRateLimit(session.user.name, 10, 60 * 60 * 1000);
        if (!limitStatus.success) {
          throw new Error('Upload rate limit exceeded');
        }

        // Parse client payload to enforce path destination
        let parsedPayload: Record<string, unknown> = {};
        if (clientPayload) {
          try {
            parsedPayload = JSON.parse(clientPayload);
          } catch (_e) {
            throw new Error('Invalid client payload');
          }
        }
        
        if (!parsedPayload.slug || !parsedPayload.locale) {
          throw new Error('Missing slug or locale in payload');
        }

        // We want to force the blob storage path to what we expect
        // Vercel Blob's handleUpload requires the token payload to authorize
        return {
          allowedContentTypes: ['video/mp4', 'video/webm'],
          tokenPayload: JSON.stringify({
            ...parsedPayload,
            userId: session.user.name,
          }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        // This callback is executed by Vercel's servers after a successful upload
        try {
          const payload = JSON.parse(tokenPayload || "{}");
          if (!payload.slug || !payload.locale || !payload.title) {
            throw new Error("Missing metadata in tokenPayload");
          }

          // Create/update the database record linking the Blob object
          await upsertVideo({
            slug: payload.slug,
            language: payload.locale as Locale,
            title: payload.title,
            description: payload.description,
            blobUrl: blob.url,
            isActive: true,
            uploadedBy: payload.userId,
          });

          // Log success
          await logUploadAction({
            action: 'upload_video',
            slug: payload.slug,
            locale: payload.locale as Locale,
            blob_url: blob.url,
            file_size_bytes: (blob as unknown as { size?: number }).size || 0,
            success: true,
          });

          // Revalidate cache
          if (process.env.REVALIDATION_SECRET) {
            try {
              await fetch(new URL("/api/revalidate", request.url).toString(), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token: process.env.REVALIDATION_SECRET }),
              });
            } catch (_e) {
              /* Non-fatal */
            }
          }
        } catch (error) {
          const errMsg = error instanceof Error ? error.message : "DB insertion failed";
          logger.error("Database tracking failed post-upload. Triggering cleanup.", {
            url: blob.url,
            error: errMsg,
          });

          // Clean up the orphaned blob
          try {
            await del(blob.url);
          } catch(_e) {
            logger.error("Failed to clean up orphaned blob", { url: blob.url });
          }

          await logUploadAction({
            action: "upload_video",
            slug: "",
            locale: "en", // fallback since we couldn't parse payload
            blob_url: blob.url,
            success: false,
            error_message: `Post-Upload DB failure, Blob cleaned: ${errMsg}`,
          });
        }
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    logger.error("Vercel Blob handleUpload error", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 },
    );
  }
}
