// Claudecodeの使い手 のファビコン・OGP生成。
// モチーフ: Claude風ウォームオレンジのアスタリスク ＋ 5時間枠のゲージ（270°アーク）＋ ターミナルのカーソル
import sharp from "sharp";
import { mkdirSync, writeFileSync } from "fs";

mkdirSync("app", { recursive: true });
mkdirSync("public", { recursive: true });

const ORANGE = "#ea580c";
const ORANGE_L = "#fb923c";
const CLAY = "#b2583c";
const INK = "#1f1b16";

function asterisk(cx, cy, r, w, color) {
  const arms = [0, 45, 90, 135]
    .map((deg) => {
      const a = (deg * Math.PI) / 180;
      return `<line x1="${cx + r * Math.cos(a)}" y1="${cy + r * Math.sin(a)}" x2="${cx - r * Math.cos(a)}" y2="${cy - r * Math.sin(a)}"/>`;
    })
    .join("");
  return `<g stroke="${color}" stroke-width="${w}" stroke-linecap="round" fill="none">${arms}</g>`;
}

// 270°ゲージ（左下が起点、時計回り）。pct=0.9で「パンパン」
function gauge(cx, cy, r, w, pct) {
  const start = 135; // deg
  const sweep = 270;
  const arc = (deg0, deg1, color) => {
    const a0 = (deg0 * Math.PI) / 180;
    const a1 = (deg1 * Math.PI) / 180;
    const x0 = cx + r * Math.cos(a0), y0 = cy + r * Math.sin(a0);
    const x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
    const large = deg1 - deg0 > 180 ? 1 : 0;
    return `<path d="M${x0} ${y0} A${r} ${r} 0 ${large} 1 ${x1} ${y1}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round"/>`;
  };
  return arc(start, start + sweep, "rgba(255,255,255,0.28)") + arc(start, start + sweep * pct, "#ffffff");
}

const svg = `<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${ORANGE_L}"/>
      <stop offset="0.55" stop-color="${ORANGE}"/>
      <stop offset="1" stop-color="${CLAY}"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="112" fill="url(#bg)"/>
  ${gauge(256, 256, 178, 34, 0.9)}
  ${asterisk(252, 244, 90, 40, "#ffffff")}
  <!-- terminal cursor -->
  <rect x="326" y="336" width="30" height="40" rx="6" fill="#ffffff"/>
  <rect x="226" y="404" width="60" height="16" rx="8" fill="rgba(255,255,255,0.85)"/>
</svg>`;

const ogSvg = `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#fff4ea"/>
      <stop offset="1" stop-color="#fde7d2"/>
    </linearGradient>
    <linearGradient id="bar" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${ORANGE_L}"/>
      <stop offset="1" stop-color="${CLAY}"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="14" fill="url(#bar)"/>
  ${asterisk(1060, 120, 70, 26, "rgba(204,120,92,0.25)")}
  ${asterisk(760, 560, 40, 16, "rgba(234,88,12,0.25)")}
  ${asterisk(980, 520, 26, 10, "rgba(245,181,58,0.6)")}
  <g font-family="Hiragino Kaku Gothic ProN, Hiragino Sans, Noto Sans JP, sans-serif">
    <text x="80" y="150" font-size="30" font-weight="700" fill="${CLAY}" letter-spacing="4">MASTER OF CLAUDE CODE</text>
    <text x="80" y="250" font-size="74" font-weight="800" fill="${INK}" letter-spacing="-1">Claudecodeの使い手</text>
    <text x="80" y="330" font-size="34" font-weight="700" fill="${ORANGE}">5時間枠もトークン上限も、パンパンまで使い倒す。</text>
    <text x="80" y="398" font-size="25" fill="#5c5349">Claude Codeの日次消費量・稼働時間・推定トークン推移を可視化する</text>
    <text x="80" y="438" font-size="25" fill="#5c5349">ヘビーユーザー向けダッシュボード（連続上限到達・称号・Xシェア）</text>
  </g>
  <!-- bars -->
  <g>
    ${[0.8, 0.96, 0.9, 1, 0.92, 0.86, 1].map((v, i) => `<rect x="${80 + i * 44}" y="${585 - 100 * v}" width="30" height="${100 * v}" rx="6" fill="${v >= 1 ? CLAY : v >= 0.9 ? ORANGE : ORANGE_L}"/>`).join("")}
    <line x1="70" y1="485" x2="400" y2="485" stroke="#dc2626" stroke-width="3" stroke-dasharray="8 6"/>
    <text x="420" y="540" font-size="22" font-weight="700" fill="${CLAY}" font-family="Hiragino Kaku Gothic ProN, Hiragino Sans, Noto Sans JP, sans-serif">連続上限到達 12日 🔥</text>
  </g>
</svg>`;

async function main() {
  writeFileSync("app/icon.svg", svg);
  const base = () => sharp(Buffer.from(svg));
  await base().resize(32, 32).png().toFile("app/favicon.ico");
  await base().resize(512, 512).png().toFile("app/icon.png");
  await base().resize(180, 180).png().toFile("app/apple-icon.png");
  await base().resize(512, 512).png().toFile("public/icon-512.png");
  const mark = await base().resize(220, 220).png().toBuffer();
  await sharp(Buffer.from(ogSvg))
    .composite([{ input: mark, left: 930, top: 330 }])
    .png()
    .toFile("public/og.png");
  console.log("icons generated");
}

main();
