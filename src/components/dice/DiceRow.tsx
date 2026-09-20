import type { TDieFace } from "@/rules/types";
import { Die } from "./Die";

interface IDiceRowProps {
  groups: readonly (readonly TDieFace[])[];
  size?: number;
}

export function DiceRow({ groups, size }: IDiceRowProps) {
  return (
    <span className="inline-flex items-center gap-4">
      {groups.map((group, g) => (
        <span key={g} className="inline-flex items-center gap-[3px]">
          {group.map((face, i) => (
            <Die key={i} face={face} size={size} />
          ))}
        </span>
      ))}
    </span>
  );
}
