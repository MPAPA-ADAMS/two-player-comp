type PlayerCardProps = {
  name: string;
  colour: string;
};

export default function PlayerCard({ name, colour }: PlayerCardProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-900 p-4">
      <div
        className="h-4 w-4 rounded-full"
        style={{ backgroundColor: colour }}
      />

      <span className="font-medium">{name}</span>
    </div>
  );
}
