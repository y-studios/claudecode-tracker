import type { Metadata, Viewport } from "next";
import { Noto_Sans_JP, Outfit } from "next/font/google";
import "./globals.css";

const display = Outfit({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "700", "800"],
  display: "swap",
});

const body = Noto_Sans_JP({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
  display: "swap",
  preload: false,
});

const SITE_NAME = "Claudecodeの使い手";
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://claudecode.shindan.biz").replace(/\/$/, "");
const DESCRIPTION =
  "毎日の5時間枠・トークン消費上限をパンパンまで使い倒すヘビーユーザーのための、Claude Code日次消費量・稼働時間・トークン推移の可視化ダッシュボード。LocalStorageだけで動く完全無料ツール。";

export const metadata: Metadata = {
  title: {
    default: `${SITE_NAME}｜Claude Code消費量・稼働時間ダッシュボード`,
    template: `%s｜${SITE_NAME}`,
  },
  description: DESCRIPTION,
  applicationName: SITE_NAME,
  metadataBase: new URL(SITE_URL),
  alternates: { canonical: `${SITE_URL}${BASE_PATH}/` },
  keywords: ["Claude Code", "使用量", "レートリミット", "5時間", "トークン", "ダッシュボード", "稼働時間"],
  openGraph: {
    title: `${SITE_NAME}（Master of Claude Code）`,
    description: DESCRIPTION,
    type: "website",
    locale: "ja_JP",
    siteName: SITE_NAME,
    url: `${SITE_URL}${BASE_PATH}/`,
    images: [{ url: `${BASE_PATH}/og.png`, width: 1200, height: 630, alt: SITE_NAME }],
  },
  twitter: {
    card: "summary_large_image",
    images: [`${BASE_PATH}/og.png`],
    title: `${SITE_NAME}（Master of Claude Code）`,
    description: DESCRIPTION,
  },
};

export const viewport: Viewport = {
  themeColor: "#ea580c",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ja" className={`${display.variable} ${body.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
