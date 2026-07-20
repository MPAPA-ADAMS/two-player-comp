"use client";

import { useState } from "react";

import { createSeason } from "@/app/admin/seasons/new/actions";

type NameListEditorProps = {
  title: string;
  values: string[];
  onChange: (values: string[]) => void;
};

export default function SeasonSetupForm() {
  const [name, setName] = useState("");
  const [games, setGames] = useState([""]);
  const [mentors, setMentors] = useState([""]);
  const [players, setPlayers] = useState([""]);
  const [number, setNumber] = useState(1);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validPlayers = players.map((player) => player.trim()).filter(Boolean);

    await createSeason({
      name: name.trim(),
      number,
      games: games.map((game) => game.trim()).filter(Boolean),
      mentors: mentors.map((mentor) => mentor.trim()).filter(Boolean),
      players: validPlayers.map((playerName, index) => ({
        name: playerName,
        shortName: playerName.split(/\s+/)[0],
        colour: `hsl(${Math.round(
          (index * 360) / Math.max(validPlayers.length, 1),
        )} 70% 50%)`,
      })),
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      <section>
        <label
          htmlFor="season-name"
          className="block text-sm font-bold text-white"
        >
          Season name
        </label>

        <input
          id="season-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3"
          placeholder="Season 2026"
          required
        />
      </section>

      <section>
        <label
          htmlFor="season-number"
          className="block text-sm font-bold text-white"
        >
          Season number
        </label>

        <input
          id="season-number"
          type="number"
          min={1}
          value={number}
          onChange={(event) => setNumber(Number(event.target.value))}
          className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3"
          required
        />
      </section>

      <NameListEditor title="Games" values={games} onChange={setGames} />

      <NameListEditor title="Mentors" values={mentors} onChange={setMentors} />

      <NameListEditor title="Players" values={players} onChange={setPlayers} />

      <button
        type="submit"
        className="rounded-xl bg-amber-400 px-6 py-3 font-black text-zinc-950"
      >
        Create season
      </button>
    </form>
  );
}

function NameListEditor({ title, values, onChange }: NameListEditorProps) {
  function updateValue(index: number, value: string) {
    onChange(
      values.map((item, itemIndex) => (itemIndex === index ? value : item)),
    );
  }

  function removeValue(index: number) {
    onChange(values.filter((_, itemIndex) => itemIndex !== index));
  }

  return (
    <section>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black text-white">{title}</h2>

        <button
          type="button"
          onClick={() => onChange([...values, ""])}
          className="rounded-lg border border-zinc-700 px-3 py-2 text-sm font-bold"
        >
          Add
        </button>
      </div>

      <div className="mt-4 space-y-3">
        {values.map((value, index) => (
          <div key={index} className="flex gap-3">
            <input
              value={value}
              onChange={(event) => updateValue(index, event.target.value)}
              className="flex-1 rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3"
              placeholder={`${title.slice(0, -1)} name`}
            />

            <button
              type="button"
              onClick={() => removeValue(index)}
              disabled={values.length === 1}
              className="rounded-xl border border-red-900 px-4 text-red-400 disabled:opacity-40"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
