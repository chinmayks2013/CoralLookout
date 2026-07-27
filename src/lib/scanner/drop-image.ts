/** Extract an image File from drag-and-drop or clipboard (disk files or web images). */

const IMAGE_EXT = /\.(jpe?g|png|webp|gif|bmp|heic|avif)$/i;

function guessMime(name: string): string {
  const lower = name.toLowerCase();
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".gif")) return "image/gif";
  if (lower.endsWith(".bmp")) return "image/bmp";
  if (lower.endsWith(".avif")) return "image/avif";
  return "image/jpeg";
}

function filenameFromUrl(url: string, mime: string): string {
  try {
    const path = new URL(url, "https://example.com").pathname;
    const base = path.split("/").pop();
    if (base && IMAGE_EXT.test(base)) return decodeURIComponent(base);
  } catch {
    /* ignore */
  }
  const ext = mime.includes("png")
    ? "png"
    : mime.includes("webp")
      ? "webp"
      : mime.includes("gif")
        ? "gif"
        : "jpg";
  return `dropped-image.${ext}`;
}

function isLikelyImageFile(file: File): boolean {
  if (file.type.startsWith("image/")) return true;
  if (!file.type && IMAGE_EXT.test(file.name)) return true;
  return false;
}

function ensureImageFile(file: File): File {
  if (file.type.startsWith("image/")) return file;
  return new File([file], file.name || "dropped-image.jpg", {
    type: guessMime(file.name || "dropped-image.jpg"),
  });
}

function extractUrlsFromHtml(html: string): string[] {
  const urls: string[] = [];
  const imgSrc = /<img[^>]+src=["']([^"']+)["']/gi;
  let match: RegExpExecArray | null;
  while ((match = imgSrc.exec(html))) {
    urls.push(match[1]);
  }
  return urls;
}

function collectDropUrls(dt: DataTransfer): string[] {
  const urls: string[] = [];
  const seen = new Set<string>();

  const push = (raw: string) => {
    const url = raw.trim();
    if (!url || url.startsWith("#") || seen.has(url)) return;
    if (
      url.startsWith("data:image/") ||
      /^https?:\/\//i.test(url) ||
      url.startsWith("blob:")
    ) {
      seen.add(url);
      urls.push(url);
    }
  };

  // Must read getData synchronously during the drop/paste event —
  // browsers clear DataTransfer after the handler returns.
  try {
    const uriList = dt.getData("text/uri-list");
    if (uriList) {
      for (const line of uriList.split(/\r?\n/)) push(line);
    }
  } catch {
    /* ignore */
  }

  try {
    const html = dt.getData("text/html");
    if (html) {
      for (const src of extractUrlsFromHtml(html)) push(src);
    }
  } catch {
    /* ignore */
  }

  try {
    const plain = dt.getData("text/plain");
    if (plain) push(plain);
  } catch {
    /* ignore */
  }

  return urls;
}

export type DropImageSnapshot = {
  files: File[];
  urls: string[];
};

/** Snapshot drop/paste payload immediately (before DataTransfer is cleared). */
export function snapshotDataTransfer(dt: DataTransfer): DropImageSnapshot {
  const files: File[] = [];

  if (dt.files?.length) {
    for (const file of Array.from(dt.files)) {
      if (isLikelyImageFile(file)) files.push(ensureImageFile(file));
    }
  }

  if (!files.length && dt.items?.length) {
    for (const item of Array.from(dt.items)) {
      if (item.kind !== "file") continue;
      const file = item.getAsFile();
      if (file && isLikelyImageFile(file)) files.push(ensureImageFile(file));
    }
  }

  return {
    files,
    urls: collectDropUrls(dt),
  };
}

async function fileFromImageUrl(url: string): Promise<File | null> {
  if (url.startsWith("data:image/") || url.startsWith("blob:")) {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      if (!blob.size) return null;
      const type = blob.type.startsWith("image/") ? blob.type : "image/jpeg";
      return new File([blob], filenameFromUrl(url, type), { type });
    } catch {
      return null;
    }
  }

  if (!/^https?:\/\//i.test(url)) return null;

  try {
    const res = await fetch(url, { mode: "cors", credentials: "omit" });
    if (res.ok) {
      const blob = await res.blob();
      const type = blob.type.startsWith("image/")
        ? blob.type
        : guessMime(filenameFromUrl(url, "image/jpeg"));
      if (type.startsWith("image/") && blob.size > 0) {
        return new File([blob], filenameFromUrl(url, type), { type });
      }
    }
  } catch {
    /* CORS — use proxy */
  }

  try {
    const proxy = await fetch("/api/scanner/fetch-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
    if (!proxy.ok) return null;
    const blob = await proxy.blob();
    if (!blob.size) return null;
    const type = blob.type.startsWith("image/") ? blob.type : "image/jpeg";
    return new File([blob], filenameFromUrl(url, type), { type });
  } catch {
    return null;
  }
}

/** True when the drag payload may contain an image (file or web URL). */
export function isImageDrag(dt: DataTransfer): boolean {
  const types = Array.from(dt.types);
  if (types.includes("Files")) return true;
  if (types.includes("text/uri-list")) return true;
  if (types.includes("text/html")) return true;
  if (types.some((t) => t.startsWith("image/"))) return true;
  if (types.includes("text/plain")) return true;
  return false;
}

/** Resolve the best image File from a synchronous drop/paste snapshot. */
export async function fileFromDropSnapshot(
  snapshot: DropImageSnapshot
): Promise<File | null> {
  if (snapshot.files[0]) return snapshot.files[0];

  for (const url of snapshot.urls) {
    const file = await fileFromImageUrl(url);
    if (file) return file;
  }

  return null;
}

/** @deprecated Prefer snapshotDataTransfer + fileFromDropSnapshot during drop handlers. */
export async function fileFromDataTransfer(
  dt: DataTransfer
): Promise<File | null> {
  return fileFromDropSnapshot(snapshotDataTransfer(dt));
}
