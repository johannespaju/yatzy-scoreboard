"use client";

interface IMarqueeProps {
  busy: boolean;
}

const BULBS = 11;

export function Marquee({ busy }: IMarqueeProps) {
  return (
    <div aria-hidden="true" className="flex items-center justify-between gap-1 px-2">
      {Array.from({ length: BULBS }, (_, i) => (
        <span
          key={i}
          className="size-1.5 rounded-full bg-ink motion-safe:animate-marquee-blink"
          style={{
            animationDelay: i % 2 ? "550ms" : "0ms",
            animationDuration: busy ? "360ms" : undefined,
          }}
        />
      ))}
    </div>
  );
}
