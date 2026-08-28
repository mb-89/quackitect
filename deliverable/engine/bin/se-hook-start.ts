// se-hook-start — THE CAGED SESSION'S SessionStart NOTICE. Not the prompt layer.
//
// KNOW THE DIFFERENCE, because getting it wrong puts a second copy of the
// rules in the tree.
//
// THE PROMPT LAYER IS THE SESSION PROMPT. `engine/promptlayer.ts` assembles
// guidance/contract.md, walking.md, method/lane.md and voice.md
// VERBATIM into AGENTS.md, CLAUDE.md and .github/instructions, at agent
// start. No model stands in that path, so a rule cannot come out compressed
// differently on different days. Every rule an agent must hold arrives that
// way, every turn, and survives a compaction.
//
// THIS FILE IS SMALLER THAN THAT. It carries no rules, only what is true
// about THIS start: that the first act is a pull.
//
// WHICH HOOK FIRES WHICH. There are two, and they do not compete:
//
// - `.claude/settings.json` runs THIS one. It is placed by the
//   arrival or by the editor, so it only ever fires for a session that is
//   already caged.
// - `.claude/settings.json` at the repository root runs se-hook-arrive. It is
//   committed, so it is the only hook a fresh cloud clone can fire.
//
// THE TEXT THEY SHARE LIVES IN ../pullnotice.ts, once. Both used to carry
// their own copy.
//
// It is a script rather than an inline `node -e` only so the text can hold
// line breaks and apostrophes. The old inline form worked; it was simply
// hard to edit.
//
// A hook must never break the turn, so this only ever writes to stdout and
// exits clean.
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { markCompacted } from "../compaction.ts";
import { COMPACTED, OPENING } from "../pullnotice.ts";

const compacted = process.argv.includes("--compacted");

// THE MARKER IS WHAT MAKES THE NOTICE TRUE. It says the reading is gone and
// that the next pull will ask for it again; without this line nothing on this
// path can reach the engine's read gate, and the sentence is simply false.
//
// THE ROOT COMES FROM THIS FILE, never from the cwd. The hook is fired by the
// client, which chooses its own working directory, and `.se/` sits three levels
// above `deliverable/engine/bin`.
//
// A HOOK MUST NEVER BREAK THE TURN. A failed marker costs a re-read that did
// not happen, which is bad and survivable; a throw here takes the session.
if (compacted) {
  try {
    markCompacted(join(dirname(fileURLToPath(import.meta.url)), "..", "..", ".."));
  } catch {
    // the notice still prints, and the agent is still told to pull
  }
}

process.stdout.write(`${compacted ? COMPACTED : OPENING}\n`);
