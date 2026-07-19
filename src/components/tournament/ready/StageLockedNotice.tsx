import type { ReactNode } from "react";

type StageLockedNoticeProps = {
  children: ReactNode;
};

export default function StageLockedNotice({
  children,
}: StageLockedNoticeProps) {
  return (
    <div
      role="status"
      className="mb-6 flex items-start gap-3 rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3"
    >
      <span
        aria-hidden="true"
        className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-xs text-zinc-400"
      >
        🔒
      </span>

      <div>
        <p className="text-xs font-black uppercase tracking-widest text-zinc-400">
          Results locked
        </p>
        <p className="mt-1 text-sm text-zinc-500">{children}</p>
      </div>
    </div>
  );
}
