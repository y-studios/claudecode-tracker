"use client";

import { motion } from "framer-motion";
import { useId, type CSSProperties } from "react";

export type BuddyMood = "happy" | "fire" | "party" | "sleepy" | "cool" | "wink";
export type BuddyProp = "none" | "terminal" | "flag" | "trophy" | "coffee" | "megaphone" | "chart";

interface Props {
  size?: number;
  mood?: BuddyMood;
  prop?: BuddyProp;
  float?: boolean;
  className?: string;
  style?: CSSProperties;
  /** 体色のバリエーション */
  tone?: "orange" | "clay" | "gold";
}

const TONES = {
  orange: { a: "#fb923c", b: "#ea580c", dark: "#9a3412", cheek: "#fecaca" },
  clay: { a: "#e08a6c", b: "#cc785c", dark: "#8a3f26", cheek: "#fecaca" },
  gold: { a: "#fbbf24", b: "#f59e0b", dark: "#92400e", cheek: "#fecaca" },
};

/**
 * ターミナルを抱えた可愛いClaudeキャラクター（オリジナルデザインのインラインSVG）。
 * 丸みのある体＋アスタリスクのアンテナ＋表情・小道具バリエーション。
 */
export function ClaudeBuddy({
  size = 120,
  mood = "happy",
  prop = "none",
  float = false,
  className,
  style,
  tone = "orange",
}: Props) {
  const t = TONES[tone];
  const id = `cb${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const svg = (
    <svg
      viewBox="0 0 120 120"
      width={size}
      height={size}
      className={className}
      style={style}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={`${id}-body`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={t.a} />
          <stop offset="1" stopColor={t.b} />
        </linearGradient>
        <radialGradient id={`${id}-shine`} cx="0.3" cy="0.25" r="0.6">
          <stop offset="0" stopColor="#fff" stopOpacity="0.55" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* shadow */}
      <ellipse cx="60" cy="112" rx="30" ry="5" fill="#000" opacity="0.08" />

      {/* antenna asterisk */}
      <g transform="translate(60 14)" stroke={t.dark} strokeWidth="3.2" strokeLinecap="round">
        <line x1="-7" y1="0" x2="7" y2="0" />
        <line x1="0" y1="-7" x2="0" y2="7" />
        <line x1="-5" y1="-5" x2="5" y2="5" />
        <line x1="-5" y1="5" x2="5" y2="-5" />
      </g>
      <line x1="60" y1="20" x2="60" y2="30" stroke={t.dark} strokeWidth="3" strokeLinecap="round" />

      {/* arms (behind body) */}
      {prop === "none" || prop === "megaphone" ? (
        <>
          <ellipse cx="22" cy="78" rx="9" ry="6" fill={t.b} transform="rotate(-25 22 78)" />
          <ellipse cx="98" cy="78" rx="9" ry="6" fill={t.b} transform="rotate(25 98 78)" />
        </>
      ) : null}

      {/* body */}
      <rect x="22" y="30" width="76" height="76" rx="28" fill={`url(#${id}-body)`} />
      <rect x="22" y="30" width="76" height="76" rx="28" fill={`url(#${id}-shine)`} />

      {/* feet */}
      <ellipse cx="46" cy="107" rx="10" ry="5" fill={t.dark} opacity="0.9" />
      <ellipse cx="74" cy="107" rx="10" ry="5" fill={t.dark} opacity="0.9" />

      {/* face */}
      <Face mood={mood} dark={t.dark} cheek={t.cheek} />

      {/* props (in front) */}
      <Prop prop={prop} tone={t} />
    </svg>
  );

  if (!float) return svg;
  return (
    <motion.div
      className="inline-block"
      animate={{ y: [0, -7, 0] }}
      transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
      style={{ width: size, height: size }}
    >
      {svg}
    </motion.div>
  );
}

