"use client";

import { useMemo, useState } from "react";
import {
  AttackPipeline,
  LearningMoment,
  ModeToggle,
  OutcomeBanner,
} from "@/components/AttackViz";
import { SecurityDashboard } from "@/components/SecurityDashboard";
import {
  CHALLENGES,
  POISONED_TOOL_DESCRIPTION,
  enforcementPlaneLabel,
  runAttack,
  type AgentMode,
  type AttackOutcome,
  type ChallengeId,
  type SecurityEvent,
} from "@/lib/security";

const MAX_AUDIT_EVENTS = 100;

export function GameShell({ demoMode = false }: { demoMode?: boolean }) {
  const [mode, setMode] = useState<AgentMode>("reckless");
  const [activeId, setActiveId] = useState<ChallengeId>("prompt-injection");
  const [inputs, setInputs] = useState<Record<ChallengeId, string>>(() =>
    Object.fromEntries(
      CHALLENGES.map((c) => [c.id, c.defaultAttack]),
    ) as Record<ChallengeId, string>,
  );
  const [hintLevel, setHintLevel] = useState<Record<ChallengeId, number>>({
    "prompt-injection": 0,
    "permission-escape": 0,
    "data-exfiltration": 0,
    "tool-poisoning": 0,
  });
  const [outcome, setOutcome] = useState<AttackOutcome | null>(null);
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState<Partial<Record<ChallengeId, boolean>>>(
    {},
  );

  const active = useMemo(
    () => CHALLENGES.find((c) => c.id === activeId)!,
    [activeId],
  );

  const progress = CHALLENGES.filter((c) => completed[c.id]).length;
  const planeLabel = enforcementPlaneLabel(
    outcome?.policy.source ?? "local-demo",
  );

  function execute(agent: AgentMode, challengeId: ChallengeId, attackInput: string) {
    const result = runAttack({ challengeId, agent, attackInput });
    setMode(agent);
    setOutcome(result);
    setEvents((prev) => [...prev, result.event].slice(-MAX_AUDIT_EVENTS));
    setScore((s) => s + result.scoreDelta);
    if (result.breached || result.policy.decision !== "ALLOW") {
      // Mark progress when player successfully demonstrates breach or block path
      if (result.breached || agent === "guarded") {
        setCompleted((prev) => ({ ...prev, [challengeId]: true }));
      }
    }
    return result;
  }

  function onSubmit() {
    execute(mode, activeId, inputs[activeId] ?? "");
  }

  function onReplayGuarded() {
    if (!outcome) return;
    execute("guarded", outcome.challengeId, outcome.attackInput);
  }

  function onHint() {
    setHintLevel((prev) => ({
      ...prev,
      [activeId]: Math.min(3, (prev[activeId] ?? 0) + 1),
    }));
  }

  const hintsShown = hintLevel[activeId] ?? 0;
  const blocked =
    outcome?.policy.decision === "BLOCK" ||
    outcome?.policy.decision === "REQUIRE_APPROVAL";

  const demoSteps = [
    "1. Challenge",
    "2. Reckless attack",
    "3. Breach",
    "4. Replay",
    "5. Guarded block",
    "6. Explanation",
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <header className="mb-6">
        <p className="text-xs uppercase tracking-[0.35em] text-[var(--accent)]">
          Acme Corp · AI Security Ops
        </p>
        <h1 className="mt-2 text-4xl font-extrabold tracking-[0.08em] text-[var(--text)] sm:text-5xl">
          AGENT BREAKOUT
        </h1>
        <p className="mt-1 text-lg text-[var(--accent-2)]">Escape the AI Office</p>
        <p className="mt-4 max-w-3xl text-sm text-[var(--muted)]">
          Mission: You are testing an AI assistant inside Acme Corp. Can you manipulate
          the agent into accessing information it should never see?
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-[var(--muted)]">
          <span className="rounded-full border border-[var(--line)] px-3 py-1">
            Progress {progress}/{CHALLENGES.length}
          </span>
          <span className="rounded-full border border-[var(--line)] px-3 py-1">
            Demo mode · deterministic · no external LLM
          </span>
          <span className="rounded-full border border-[var(--line)] px-3 py-1">
            {planeLabel}
          </span>
        </div>
        {demoMode ? (
          <div className="mt-4 rounded-xl border border-[var(--accent)]/40 bg-[rgba(51,224,255,0.06)] p-3">
            <p className="text-[10px] uppercase tracking-widest text-[var(--accent)]">
              Judge demo flow (?demo=1)
            </p>
            <ol className="mt-2 flex flex-wrap gap-2 text-xs text-[var(--muted)]">
              {demoSteps.map((label, idx) => {
                const activeStep =
                  (idx === 0 && !outcome) ||
                  (idx === 1 && mode === "reckless" && !outcome) ||
                  (idx === 2 && Boolean(outcome?.breached)) ||
                  (idx === 3 && Boolean(outcome?.breached) && mode === "reckless") ||
                  (idx === 4 && Boolean(blocked)) ||
                  (idx === 5 && Boolean(blocked) && Boolean(outcome));
                return (
                  <li
                    key={label}
                    className={`rounded border px-2 py-1 ${
                      activeStep
                        ? "border-[var(--accent)] text-[var(--text)]"
                        : "border-[var(--line)]"
                    }`}
                  >
                    {label}
                  </li>
                );
              })}
            </ol>
            <p className="mt-2 text-xs text-[var(--text)]">
              Select Level 1 → Submit Attack (Reckless) → REPLAY AGAINST GUARDED AGENT →
              read the Learning Moment.
            </p>
          </div>
        ) : null}
      </header>

      <section className="mb-6">
        <ModeToggle mode={mode} onChange={setMode} />
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
        <div className="space-y-6">
          <section className="panel p-4">
            <h2 className="text-sm font-bold tracking-[0.2em] text-[var(--accent)]">
              CHALLENGES
            </h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {CHALLENGES.map((c) => {
                const selected = c.id === activeId;
                const done = Boolean(completed[c.id]);
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      setActiveId(c.id);
                      setOutcome(null);
                    }}
                    className={`rounded-xl border p-3 text-left transition ${
                      selected
                        ? "border-[var(--accent)] bg-[rgba(51,224,255,0.08)]"
                        : "border-[var(--line)] bg-black/20 hover:border-[var(--accent)]/60"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] uppercase tracking-widest text-[var(--muted)]">
                        Level {c.level}
                        {c.level === 4 ? " — BOSS" : ""}
                      </span>
                      {done ? (
                        <span className="text-[10px] text-[var(--ok)]">CLEARED</span>
                      ) : null}
                    </div>
                    <p className="mt-1 text-sm font-bold">{c.title}</p>
                    <p className="mt-1 text-xs text-[var(--muted)]">{c.goal}</p>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="panel p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h2 className="text-sm font-bold tracking-[0.18em] text-[var(--warn)]">
                  LEVEL {active.level}: {active.title.toUpperCase()}
                </h2>
                <p className="mt-1 text-xs text-[var(--muted)]">{active.goal}</p>
              </div>
              <span className="terminal text-xs text-[var(--accent)]">
                +{active.points} pts
              </span>
            </div>

            {active.id === "tool-poisoning" ? (
              <div className="terminal mt-3 rounded-lg border border-[var(--danger)]/50 bg-[rgba(255,59,107,0.08)] p-3 text-xs text-[var(--warn)]">
                Malicious tool description (simulated):
                <br />
                {POISONED_TOOL_DESCRIPTION}
              </div>
            ) : null}

            <label className="mt-4 block text-[10px] uppercase tracking-widest text-[var(--muted)]">
              Attack input
              <textarea
                className="terminal mt-2 min-h-28 w-full resize-y rounded-lg border border-[var(--line)] bg-black/40 px-3 py-2 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)]"
                value={inputs[activeId]}
                maxLength={2000}
                onChange={(e) =>
                  setInputs((prev) => ({ ...prev, [activeId]: e.target.value }))
                }
                spellCheck={false}
              />
            </label>

            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={onSubmit}
                className="rounded-lg bg-[var(--danger)] px-4 py-2 text-sm font-bold text-black hover:brightness-110"
              >
                Submit Attack
              </button>
              <button
                type="button"
                onClick={onHint}
                className="rounded-lg border border-[var(--line)] px-4 py-2 text-sm text-[var(--text)] hover:border-[var(--accent)]"
              >
                Hint
              </button>
              {outcome?.breached ? (
                <button
                  type="button"
                  onClick={onReplayGuarded}
                  className="rounded-lg border border-[var(--ok)] bg-[rgba(45,255,154,0.12)] px-4 py-2 text-sm font-bold text-[var(--ok)] hover:brightness-110"
                >
                  REPLAY AGAINST GUARDED AGENT
                </button>
              ) : null}
            </div>

            {hintsShown > 0 ? (
              <ul className="mt-3 space-y-1 text-xs text-[var(--accent)]">
                {active.hints.slice(0, hintsShown).map((h) => (
                  <li key={h}>💡 {h}</li>
                ))}
              </ul>
            ) : null}
          </section>

          {outcome ? (
            <div className="grid gap-4 lg:grid-cols-2">
              <AttackPipeline
                steps={outcome.pipeline}
                breached={outcome.breached}
                blocked={Boolean(blocked)}
              />
              <div className="space-y-4">
                <OutcomeBanner outcome={outcome} />
                <div className="panel p-4 terminal text-xs">
                  <p className="text-[var(--muted)]">Result</p>
                  <p className="mt-1 text-[var(--text)]">
                    {outcome.toolRequest.tool} → {outcome.toolRequest.resource} →{" "}
                    <span
                      className={
                        outcome.policy.decision === "ALLOW"
                          ? "text-[var(--ok)]"
                          : outcome.policy.decision === "BLOCK"
                            ? "text-[var(--danger)]"
                            : "text-[var(--warn)]"
                      }
                    >
                      {outcome.policy.decision}
                    </span>
                  </p>
                  <p className="mt-2 text-[var(--muted)]">Explanation</p>
                  <p className="mt-1">{outcome.policy.explanation}</p>
                  <p className="mt-2 text-[var(--muted)]">Score delta</p>
                  <p className="mt-1 text-[var(--warn)]">+{outcome.scoreDelta}</p>
                </div>
                <LearningMoment outcome={outcome} />
              </div>
            </div>
          ) : null}
        </div>

        <SecurityDashboard events={events} score={score} />
      </div>

      <footer className="mt-8 border-t border-[var(--line)] pt-4 text-xs text-[var(--muted)]">
        Simulated tools: calendar.read · files.read · email.send · Resources include
        fictional FLAG only · Never real credentials.
      </footer>
    </div>
  );
}
