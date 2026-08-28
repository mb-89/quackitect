// see dsp-lane-door.md#the-prompt-layer
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { contentHash } from "./hash.ts";

/** The sources, in the order a reader meets them. */
export const PROMPT_SOURCES = [
  "guidance/contract.md",
  "guidance/walking.md",
  // NOT at the guidance ROOT: everything there is pulled into every packet
  // always, and a file that is already in the prompt layer must not also ride
  // the wire. Putting it here made boot LONGER, which is the opposite of the
  // point.
  "guidance/method/lane.md",
  // VOICE IS ALWAYS-TRUE TOO, so it belongs here and not only in the Claude
  // output style. A host with neither an output style nor instruction files
  // would otherwise get every rule except how to speak.
  "guidance/voice.md",
];

export interface Projection {
  body: string;
  hash: string;
}

export const SKILL_SOURCES = [{ name: "deep-research", path: "guidance/skills/deep-research/SKILL.md" }] as const;

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
        "description: Generated from guidance/. Edit those files, never this one.",
        // DOUBLE QUOTES BECAUSE THE FORMATTER NORMALISES TO THEM. Written with
        // single quotes the file is rewritten the moment it lands, so the next
        // projection sees a difference and warns about a lost hand edit that
        // never happened. Measured: two placements seconds apart, both warning.
        'applyTo: "**"',
        "---",
        "",
      ].join("\n"),
    },
  ];
}

export function textFor(target: { frontmatter?: string }, projection: Projection): string {
  return target.frontmatter === undefined ? projection.body : `${target.frontmatter}\n${projection.body}`;
}

export function skillTargets(opened: string, name: string): string[] {
  return [
    join(opened, ".claude", "skills", name, "SKILL.md"),
    join(opened, ".github", "skills", name, "SKILL.md"),
    join(opened, ".agents", "skills", name, "SKILL.md"),
  ];
}

export function placeSkills(root: string, opened: string): string[] {
  const written: string[] = [];
  for (const skill of SKILL_SOURCES) {
    const body = readFileSync(join(root, skill.path), "utf8");
    for (const path of skillTargets(opened, skill.name)) {
      mkdirSync(dirname(path), { recursive: true });
      writeFileSync(path, body, "utf8");
      written.push(path);
    }
  }
  return written;
}

/** Write every projection. Returns what it wrote, so the caller can say so. */
export function placeProtocol(root: string, opened: string): string[] {
  const projection = assembleProtocol(root);
  const written: string[] = [];
  for (const t of protocolTargets(opened)) {
    mkdirSync(dirname(t.path), { recursive: true });
    const text = textFor(t, projection);
    // AN OVERWRITE THAT DESTROYS SOMETHING SAYS SO. The projection is written
    // unconditionally, so a file somebody edited by hand is replaced without a
    // word and the edit is simply gone.
    //
    // THE FILE SAYS `Do not edit` IN ITS FIRST LINE, and that was not enough:
    // a patch verb names a string to replace and never shows the head, so an
    // edit 600 lines down never meets the warning. Measured on the i62 walk,
    // where two paragraphs written into AGENTS.md and CLAUDE.md vanished at the
    // next arrival and nothing reported it.
    //
    // THE LINE IS NOISE RIGHT AFTER A GUIDANCE EDIT, when the difference is
    // only the older projection. It is telling the reader which of the two
    // happened that matters, so it names both readings rather than guessing.
    if (existsSync(t.path) && readFileSync(t.path, "utf8") !== text) {
      process.stderr.write(
        `prompt layer: ${t.path} differed and was overwritten — expected right after a guidance edit, and a LOST HAND EDIT otherwise. The source is guidance/.\n`,
      );
    }
    writeFileSync(t.path, text, "utf8");
    written.push(t.path);
  }
  written.push(...placeSkills(root, opened));
  return written;
}
