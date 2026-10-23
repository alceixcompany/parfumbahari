import { CONTENT_SOURCE } from '@/lib/contentSource';
import { MAX_IMAGE_BYTES } from '@/lib/imageUpload';

export const runtime = 'nodejs';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[a-f0-9-]{36}$/.test(id)) return new Response(null, { status: 404 });
  if (CONTENT_SOURCE === 'static') return new Response(null, { status: 503 });
  const project = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!project || !apiKey) return new Response(null, { status: 503 });
  try {
    const result = await fetch(`https://firestore.googleapis.com/v1/projects/${project}/databases/(default)/documents/media/${id}?key=${apiKey}`, {
      cache: 'no-store', signal: AbortSignal.timeout(10000),
    });
    if (!result.ok) return new Response(null, { status: result.status === 404 ? 404 : 503 });
    const data = await result.json() as { fields?: { data?: { bytesValue?: string }; contentType?: { stringValue?: string } } };
    const contentType = data.fields?.contentType?.stringValue;
    const encoded = data.fields?.data?.bytesValue;
    if (!encoded || !['image/webp', 'image/jpeg'].includes(contentType || '') || encoded.length > Math.ceil(MAX_IMAGE_BYTES / 3) * 4) {
      return new Response(null, { status: 404 });
    }
    const bytes = Buffer.from(encoded, 'base64');
    const valid = contentType === 'image/webp'
      ? bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP'
      : bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
    if (!valid || bytes.length > MAX_IMAGE_BYTES) return new Response(null, { status: 404 });
    return new Response(bytes, { headers: {
      'Content-Type': contentType!,
      'Content-Length': String(bytes.length),
      'Cache-Control': 'public, max-age=86400, s-maxage=31536000, immutable',
      'X-Content-Type-Options': 'nosniff',
      'Content-Disposition': 'inline',
    } });
  } catch {
    return new Response(null, { status: 503, headers: { 'Retry-After': '5' } });
  }
}
