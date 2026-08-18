// see dsp-lane-door.md#the-prompt-layer
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { contentHash } from "./hash.ts";

/** The sources, in the order a reader meets them. */
export const PROMPT_SOURCES = [
  "project/guidance/contract.md",
  "project/guidance/walking.md",
  // NOT at the guidance ROOT: everything there is pulled into every packet
  // always, and a file that is already in the prompt layer must not also ride
  // the wire. Putting it here made boot LONGER, which is the opposite of the
  // point.
  "project/guidance/method/lane.md",
  // VOICE IS ALWAYS-TRUE TOO, so it belongs here and not only in the Claude
  // output style. A host with neither an output style nor instruction files
  // would otherwise get every rule except how to speak.
  "project/guidance/voice.md",
];

export interface Projection {
  body: string;
  hash: string;
}

/** The authoring notes explain the register to whoever edits the source. They
 *  mean nothing to an agent reading the projection. */
function stripAuthoring(md: string): string {
  return md.replace(/<!--[\s\S]*?-->\n*/g, "");
}

export function assembleProtocol(root: string): Projection {
  const parts: string[] = [];
  const stamps: string[] = [];
  for (const rel of PROMPT_SOURCES) {
    const src = readFileSync(join(root, rel), "utf8");
    stamps.push(`${rel} ${contentHash(src)}`);
    parts.push(stripAuthoring(src).trim());
  }
  const head = [
    "<!-- GENERATED at agent start. Do not edit — the next start overwrites it.",
    ...stamps.map((s) => `     from ${s}`),
    "-->",
    "",
  ].join("\n");
  const body = `${head}\n${parts.join("\n\n")}\n`;
  return { body, hash: contentHash(body) };
}

/** Where the projection is placed, per host. AGENTS.md is the one every host
 *  reads; the other two are each host's own door. */
export function protocolTargets(opened: string): { path: string; frontmatter?: string }[] {
  return [
    { path: join(opened, "AGENTS.md") },
    { path: join(opened, "CLAUDE.md") },
    {
      path: join(opened, ".github", "instructions", "protocol.instructions.md"),
      // applyTo '**' is what makes an instructions file apply to everything
      // rather than to one file type.
      frontmatter: [
        "---",
        "name: protocol",
        "description: Generated from project/guidance/. Edit those files, never this one.",
        "applyTo: '**'",
        "---",
        "",
      ].join("\n"),
    },
  ];
}

export function textFor(target: { frontmatter?: string }, projection: Projection): string {
  return target.frontmatter === undefined ? projection.body : `${target.frontmatter}\n${projection.body}`;
}

/** Write every projection. Returns what it wrote, so the caller can say so. */
export function placeProtocol(root: string, opened: string): string[] {
  const projection = assembleProtocol(root);
  const written: string[] = [];
  for (const t of protocolTargets(opened)) {
    mkdirSync(dirname(t.path), { recursive: true });
    writeFileSync(t.path, textFor(t, projection), "utf8");
    written.push(t.path);
  }
  return written;
}
