import Link from "next/link";
import type { ReactNode } from "react";
import type { Player } from "@/types/competition";

type PlayerLinkProps = {
  player: Player;
  children?: ReactNode;
  className?: string;
};

export default function PlayerLink({ player, children, className }: PlayerLinkProps) {
  return (
    <Link
      href={`/players/${player.id}`}
      className={className ?? "transition hover:text-amber-300 hover:underline"}
    >
      {children ?? player.name}
    </Link>
  );
}
