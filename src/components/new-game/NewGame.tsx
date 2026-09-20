"use client";

import { type FormEvent, useState } from "react";

interface INewGameProps {
  onStart: (playerNames: string[]) => void;
}

const MAX_PLAYERS = 6;

export function NewGame({ onStart }: INewGameProps) {
  const [names, setNames] = useState<string[]>(["", ""]);

  function setName(index: number, name: string) {
    setNames(names.map((n, i) => (i === index ? name : n)));
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    onStart(names);
  }

  const canStart = names.some((n) => n.trim().length > 0);

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 p-4 max-w-sm mx-auto w-full">
      <h1 className="text-2xl font-bold">New game</h1>
      {names.map((name, i) => (
        <input
          key={i}
          type="text"
          value={name}
          onChange={(e) => setName(i, e.target.value)}
          placeholder={`Player ${i + 1}`}
          aria-label={`Player ${i + 1} name`}
          className="border rounded px-3 py-2 text-lg"
        />
      ))}
      {names.length < MAX_PLAYERS && (
        <button type="button" onClick={() => setNames([...names, ""])} className="py-2 underline">
          Add player
        </button>
      )}
      <button type="submit" disabled={!canStart} className="py-3 rounded bg-foreground text-background font-bold disabled:opacity-40">
        Start
      </button>
    </form>
  );
}
