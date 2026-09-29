"use client";

import type { SecurityEvent } from "@/lib/security";
import { isSensitiveEvent } from "@/lib/security";

export function SecurityDashboard({
  events,
  score,
}: {
  events: SecurityEvent[];
  score: number;
}) {
  const toolCalls = events.length;
  const allowed = events.filter((e) => e.decision === "ALLOW").length;
  const blocked = events.filter((e) => e.decision === "BLOCK").length;
  const approval = events.filter((e) => e.decision === "REQUIRE_APPROVAL").length;
  const sensitive = events.filter((e) => isSensitiveEvent(e)).length;

  const stats = [
    { label: "Tool Calls", value: toolCalls },
    { label: "Allowed", value: allowed },
    { label: "Blocked", value: blocked },
    { label: "Approval Required", value: approval },
    { label: "Sensitive Access Attempts", value: sensitive },
  ];

  return (
    <aside className="panel flex h-full flex-col p-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-bold tracking-[0.18em] text-[var(--accent)]">
          SECURITY EVENTS
        </h3>
        <span className="terminal text-sm text-[var(--warn)]">SCORE {score}</span>
      </div>
      <p className="mt-1 text-[10px] uppercase tracking-widest text-[var(--muted)]">
        Security Control Plane / Local Demo Policy · live audit
      </p>

      <div className="mt-4 grid grid-cols-2 gap-2">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-lg border border-[var(--line)] bg-black/25 px-3 py-2"
          >
            <p className="text-[10px] uppercase tracking-wider text-[var(--muted)]">
              {s.label}
            </p>
            <p className="terminal text-xl text-[var(--text)]">{s.value}</p>
          </div>
        ))}
      </div>

      <h4 className="mt-5 text-xs font-bold tracking-[0.16em] text-[var(--muted)]">
        AUDIT TIMELINE
      </h4>
      <ul className="terminal mt-2 max-h-64 flex-1 space-y-1 overflow-auto text-xs">
        {events.length === 0 ? (
          <li className="text-[var(--muted)]">No events yet. Submit an attack.</li>
        ) : (
          [...events].reverse().map((e) => (
            <li
              key={e.id}
              className="rounded border border-[var(--line)]/70 bg-black/20 px-2 py-1"
            >
              <span className="text-[var(--muted)]">{e.timestamp}</span>{" "}
              <span className="text-[var(--accent)]">{e.tool}</span>
              {" → "}
              <span>{shortPath(e.resource)}</span>
              {" → "}
              <Decision decision={e.decision} />
            </li>
          ))
        )}
      </ul>
    </aside>
  );
}

function shortPath(path: string): string {
  const parts = path.split("/");
  return parts[parts.length - 1] || path;
}

function Decision({ decision }: { decision: SecurityEvent["decision"] }) {
  const color =
    decision === "ALLOW"
      ? "text-[var(--ok)]"
      : decision === "BLOCK"
        ? "text-[var(--danger)]"
        : "text-[var(--warn)]";
  return <span className={color}>{decision}</span>;
}
