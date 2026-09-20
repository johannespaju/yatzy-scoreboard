"use client";

interface IMarqueeProps {
  /** Blink faster while the reels spin. */
  busy: boolean;
}

const BULBS = 11;

export function Marquee({ busy }: IMarqueeProps) {
  return (
    <div aria-hidden="true" className="flex items-center justify-between gap-1 px-1">
      {Array.from({ length: BULBS }, (_, i) => (
        <span
          key={i}
          className="size-2 rounded-full bg-(--slot-bulb-off) motion-safe:animate-marquee-blink"
          style={{
            animationDelay: i % 2 ? "550ms" : "0ms",
            animationDuration: busy ? "360ms" : undefined,
          }}
        />
      ))}
    </div>
  );
}
