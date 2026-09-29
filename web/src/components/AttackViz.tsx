"use client";

import type { AgentMode, AttackOutcome, AttackPipelineStep } from "@/lib/security";

export function AttackPipeline({
  steps,
  breached,
  blocked,
}: {
  steps: AttackPipelineStep[];
  breached: boolean;
  blocked: boolean;
}) {
  return (
    <div
      className={`panel p-4 terminal fade-in ${
        breached ? "glow-danger breach-pulse" : blocked ? "glow-ok" : ""
      }`}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-sm font-bold tracking-[0.2em] text-[var(--accent)]">
          ATTACK VISUALIZATION
        </h3>
        <span className="text-[10px] uppercase tracking-widest text-[var(--muted)]">
          Agent Security Control Plane
        </span>
      </div>
      <ol className="space-y-2">
        {steps.map((step, idx) => (
          <li key={step.id} className="fade-in" style={{ animationDelay: `${idx * 60}ms` }}>
            <div className="flex flex-col gap-1 rounded-lg border border-[var(--line)] bg-black/30 px-3 py-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold tracking-wider text-[var(--text)]">
                  {step.label}
                </span>
                <StatusPill status={step.status} />
              </div>
              <p className="text-xs text-[var(--muted)] break-words">{step.detail}</p>
            </div>
            {idx < steps.length - 1 ? (
              <div className="pipeline-arrow py-1 pl-3 text-xs">↓</div>
            ) : null}
          </li>
        ))}
      </ol>
      {breached ? (
        <div className="mt-4 rounded-lg border border-[var(--danger)] bg-[rgba(255,59,107,0.12)] p-3">
          <p className="text-sm font-bold tracking-wide text-[var(--danger)]">
            🚨 SECURITY BREACH
          </p>
          <p className="mt-1 text-xs text-[var(--text)]">
            Restricted resource accessed.
          </p>
        </div>
      ) : null}
      {blocked ? (
        <div className="mt-4 rounded-lg border border-[var(--ok)] bg-[rgba(45,255,154,0.1)] p-3">
          <p className="text-sm font-bold tracking-wide text-[var(--ok)]">
            🛡️ ATTACK BLOCKED
          </p>
          <p className="mt-1 text-xs text-[var(--text)]">
            Policy enforcement stopped the same attack path.
          </p>
        </div>
      ) : null}
    </div>
  );
}

function StatusPill({ status }: { status: AttackPipelineStep["status"] }) {
  const map: Record<AttackPipelineStep["status"], string> = {
    pending: "text-[var(--muted)] border-[var(--line)]",
    active: "text-[var(--accent)] border-[var(--accent)]",
    pass: "text-[var(--ok)] border-[var(--ok)]",
    fail: "text-[var(--danger)] border-[var(--danger)]",
    block: "text-[var(--warn)] border-[var(--warn)]",
  };
  return (
    <span
      className={`rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-widest ${map[status]}`}
    >
      {status}
    </span>
  );
}

