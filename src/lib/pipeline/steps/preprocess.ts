import sharp from "sharp";
import type { ImageMetrics } from "../types";

const MAX_EDGE = 512;

export async function preprocessImage(
  imageBuffer: Buffer
): Promise<{ buffer: Buffer; metrics: ImageMetrics }> {
  const pipeline = sharp(imageBuffer).rotate().resize(MAX_EDGE, MAX_EDGE, {
    fit: "inside",
    withoutEnlargement: true,
  });

  const { data, info } = await pipeline
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height } = info;
  let totalBrightness = 0;
  let whitePixels = 0;
  let colorVariance = 0;
  let greenSum = 0;
  let blueSum = 0;
  let samples = 0;
  const sampleStep = 4;

  for (let i = 0; i < data.length; i += 4 * sampleStep) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const brightness = (r + g + b) / 3;
    totalBrightness += brightness;

    if (brightness > 200 && Math.abs(r - g) < 30 && Math.abs(g - b) < 30) {
      whitePixels++;
    }

    greenSum += g;
    blueSum += b;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    colorVariance += max - min;
    samples++;
  }

  const metrics: ImageMetrics = {
    width,
    height,
    brightness: totalBrightness / samples,
    whiteness: whitePixels / samples,
    colorfulness: colorVariance / samples,
    greenRatio: greenSum / samples / 255,
    blueRatio: blueSum / samples / 255,
  };

  const normalized = await sharp(imageBuffer)
    .rotate()
    .resize(MAX_EDGE, MAX_EDGE, { fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 85 })
    .toBuffer();

  return { buffer: normalized, metrics };
}
