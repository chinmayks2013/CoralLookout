import { NextResponse } from "next/server";

export const runtime = "nodejs";

const MAX_BYTES = 12 * 1024 * 1024;
const FETCH_TIMEOUT_MS = 15_000;

function isBlockedHost(hostname: string): boolean {
  const host = hostname.toLowerCase();
  if (
    host === "localhost" ||
    host === "127.0.0.1" ||
    host === "0.0.0.0" ||
    host === "::1" ||
    host.endsWith(".local") ||
    host.endsWith(".internal")
  ) {
    return true;
  }
  // Block obvious private / link-local ranges
  if (/^10\./.test(host)) return true;
  if (/^192\.168\./.test(host)) return true;
  if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(host)) return true;
  if (/^169\.254\./.test(host)) return true;
  return false;
}

export async function POST(request: Request) {
  let body: { url?: unknown };
  try {
    body = (await request.json()) as { url?: unknown };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const raw = typeof body.url === "string" ? body.url.trim() : "";
  if (!raw) {
    return NextResponse.json({ error: "Missing image URL." }, { status: 400 });
  }

  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    return NextResponse.json({ error: "Invalid image URL." }, { status: 400 });
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return NextResponse.json(
      { error: "Only http(s) image URLs are allowed." },
      { status: 400 }
    );
  }

  if (isBlockedHost(parsed.hostname)) {
    return NextResponse.json(
      { error: "That image host is not allowed." },
      { status: 400 }
    );
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const upstream = await fetch(parsed.toString(), {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        Accept: "image/*,*/*;q=0.8",
        "User-Agent": "CoralLookoutImageFetch/1.0",
      },
    });

    if (!upstream.ok) {
      return NextResponse.json(
        { error: `Could not download image (${upstream.status}).` },
        { status: 502 }
      );
    }

    const contentType = (
      upstream.headers.get("content-type") || ""
    ).toLowerCase();
    const contentLength = Number(upstream.headers.get("content-length") || "0");
    if (contentLength > MAX_BYTES) {
      return NextResponse.json(
        { error: "Image is too large (max 12 MB)." },
        { status: 413 }
      );
    }

    const buffer = Buffer.from(await upstream.arrayBuffer());
    if (buffer.byteLength === 0) {
      return NextResponse.json({ error: "Empty image response." }, { status: 502 });
    }
    if (buffer.byteLength > MAX_BYTES) {
      return NextResponse.json(
        { error: "Image is too large (max 12 MB)." },
        { status: 413 }
      );
    }

    const sniff = buffer.subarray(0, 12);
    const isJpeg = sniff[0] === 0xff && sniff[1] === 0xd8;
    const isPng =
      sniff[0] === 0x89 &&
      sniff[1] === 0x50 &&
      sniff[2] === 0x4e &&
      sniff[3] === 0x47;
    const isGif =
      sniff[0] === 0x47 && sniff[1] === 0x49 && sniff[2] === 0x46;
    const isWebp =
      sniff[0] === 0x52 &&
      sniff[1] === 0x49 &&
      sniff[2] === 0x46 &&
      sniff[3] === 0x46 &&
      sniff[8] === 0x57 &&
      sniff[9] === 0x45 &&
      sniff[10] === 0x42 &&
      sniff[11] === 0x50;

    const looksLikeImage =
      contentType.startsWith("image/") || isJpeg || isPng || isGif || isWebp;

    if (!looksLikeImage) {
      return NextResponse.json(
        { error: "URL did not return an image. Try saving the photo and dropping the file." },
        { status: 415 }
      );
    }

    const mime = contentType.startsWith("image/")
      ? contentType.split(";")[0]!.trim()
      : isPng
        ? "image/png"
        : isWebp
          ? "image/webp"
          : isGif
            ? "image/gif"
            : "image/jpeg";

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": mime,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    const message =
      err instanceof Error && err.name === "AbortError"
        ? "Timed out downloading that image."
        : "Could not download that image (blocked or unavailable).";
    return NextResponse.json({ error: message }, { status: 502 });
  } finally {
    clearTimeout(timer);
  }
}
