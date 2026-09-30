import { Router } from "express";
import sharp from "sharp";
import { aiLimiter, requireAuthOrToken } from "../middleware.js";

const router = Router();

interface ExportThumbnailRequest {
  imageUrl?: string;
  overlayText?: string;
  textColor?: string;
  pillColor?: string;
  textSize?: number;
  fontFamily?: "Anton" | "Bebas Neue" | "Montserrat" | string;
  layoutZone?: "left" | "right" | "top" | string;
}

/**
 * Escapes XML special characters for safe SVG insertion.
 */
function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * POST /api/export/thumbnail
 * Bakes high-contrast Anton/Bebas Neue typography onto the 16:9 thumbnail background using Sharp.
 */
router.post("/thumbnail", aiLimiter, requireAuthOrToken, async (req, res) => {
  const {
    imageUrl,
    overlayText = "MUST WATCH",
    textColor = "#FFE600",
    pillColor = "rgba(0,0,0,0.84)",
    textSize = 72,
    fontFamily = "Anton",
    layoutZone = "left",
  } = (req.body || {}) as ExportThumbnailRequest;

  if (!imageUrl || typeof imageUrl !== "string") {
    return res.status(400).json({ error: "Missing 'imageUrl' in request body." });
  }

  try {
    let imageBuffer: Buffer;

    // 1. Resolve image source: Base64 data URL vs HTTP URL
    if (imageUrl.startsWith("data:")) {
      const match = imageUrl.match(/^data:[^;]+;base64,(.+)$/);
      if (!match || !match[1]) {
        return res.status(400).json({ error: "Invalid base64 data URL format." });
      }
      imageBuffer = Buffer.from(match[1], "base64");
    } else {
      const fetchResp = await fetch(imageUrl, { signal: AbortSignal.timeout(15000) });
      if (!fetchResp.ok) {
        throw new Error(`Failed to fetch source image from URL: ${fetchResp.statusText}`);
      }
      const arrayBuf = await fetchResp.arrayBuffer();
      imageBuffer = Buffer.from(arrayBuf);
    }

    // 2. Prepare words & multi-line text
    const cleanText = overlayText.trim();
    const words = cleanText.split(/\s+/).filter(Boolean);
    let line1 = cleanText;
    let line2 = "";

    if (words.length >= 3) {
      const mid = Math.ceil(words.length / 2);
      line1 = words.slice(0, mid).join(" ");
      line2 = words.slice(mid).join(" ");
    } else if (words.length === 2) {
      line1 = words[0];
      line2 = words[1];
    }

    const safeLine1 = escapeXml(line1.toUpperCase());
    const safeLine2 = escapeXml(line2.toUpperCase());
    const safeFont = fontFamily === "Bebas Neue" ? "Bebas Neue" : fontFamily === "Montserrat" ? "Montserrat" : "Anton";

    // 3. Calculate positioning based on layoutZone
    const isRight = layoutZone === "right" || layoutZone === "top-right" || layoutZone === "bottom-right";
    const isTop = layoutZone === "top";

    const anchorX = isRight ? 1200 : isTop ? 640 : 80;
    const textAnchor = isRight ? "end" : isTop ? "middle" : "start";
    const startY = 160;
    const lineHeight = Math.round(textSize * 1.05);

    // 4. Construct SVG Overlay
    const svgOverlay = `
    <svg width="1280" height="720" viewBox="0 0 1280 720" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Anton&amp;family=Bebas+Neue&amp;family=Montserrat:wght@900&amp;display=swap');
          .txt-stroke {
            font-family: '${safeFont}', Impact, sans-serif;
            font-size: ${textSize}px;
            font-weight: 900;
            stroke: #000000;
            stroke-width: 14px;
            stroke-linejoin: round;
            stroke-linecap: round;
            text-anchor: ${textAnchor};
          }
          .txt-fill-1 {
            font-family: '${safeFont}', Impact, sans-serif;
            font-size: ${textSize}px;
            font-weight: 900;
            fill: ${line2 ? "#FFFFFF" : textColor};
            text-anchor: ${textAnchor};
          }
          .txt-fill-2 {
            font-family: '${safeFont}', Impact, sans-serif;
            font-size: ${textSize}px;
            font-weight: 900;
            fill: ${textColor};
            text-anchor: ${textAnchor};
          }
        </style>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000000" flood-opacity="0.9" />
        </filter>
      </defs>

      <g filter="url(#shadow)">
        <!-- Line 1 Stroke & Fill -->
        <text x="${anchorX}" y="${startY}" class="txt-stroke">${safeLine1}</text>
        <text x="${anchorX}" y="${startY}" class="txt-fill-1">${safeLine1}</text>

        ${
          line2
            ? `
        <!-- Line 2 Stroke & Fill -->
        <text x="${anchorX}" y="${startY + lineHeight}" class="txt-stroke">${safeLine2}</text>
        <text x="${anchorX}" y="${startY + lineHeight}" class="txt-fill-2">${safeLine2}</text>
        `
            : ""
        }
      </g>
    </svg>`;

    // 5. Composite image using Sharp
    const compositeBuffer = await sharp(imageBuffer)
      .resize(1280, 720, { fit: "cover", position: "center" })
      .composite([
        {
          input: Buffer.from(svgOverlay),
          top: 0,
          left: 0,
        },
      ])
      .jpeg({ quality: 94 })
      .toBuffer();

    // Check if client expects binary image or JSON data URL
    const acceptHeader = req.headers["accept"] || "";
    if (acceptHeader.includes("image/") || req.query.format === "binary") {
      res.setHeader("Content-Type", "image/jpeg");
      res.setHeader("Content-Disposition", 'attachment; filename="wavelength-thumbnail-baked.jpg"');
      return res.send(compositeBuffer);
    }

    const base64Data = `data:image/jpeg;base64,${compositeBuffer.toString("base64")}`;
    return res.json({
      success: true,
      imageUrl: base64Data,
      width: 1280,
      height: 720,
      format: "jpeg",
    });
  } catch (err: any) {
    console.error("Thumbnail export compositing error:", err);
    return res.status(500).json({ error: `Failed to composite thumbnail image: ${err?.message || err}` });
  }
});

export default router;
