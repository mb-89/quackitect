// see dsp-lane-door.md — the harness registry.
//
// ONE PLACE NAMES EVERY SUPPORTED HARNESS AND WHAT WAS MEASURED FOR IT. The
// engine reads this; nothing copies the numbers. A remeasurement therefore
// lands once and every caller moves with it.

/** What was measured for one host. An absent field means NOT MEASURED, which
 *  is different from "no limit" and is never treated as one. */
export interface HarnessLimits {
  /** Tool output at or above this many bytes stops reaching the model as
   *  content — the host hands over a path or a preview instead. */
  inlineOutputBytes?: number;
  /** Consecutive stop-hook blocks the host honours before overriding it and
   *  ending the turn anyway. */
  stopBlockCeiling?: number;
}

export interface Harness {
  id: string;
  /** What the host calls itself in MCP `initialize`, lowercased. A host may
   *  answer to several spellings across versions. */
  clientNames: string[];
  label: string;
  limits: HarnessLimits;
  /** When these numbers were taken, and where they came from. */
  measured: string;
}

/** THE SUPPORTED HOSTS. Adding one means measuring it, not guessing it. */
export const HARNESSES: Harness[] = [
  {
    id: "claude-code",
    clientNames: ["claude-code", "claude code", "claude-cli"],
    label: "Claude Code",
    limits: {
      // Climbed on a Windows desktop: 20,000 and 40,000 and 50,000 all arrived
      // whole, 52,500 and above were written to disk and handed back as a
      // preview. The cut therefore sits between 50,000 and 52,500, and the
      // largest figure that survived is what is recorded.
      inlineOutputBytes: 50_000,
    },
    // No stop-block ceiling exists. That is an absence somebody looked for,
    // which is why it is recorded rather than left blank.
    measured: "ladder climbed 2026-08-25 on Windows; earlier audit in spec/harness-portability.md, 2026-08-18",
  },
  {
    id: "copilot-cli",
    clientNames: ["copilot-cli", "github-copilot-cli", "copilot"],
    label: "GitHub Copilot CLI",
    limits: {
      // 20 KiB. Tunable by COPILOT_LARGE_OUTPUT_THRESHOLD_BYTES.
      inlineOutputBytes: 20_480,
      stopBlockCeiling: 8,
    },
    measured: "spec/harness-portability.md breaks 1 and 2, scan of 2026-08-18; cage verified against CLI 1.0.76 on 2026-07-30",
  },
  {
    id: "vscode-copilot",
    clientNames: ["visual studio code", "vscode", "copilot-chat", "github.copilot-chat"],
    label: "GitHub Copilot in VS Code",
    // NOT MEASURED. The agent-mode host has known behaviours recorded in
    // cage/vscode-instructions.md, but no output threshold has been taken.
    limits: {},
    measured: "not measured — behaviours recorded in cage/vscode-instructions.md, thresholds still owed",
  },
];

/** WHAT WAS MEASURED FOR A CATEGORY OF HOST, from the committed registry.
 *
 *  THE REGISTRY IS THE HALF THAT SURVIVES A FRESH BOX. A machine-local file
 *  dies with the container, so a category measured once and committed here is
 *  what stops every cloud run paying the ladder again.
 *
 *  THE KEY IS `<harness id>/<platform>`, and a registry entry covers every
 *  platform unless somebody measures them apart. */
export function registryCapFor(category: string): number | undefined {
  const id = category.split("/")[0];
  const n = HARNESSES.find((h) => h.id === id)?.limits.inlineOutputBytes;
  return typeof n === "number" && n > 0 ? n : undefined;
}

/** The harness a client name belongs to, or undefined when nothing matches.
 *
 *  UNDEFINED IS AN ANSWER. A host nobody has measured must read as unknown
 *  rather than as the nearest guess. */
export function harnessFor(clientName: string | undefined): Harness | undefined {
  if (clientName === undefined) return undefined;
  const want = clientName.trim().toLowerCase();
  if (want === "") return undefined;
  return HARNESSES.find((h) => h.clientNames.some((n) => want === n || want.includes(n)));
}

/** The tightest measured inline-output limit across every supported host.
 *
 *  THIS IS WHAT THE ANSWER BOUND MUST SIT UNDER. Choosing it per host would
 *  mean an answer that travels fine on one machine and is offloaded on
 *  another; the smallest keeps one behaviour everywhere. Undefined when
 *  nothing has been measured at all. */
export function smallestInlineOutputBytes(): number | undefined {
  const measured = HARNESSES.map((h) => h.limits.inlineOutputBytes).filter((n): n is number => n !== undefined);
  return measured.length === 0 ? undefined : Math.min(...measured);
}
