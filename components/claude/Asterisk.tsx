import type { SVGProps } from "react";

/** Claude風の8本腕アスタリスク。currentColor で色が決まる */
export function Asterisk({
  size = 24,
  weight = 0.18,
  ...rest
}: { size?: number; weight?: number } & SVGProps<SVGSVGElement>) {
  const r = 42;
  const w = 100 * weight;
  const arms = [0, 45, 90, 135].map((deg) => {
    const a = (deg * Math.PI) / 180;
    return {
      x1: 50 + r * Math.cos(a),
      y1: 50 + r * Math.sin(a),
      x2: 50 - r * Math.cos(a),
      y2: 50 - r * Math.sin(a),
    };
  });
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      <g stroke="currentColor" strokeWidth={w} strokeLinecap="round" fill="none">
        {arms.map((l, i) => (
          <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} />
        ))}
      </g>
    </svg>
  );
}
