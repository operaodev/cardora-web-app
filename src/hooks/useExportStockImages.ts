import { useState, useCallback } from "react";
import { toPng } from "html-to-image";
import type { Stock } from "@/types/stock";

// ─── Fetch a remote image and return it as a base64 data URI ─────────────────
const fetchAsDataUri = async (url: string): Promise<string | null> => {
  try {
    const res = await fetch(url, { mode: "cors" });
    if (!res.ok) return null;
    const blob = await res.blob();
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
};

// ─── Pre-load all stock images as data URIs (keyed by stock id) ──────────────
const preloadImages = async (stocks: Stock[]): Promise<Map<number, string>> => {
  const map = new Map<number, string>();
  await Promise.all(
    stocks.map(async (stock) => {
      const { product } = stock;
      const rawUrl =
        product.type === "card" ? product.print_url_large : product.set_image_large;
      if (!rawUrl) return;
      const proxied = getProxiedImageUrl(rawUrl);
      const dataUri = await fetchAsDataUri(proxied);
      if (dataUri) {
        map.set(stock.id, dataUri);
      }
    })
  );
  return map;
};

// ─── CORS Proxy ───────────────────────────────────────────────────────────────
export const getProxiedImageUrl = (url: string): string => {
  if (!url) return "";
  if (
    url.startsWith("data:") ||
    url.startsWith("blob:") ||
    url.startsWith("/") ||
    url.includes("localhost") ||
    url.includes("127.0.0.1")
  ) {
    return url;
  }
  return `https://images.weserv.nl/?url=${encodeURIComponent(url)}`;
};

// ─── Grid columns calculator (max 4 cols × 3 rows = 12 cards per image) ────────────
const calcCols = (n: number): number => {
  if (n === 1) return 1;
  if (n <= 3) return n;   // 1×1, 2×1, 3×1
  if (n === 4) return 4;  // 4×1
  if (n <= 6) return 3;   // 3×2
  if (n <= 8) return 4;   // 4×2
  if (n === 9) return 3;  // 3×3
  return 4;               // 4×3 (10–12)
};

// ─── Build a standalone card HTML string (pure inline styles, no framework) ──
// resolvedImageUri: pre-fetched base64 data URI — avoids html-to-image re-fetching
const buildCardHtml = (stock: Stock, resolvedImageUri?: string): string => {
  const { product, quantity, is_for_sale, is_for_trade, price, discount_price, condition } = stock;
  const {
    name, lang, set_name, code, rarity, rarity_code, edition,
    type, set_type, set_code, set_region_code,
  } = product;

  const displayCondition = condition
    .replaceAll("_", " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
  const displayName = name + (type === "card" && code ? ` (${code})` : set_code ? ` (${set_region_code})` : "");
  const print = [rarity, rarity_code ? `(${rarity_code})` : null, edition ? `- ${edition}` : null].filter(Boolean).join(" ");
  const setInfo = type === "card" ? (set_name || "") : (set_type || "");
  const hasDiscount = discount_price > 0 && discount_price < price;

  const sellOpacity = is_for_sale ? "1" : "0.25";
  const tradeOpacity = is_for_trade ? "1" : "0.25";

  const priceHtml = hasDiscount
    ? `<span style="color:#1f2937;font-size:12px;font-weight:700;">${discount_price.toFixed(2)} PEN</span>
       <span style="color:#9ca3af;font-size:10px;text-decoration:line-through;margin-left:4px;">${price.toFixed(2)} PEN</span>`
    : `<span style="color:#1f2937;font-size:12px;font-weight:700;">${price.toFixed(2)} PEN</span>`;

  // Use pre-fetched data URI so html-to-image never needs to fetch externally
  const imgHtml = resolvedImageUri
    ? `<img src="${resolvedImageUri}" style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:contain;" />`
    : `<div style="position:absolute;top:0;left:0;width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:32px;color:#d1d5db;">🂠</div>`;

  const badgeStyle = `
    display:inline-flex;
    align-items:center;
    border:1.5px solid #6366f1;
    color:#6366f1;
    font-size:10px;
    font-weight:700;
    padding:3px 9px;
    border-radius:5px;
    line-height:1;
    white-space:nowrap;
  `;

  return `
<div style="
  width:220px;
  background:#ffffff;
  border:1px solid #e5e7eb;
  border-radius:12px;
  padding:14px;
  box-shadow:0 4px 12px rgba(0,0,0,0.08);
  display:flex;
  flex-direction:column;
  gap:10px;
  box-sizing:border-box;
  font-family:system-ui,-apple-system,Helvetica,sans-serif;
">
  <!-- Image -->
  <div style="position:relative;width:100%;height:290px;background:#f9fafb;border:1px solid #ececec;border-radius:8px;overflow:hidden;flex-shrink:0;">
    ${imgHtml}
  </div>

  <!-- Badges -->
  <div style="display:flex;gap:5px;flex-wrap:wrap;align-items:center;">
    <span style="${badgeStyle}">${(lang || "").toUpperCase()}</span>
    <span style="${badgeStyle}">${displayCondition}</span>
  </div>

  <!-- Meta -->
  <div style="display:flex;flex-direction:column;gap:5px;">
    <p style="margin:0;color:#6b7280;font-size:11px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${setInfo}</p>
    <p style="margin:0;color:#6366f1;font-size:10px;font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${print}</p>
    <h3 style="margin:0;color:#1f2937;font-size:12px;font-weight:700;line-height:1.45;word-break:break-word;">${displayName}</h3>
  </div>

  <!-- Footer -->
  <div style="border-top:1px solid #f0f0f0;padding-top:8px;margin-top:auto;display:flex;flex-direction:column;gap:6px;">
    <div style="display:flex;justify-content:flex-end;align-items:center;gap:4px;flex-wrap:wrap;">
      ${priceHtml}
    </div>
    <div style="display:flex;justify-content:space-between;align-items:center;">
      <div style="display:flex;gap:8px;align-items:center;">
        <img src="/game-icons--sell-card.svg" style="width:18px;height:18px;object-fit:contain;opacity:${sellOpacity};display:block;" />
        <img src="/game-icons--card-exchange.svg" style="width:18px;height:18px;object-fit:contain;opacity:${tradeOpacity};display:block;" />
      </div>
      <span style="color:#6b7280;font-size:11px;font-weight:600;">${quantity > 0 ? `x${quantity}` : "Sin stock"}</span>
    </div>
  </div>
</div>`;
};

// ─── Build a full isolated HTML page for a chunk ──────────────────────────────
const buildChunkHtml = (chunk: Stock[], cols: number, imageMap: Map<number, string>): string => {
  const cardWidth = 220;
  const gap = 16;
  const padding = 24;
  const totalWidth = cols * cardWidth + (cols - 1) * gap + padding * 2;

  // Each card gets its own pre-loaded data URI to prevent html-to-image deduplication
  const cardsHtml = chunk.map((stock) => buildCardHtml(stock, imageMap.get(stock.id))).join("\n");

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<style>
  *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
  html, body {
    background: #f3f4f6;
    width: ${totalWidth}px;
    font-family: system-ui, -apple-system, Helvetica, sans-serif;
  }
  body {
    padding: ${padding}px;
  }
  .grid {
    display: grid;
    grid-template-columns: repeat(${cols}, ${cardWidth}px);
    gap: ${gap}px;
  }
</style>
</head>
<body>
<div class="grid">
${cardsHtml}
</div>
</body>
</html>`;
};

// ─── Wait for all images inside an element to load ───────────────────────────
const waitForImages = (el: HTMLElement): Promise<void> => {
  const imgs = Array.from(el.querySelectorAll("img")) as HTMLImageElement[];
  return Promise.all(
    imgs.map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete && img.naturalWidth > 0) {
            resolve();
          } else {
            img.addEventListener("load", () => resolve());
            img.addEventListener("error", () => resolve());
          }
        })
    )
  ).then(() => undefined);
};

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useExportStockImages() {
  const [isExporting, setIsExporting] = useState(false);

  const exportImages = useCallback(async (selectedStocks: Stock[]) => {
    if (selectedStocks.length === 0) return;
    setIsExporting(true);

    try {
      // Pre-load ALL images as data URIs before building any HTML —
      // this prevents html-to-image from re-fetching and potentially mixing images
      const imageMap = await preloadImages(selectedStocks);

      // Chunk into groups of 12 (max 4×3 grid per image)
      const chunks: Stock[][] = [];
      for (let i = 0; i < selectedStocks.length; i += 12) {
        chunks.push(selectedStocks.slice(i, i + 12));
      }

      for (let idx = 0; idx < chunks.length; idx++) {
        const chunk = chunks[idx];
        const cols = calcCols(chunk.length);
        const html = buildChunkHtml(chunk, cols, imageMap);

        // Create isolated off-screen iframe
        const iframe = document.createElement("iframe");
        iframe.setAttribute("sandbox", "allow-same-origin allow-scripts");
        iframe.style.cssText =
          "position:fixed;left:-9999px;top:-9999px;width:3000px;height:6000px;border:none;visibility:hidden;";
        document.body.appendChild(iframe);

        // Write srcdoc and wait for load
        await new Promise<void>((resolve) => {
          iframe.onload = () => resolve();
          iframe.srcdoc = html;
        });

        const iframeDoc = iframe.contentDocument!;
        const body = iframeDoc.body;

        // Wait for product card images to fully load
        await waitForImages(body);
        // Extra tick for layout stabilization
        await new Promise((r) => setTimeout(r, 500));

        // Fit iframe to actual content size
        const contentWidth = body.scrollWidth;
        const contentHeight = body.scrollHeight;
        iframe.style.width = contentWidth + "px";
        iframe.style.height = contentHeight + "px";

        // Capture with html-to-image (no oklch parsing issues)
        const dataUrl = await toPng(body, {
          width: contentWidth,
          height: contentHeight,
          pixelRatio: 2, // 2x resolution for crisp output
          backgroundColor: "#f3f4f6",
          style: {
            margin: "0",
            padding: "24px",
          },
        });

        // Trigger download
        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = `inventario_cardora_parte_${idx + 1}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Cleanup iframe
        document.body.removeChild(iframe);
      }
    } catch (error) {
      console.error("Error exporting inventory images", error);
    } finally {
      setIsExporting(false);
    }
  }, []);

  return { exportImages, isExporting };
}
