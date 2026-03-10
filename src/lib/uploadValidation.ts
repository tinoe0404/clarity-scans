import { type HandleUploadBody } from "@vercel/blob/client";
import { BlobValidationError } from "./errors";
import {
  MAX_VIDEO_SIZE_BYTES,
  MAX_THUMBNAIL_SIZE_BYTES,
  ACCEPTED_VIDEO_TYPES,
  ACCEPTED_IMAGE_TYPES,
} from "./constants";
import { z } from "zod";

export interface ValidatedUploadMetadata {
  file: Buffer;
  mimeType: string;
  slug: string;
  locale?: string;
  title?: string;
  description?: string;
}

export type UploadValidationResult =
  | { valid: true; data: ValidatedUploadMetadata }
  | { valid: false; error: BlobValidationError };

// Pre-define boundaries handling the File uploads cleanly resolving Next.js stream variants identically
export async function validateUploadRequest(
  formData: FormData,
  type: "video" | "thumbnail"
): Promise<UploadValidationResult> {
  const file = formData.get("file") as File | null;
  const slug = formData.get("slug") as string | null;
  const locale = formData.get("locale") as string | null;

  // Optional metadata strings
  const title = formData.get("title") as string | null;
  const description = formData.get("description") as string | null;

  if (!file) {
    return {
      valid: false,
      error: new BlobValidationError("UPLOAD_FAILED", "No file found in request"),
    };
  }

  if (!slug) {
    return {
      valid: false,
      error: new BlobValidationError("UPLOAD_FAILED", "Missing slug identifier"),
    };
  }

  const acceptedTypes: readonly string[] =
    type === "video" ? ACCEPTED_VIDEO_TYPES : ACCEPTED_IMAGE_TYPES;
  const maxSize = type === "video" ? MAX_VIDEO_SIZE_BYTES : MAX_THUMBNAIL_SIZE_BYTES;

  if (!acceptedTypes.includes(file.type)) {
    return {
      valid: false,
      error: new BlobValidationError("INVALID_TYPE", `Accepted types: ${acceptedTypes.join(", ")}`),
    };
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: new BlobValidationError(
        "FILE_TOO_LARGE",
        `File exceeds maximum size of ${maxSize / (1024 * 1024)}MB`
      ),
    };
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const data: ValidatedUploadMetadata = {
      file: buffer,
      mimeType: file.type,
      slug,
    };
    if (locale) data.locale = locale;
    if (title) data.title = title;
    if (description) data.description = description;

    return {
      valid: true,
      data,
    };
  } catch (_err) {
    return {
      valid: false,
      error: new BlobValidationError(
        "UPLOAD_FAILED",
        "Failed to parse file chunks into Buffer seamlessly"
      ),
    };
  }
}

// Wrapper securing generic payload Webhooks against manual tampering bypassing generic Any loops natively
export function validateBlobWebhookPayload(body: unknown): body is HandleUploadBody {
  const webhookSchema = z
    .object({
      type: z.string(),
      payload: z.any(),
    })
    .passthrough();

  return webhookSchema.safeParse(body).success;
}