function Face({ mood, dark, cheek }: { mood: BuddyMood; dark: string; cheek: string }) {
  const eyeY = 60;
  return (
    <g>
      {/* cheeks */}
      <circle cx="38" cy="72" r="5" fill={cheek} opacity="0.85" />
      <circle cx="82" cy="72" r="5" fill={cheek} opacity="0.85" />

      {/* eyes */}
      {mood === "party" || mood === "sleepy" ? (
        <g stroke={dark} strokeWidth="3.2" strokeLinecap="round" fill="none">
          {mood === "party" ? (
            <>
              <path d="M40 62 q6 -7 12 0" />
              <path d="M68 62 q6 -7 12 0" />
            </>
          ) : (
            <>
              <path d="M40 60 q6 4 12 0" />
              <path d="M68 60 q6 4 12 0" />
            </>
          )}
        </g>
      ) : mood === "cool" ? (
        <g>
          <rect x="36" y="54" width="20" height="12" rx="4" fill={dark} />
          <rect x="64" y="54" width="20" height="12" rx="4" fill={dark} />
          <line x1="56" y1="58" x2="64" y2="58" stroke={dark} strokeWidth="3" />
          <rect x="39" y="56" width="6" height="3" rx="1.5" fill="#fff" opacity="0.6" />
          <rect x="67" y="56" width="6" height="3" rx="1.5" fill="#fff" opacity="0.6" />
        </g>
      ) : (
        <g>
          <ellipse cx="46" cy={eyeY} rx="4.2" ry="5.2" fill={dark} />
          {mood === "wink" ? (
            <path d="M68 60 q6 -5 12 0" stroke={dark} strokeWidth="3.2" strokeLinecap="round" fill="none" />
          ) : (
            <ellipse cx="74" cy={eyeY} rx="4.2" ry="5.2" fill={dark} />
          )}
          <circle cx="47.5" cy="58" r="1.4" fill="#fff" />
          {mood !== "wink" && <circle cx="75.5" cy="58" r="1.4" fill="#fff" />}
        </g>
      )}

      {/* mouth */}
      {mood === "fire" ? (
        <>
          <path d="M52 74 q8 9 16 0 z" fill={dark} />
          <path d="M55 77 q5 4 10 0" fill="#f87171" />
        </>
      ) : mood === "sleepy" ? (
        <ellipse cx="60" cy="76" rx="3.5" ry="4" fill={dark} />
      ) : mood === "party" ? (
        <path d="M50 72 q10 12 20 0" fill={dark} />
      ) : (
        <path d="M52 72 q8 7 16 0" stroke={dark} strokeWidth="3" strokeLinecap="round" fill="none" />
      )}

      {/* mood extras */}
      {mood === "fire" && (
        <g>
          <path d="M100 38 c-2 4 2 6 0 10 c5 -3 6 -8 0 -10z" fill="#f97316" />
          <path d="M104 30 c-3 5 3 8 0 14 c7 -4 8 -11 0 -14z" fill="#fbbf24" />
        </g>
      )}
      {mood === "sleepy" && (
        <g fill={dark} fontFamily="sans-serif" fontWeight="700">
          <text x="96" y="40" fontSize="10">z</text>
          <text x="104" y="30" fontSize="13">z</text>
        </g>
      )}
      {mood === "party" && (
        <g>
          <circle cx="100" cy="36" r="2.5" fill="#f59e0b" />
          <circle cx="18" cy="44" r="2" fill="#ef4444" />
          <rect x="104" y="46" width="4" height="4" rx="1" fill="#22c55e" transform="rotate(20 106 48)" />
          <rect x="12" y="32" width="4" height="4" rx="1" fill="#3b82f6" transform="rotate(-15 14 34)" />
        </g>
      )}
    </g>
  );
}

