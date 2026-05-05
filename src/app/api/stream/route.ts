import { get } from '@vercel/blob';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');

  if (!url) {
    return new NextResponse('Missing url parameter', { status: 400 });
  }

  try {
    // Forward the Range header to support seeking and partial content
    const headers = new Headers();
    const range = request.headers.get('range');
    if (range) {
      headers.set('range', range);
    }

    const result = await get(url, {
      access: 'private',
      headers,
    });

    if (!result) {
      return new NextResponse('Blob not found', { status: 404 });
    }

    const outHeaders = new Headers();
    result.headers.forEach((value, key) => {
      outHeaders.set(key, value);
    });

    if (result.statusCode === 304) {
      return new NextResponse(null, { status: 304, headers: outHeaders });
    }

    // Determine correct status code based on Content-Range presence
    const isPartialContent = result.headers.has('content-range');
    const responseStatus = isPartialContent ? 206 : 200;

    return new NextResponse(result.stream, {
      status: responseStatus,
      headers: outHeaders,
    });
  } catch (error) {
    console.error('Error streaming blob:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
