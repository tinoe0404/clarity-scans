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

    // 4. Sanitize the response headers by strictly whitelisting safe video streaming headers.
    // Blindly copying all upstream headers can include 'content-encoding: gzip' or 'transfer-encoding: chunked'
    // which completely corrupts the binary video stream in the browser and causes "No supported sources" errors.
    const outHeaders = new Headers();
    
    const safeHeaders = [
      'content-type',
      'content-length',
      'content-range',
      'accept-ranges',
      'etag',
      'last-modified'
    ];

    safeHeaders.forEach((header) => {
      const val = upstreamRes.headers.get(header);
      if (val !== null && val !== undefined) {
        outHeaders.set(header, val);
      }
    });
    
    // Explicitly guarantee stream capabilities
    outHeaders.set('accept-ranges', 'bytes');
    outHeaders.set('cache-control', 'public, max-age=3600');

    // Guarantee Content-Type exists
    if (!outHeaders.has('content-type')) {
      const ext = url.split('.').pop()?.toLowerCase();
      const cType = ext === 'webm' ? 'video/webm' : ext === 'mov' ? 'video/quicktime' : 'video/mp4';
      outHeaders.set('content-type', cType);
    }

    // Ensure status code matches headers
    let status = upstreamRes.status;
    if (status === 206 && !outHeaders.has('content-range')) {
      status = 200; // Correct it if the upstream lied
    } else if (status === 200 && outHeaders.has('content-range')) {
      status = 206; 
    }

    // 5. Pipe the readable stream back to the client
    return new NextResponse(upstreamRes.body, {
      status: status,
      headers: outHeaders,
    });
  } catch (error) {
    console.error('Error streaming blob:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
