import { getDownloadUrl } from '@vercel/blob';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');

  if (!url) {
    return new NextResponse('Missing url parameter', { status: 400 });
  }

  try {
    // 1. Generate the short-lived signed download URL for the private blob
    const downloadUrl = await getDownloadUrl(url);

    // 2. Prepare headers for the upstream fetch, strictly forwarding the Range header
    // This is absolutely critical for iOS/Safari video playback
    const upstreamHeaders = new Headers();
    const range = request.headers.get('range');
    if (range) {
      upstreamHeaders.set('range', range);
    }

    // 3. Fetch the actual video stream from the storage bucket
    const upstreamRes = await fetch(downloadUrl, {
      headers: upstreamHeaders,
    });

    if (!upstreamRes.ok && upstreamRes.status !== 206) {
      console.error('Upstream fetch failed:', upstreamRes.status, upstreamRes.statusText);
      return new NextResponse('Error fetching from storage', { status: upstreamRes.status });
    }

    // 4. Sanitize the response headers
    const outHeaders = new Headers(upstreamRes.headers);
    
    // CRITICAL: Remove the attachment disposition so the browser plays it inline!
    outHeaders.delete('content-disposition');
    
    // Explicitly tell Safari that we support byte-range seeking
    outHeaders.set('accept-ranges', 'bytes');
    
    // Optional: add cache control if missing
    if (!outHeaders.has('cache-control')) {
      outHeaders.set('cache-control', 'public, max-age=3600');
    }

    // 5. Pipe the readable stream back to the client
    return new NextResponse(upstreamRes.body, {
      status: upstreamRes.status, // Will correctly pass 206 Partial Content
      headers: outHeaders,
    });
  } catch (error) {
    console.error('Error streaming blob:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