function Prop({ prop, tone }: { prop: BuddyProp; tone: (typeof TONES)["orange"] }) {
  switch (prop) {
    case "terminal":
      return (
        <g>
          {/* arms holding */}
          <ellipse cx="30" cy="92" rx="9" ry="6" fill={tone.b} transform="rotate(-10 30 92)" />
          <ellipse cx="90" cy="92" rx="9" ry="6" fill={tone.b} transform="rotate(10 90 92)" />
          <rect x="34" y="80" width="52" height="30" rx="6" fill="#2a2420" stroke="#3f362f" strokeWidth="1.5" />
          <rect x="34" y="80" width="52" height="7" rx="6" fill="#3f362f" />
          <circle cx="40" cy="83.5" r="1.5" fill="#ef4444" />
          <circle cx="45" cy="83.5" r="1.5" fill="#fbbf24" />
          <circle cx="50" cy="83.5" r="1.5" fill="#22c55e" />
          <text x="39" y="98" fontSize="8" fontFamily="ui-monospace, Menlo, monospace" fill="#fb923c" fontWeight="700">
            {">_"}
          </text>
          <rect x="50" y="91.5" width="5" height="8" fill="#fb923c" className="animate-pulse-soft" />
          <rect x="40" y="102" width="24" height="2" rx="1" fill="#6b5f55" />
        </g>
      );
    case "flag":
      return (
        <g>
          <ellipse cx="96" cy="86" rx="9" ry="6" fill={tone.b} transform="rotate(30 96 86)" />
          <line x1="100" y1="40" x2="100" y2="90" stroke={tone.dark} strokeWidth="3" strokeLinecap="round" />
          <path d="M101 40 h20 l-5 7 l5 7 h-20 z" fill="#fff" stroke={tone.dark} strokeWidth="2" />
          <text x="104" y="51" fontSize="7.5" fontWeight="800" fill={tone.dark} fontFamily="sans-serif">
            5h
          </text>
        </g>
      );
    case "trophy":
      return (
        <g>
          <ellipse cx="34" cy="92" rx="9" ry="6" fill={tone.b} transform="rotate(-10 34 92)" />
          <ellipse cx="86" cy="92" rx="9" ry="6" fill={tone.b} transform="rotate(10 86 92)" />
          <path d="M48 82 h24 v8 a12 12 0 0 1 -24 0 z" fill="#fbbf24" stroke="#b45309" strokeWidth="1.5" />
          <path d="M48 84 h-6 a6 6 0 0 0 6 8 M72 84 h6 a6 6 0 0 1 -6 8" fill="none" stroke="#b45309" strokeWidth="1.5" />
          <rect x="56" y="101" width="8" height="4" fill="#b45309" />
          <rect x="51" y="105" width="18" height="3" rx="1" fill="#92400e" />
          <path d="M54 86 l3 5 l-3 1 z" fill="#fff" opacity="0.6" />
        </g>
      );
    case "coffee":
      return (
        <g>
          <ellipse cx="92" cy="90" rx="9" ry="6" fill={tone.b} transform="rotate(20 92 90)" />
          <rect x="94" y="74" width="16" height="16" rx="3" fill="#fff" stroke={tone.dark} strokeWidth="2" />
          <path d="M110 78 a4 4 0 0 1 0 8" fill="none" stroke={tone.dark} strokeWidth="2" />
          <path d="M99 70 q2 -3 0 -6 M104 70 q2 -3 0 -6" stroke="#9ca3af" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <rect x="94" y="82" width="16" height="8" rx="2" fill="#78350f" opacity="0.5" />
        </g>
      );
    case "megaphone":
      return (
        <g>
          <path d="M92 84 l18 -8 v20 l-18 -6 z" fill="#fff" stroke={tone.dark} strokeWidth="2" strokeLinejoin="round" />
          <rect x="86" y="84" width="8" height="8" rx="2" fill={tone.dark} />
          <path d="M113 82 q6 3 0 6 M115 77 q10 6 0 12" stroke={tone.dark} strokeWidth="1.8" fill="none" strokeLinecap="round" />
        </g>
      );
    case "chart":
      return (
        <g>
          <ellipse cx="30" cy="92" rx="9" ry="6" fill={tone.b} transform="rotate(-10 30 92)" />
          <ellipse cx="90" cy="92" rx="9" ry="6" fill={tone.b} transform="rotate(10 90 92)" />
          <rect x="34" y="80" width="52" height="30" rx="6" fill="#fff" stroke={tone.dark} strokeWidth="1.5" />
          <rect x="41" y="96" width="6" height="10" rx="1.5" fill={tone.a} />
          <rect x="50" y="91" width="6" height="15" rx="1.5" fill={tone.b} />
          <rect x="59" y="87" width="6" height="19" rx="1.5" fill={tone.b} />
          <rect x="68" y="84" width="6" height="22" rx="1.5" fill={tone.dark} />
          <line x1="38" y1="86" x2="82" y2="86" stroke="#ef4444" strokeWidth="1.2" strokeDasharray="2 2" />
        </g>
      );
    default:
      return null;
  }
}
