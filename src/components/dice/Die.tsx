import type { TDieFace } from "@/rules/types";

interface IDieProps {
  face: TDieFace;
  size?: number;
}

// Pip positions on a 3x3 grid inside a 16x16 viewBox, numbered
// 0 1 2
// 3 4 5
// 6 7 8
const GRID = [4, 8, 12];
const PIPS: Record<Exclude<TDieFace, "?">, readonly number[]> = {
  1: [4],
  2: [2, 6],
  3: [2, 4, 6],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};

export function Die({ face, size = 18 }: IDieProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" aria-hidden="true" className="shrink-0">
      <rect x="0.75" y="0.75" width="14.5" height="14.5" rx="3" fill="var(--tile)" stroke="currentColor" strokeWidth="1.5" />
      {face === "?" ? (
        <text x="8" y="12" textAnchor="middle" fontSize="11" fontWeight="700" fill="currentColor">
          ?
        </text>
      ) : (
        PIPS[face].map((i) => <circle key={i} cx={GRID[i % 3]} cy={GRID[Math.floor(i / 3)]} r="1.6" fill="currentColor" />)
      )}
    </svg>
  );
}