export function OutcomeBanner({ outcome }: { outcome: AttackOutcome }) {
  if (outcome.breached) {
    return (
      <div className="panel glow-danger breach-pulse p-4 fade-in">
        <p className="text-lg font-bold text-[var(--danger)]">🚨 SECURITY BREACH</p>
        <p className="mt-1 text-sm text-[var(--text)]">Restricted resource accessed.</p>
        <p className="terminal mt-3 text-base tracking-wide text-[var(--warn)]">
          {outcome.flag}
        </p>
        <p className="mt-2 text-xs text-[var(--muted)]">{outcome.policy.explanation}</p>
      </div>
    );
  }

  const blocked =
    outcome.policy.decision === "BLOCK" ||
    outcome.policy.decision === "REQUIRE_APPROVAL";

  if (blocked) {
    return (
      <div className="panel glow-ok p-4 fade-in">
        <p className="text-lg font-bold text-[var(--ok)]">🛡️ ATTACK BLOCKED</p>
        <p className="mt-1 text-sm text-[var(--text)]">
          Decision: <span className="terminal text-[var(--accent)]">{outcome.policy.decision}</span>
        </p>
        <p className="mt-2 text-xs text-[var(--text)]">{outcome.policy.explanation}</p>
        {outcome.policy.control ? (
          <p className="mt-2 text-xs text-[var(--muted)]">
            Control: {outcome.policy.control}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="panel p-4 fade-in">
      <p className="text-sm font-bold text-[var(--accent)]">ALLOW</p>
      <p className="mt-1 text-xs text-[var(--muted)]">{outcome.policy.explanation}</p>
    </div>
  );
}

export function LearningMoment({ outcome }: { outcome: AttackOutcome }) {
  return (
    <div className="panel p-4 fade-in">
      <h3 className="text-sm font-bold tracking-[0.18em] text-[var(--accent-2)]">
        LEARNING MOMENT
      </h3>
      <dl className="mt-3 space-y-2 text-xs">
        <div>
          <dt className="text-[var(--muted)]">WHAT HAPPENED?</dt>
          <dd className="text-[var(--text)]">{outcome.learning.whatHappened}</dd>
        </div>
        <div>
          <dt className="text-[var(--muted)]">WHY WAS IT DANGEROUS?</dt>
          <dd className="text-[var(--text)]">{outcome.learning.whyDangerous}</dd>
        </div>
        <div>
          <dt className="text-[var(--muted)]">WHAT CONTROL STOPPED IT?</dt>
          <dd className="text-[var(--text)]">{outcome.learning.whatStoppedIt}</dd>
        </div>
        <div className="grid gap-2 border-t border-[var(--line)] pt-2 sm:grid-cols-3">
          <div>
            <dt className="text-[var(--muted)]">Vulnerability</dt>
            <dd>{outcome.learning.vulnerability}</dd>
          </div>
          <div>
            <dt className="text-[var(--muted)]">Risk</dt>
            <dd>{outcome.learning.risk}</dd>
          </div>
          <div>
            <dt className="text-[var(--muted)]">Defense</dt>
            <dd>{outcome.learning.defense}</dd>
          </div>
        </div>
      </dl>
      <p className="mt-3 text-[10px] uppercase tracking-widest text-[var(--muted)]">
        Mode: {outcome.agent === "reckless" ? "Reckless Agent" : "Guarded Agent"} ·{" "}
        {outcome.policy.source === "guild"
          ? "Security Control Plane / Guild Enforcement"
          : "Security Control Plane / Local Demo Policy"}
      </p>
    </div>
  );
}

export function ModeToggle({
  mode,
  onChange,
}: {
  mode: AgentMode;
  onChange: (mode: AgentMode) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <button
        type="button"
        onClick={() => onChange("reckless")}
        className={`rounded-xl border p-4 text-left transition ${
          mode === "reckless"
            ? "border-[var(--danger)] bg-[rgba(255,59,107,0.12)] glow-danger"
            : "border-[var(--line)] bg-black/20 hover:border-[var(--danger)]"
        }`}
      >
        <p className="text-sm font-bold">🔥 RECKLESS AGENT</p>
        <p className="mt-1 text-xs text-[var(--muted)]">
          No meaningful security controls.
        </p>
      </button>
      <button
        type="button"
        onClick={() => onChange("guarded")}
        className={`rounded-xl border p-4 text-left transition ${
          mode === "guarded"
            ? "border-[var(--ok)] bg-[rgba(45,255,154,0.1)] glow-ok"
            : "border-[var(--line)] bg-black/20 hover:border-[var(--ok)]"
        }`}
      >
        <p className="text-sm font-bold">🛡️ GUARDED AGENT</p>
        <p className="mt-1 text-xs text-[var(--muted)]">
          Security policies protect sensitive tools and information.
        </p>
      </button>
    </div>
  );
}
