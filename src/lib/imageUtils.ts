export function generateBlurPlaceholder(width: number, height: number, color: string): string {
  const svg = `
    <svg width="${width}" height="${height}" version="1.1" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="blur" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="20" />
        </filter>
      </defs>
      <rect width="100%" height="100%" fill="${color}" filter="url(#blur)" />
    </svg>
  `;
  
  if (typeof window === "undefined") {
    const toBase64 = (str: string) => Buffer.from(str).toString("base64");
    return `data:image/svg+xml;base64,${toBase64(svg)}`;
  } else {
    const toBase64 = (str: string) => window.btoa(str);
    return `data:image/svg+xml;base64,${toBase64(svg)}`;
  }
}
