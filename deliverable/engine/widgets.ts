// see dsp-the-widget-guard.md
//
// ONE PLACE HOLDS THE RULE. The write guard asks it before a write lands, and
// the sweep asks it about the whole tree. Neither carries a copy, because two
// copies of one rule is the failure this round is about.

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { CLAUSES, Rejection } from "./errors.ts";

/** The engine's own folder. Every path below is relative to the repo root. */
const ENGINE_DIR = import.meta.dirname;

/** The prefix a reported path carries, so a finding names a file a person can open. */
const ENGINE_PREFIX = "deliverable/engine";

/** The declared hatch. A person edits it; nothing here holds a copy. */
const EXEMPTIONS_FILE = join(dirname(ENGINE_DIR), "machines", "widget-exemptions.md");

/** The block tags that make markup a WIDGET rather than a fragment of prose. */
const BLOCK_TAGS = ["div", "section", "main", "aside", "table", "ul", "ol", "form", "button", "svg"];

// BUILT RATHER THAN WRITTEN OUT. A literal pattern here would contain the very
// shape it looks for, and this file would flag itself.
//
// A TAG PRECEDED BY A QUOTE IS A PLACEHOLDER, NOT MARKUP. Prose describing a
// payload writes things like {"<section>": "<text>"}, and the angle brackets
// there stand for a name the reader supplies. Measured: that one
// shape was the only false positive left after the reachability rule landed.
const BLOCK = new RegExp("`[^`]*(?<![\"'])<(?:" + BLOCK_TAGS.join("|") + ")\\b");
const CLASSED = /`[^`]*(?<!["'])<[a-z]+\s+class=/;

/** Does this source emit widget markup? One question, asked of content. */
export function emitsWidget(text: string): boolean {
  return BLOCK.test(text) || CLASSED.test(text);
}

function sources(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) sources(full, out);
    else if (name.endsWith(".ts")) out.push(full);
  }
  return out;
}

/** A repo-root-relative path, with forward slashes on every host. */
function relative(full: string): string {
  return `${ENGINE_PREFIX}${full.slice(ENGINE_DIR.length).replace(/\\/g, "/")}`;
}

/** Every engine source that emits widget markup. */
export function emitters(): string[] {
  return sources(ENGINE_DIR)
    .filter((full) => emitsWidget(readFileSync(full, "utf8")))
    .map(relative)
    .sort();
}

/** WHERE THE ONE SURFACE STARTS. Everything the panel draws is reached from
 *  here, so everything reachable from here is the one surface. */
const SURFACE_ENTRY = "render.ts";

/** The files the panel actually uses, followed rather than listed.
 *
 *  THE RULE IS THE OWNER'S: "check which files are used by VS
 *  Code. These files can exist. Any other files cannot exist."
 *
 *  IT IS FOLLOWED, NEVER DECLARED. A hand-kept list of the surface's parts is a
 *  second place holding one truth, and it goes stale the first time a file is
 *  added. The imports already say what the panel reaches, so they are the
 *  answer.
 *
 *  THE EDITOR REGISTRY IS INSIDE THIS CLOSURE and needs no special case. A form
 *  editor is reached from the renderer like everything else the panel draws. */
export function surfaceFiles(): Set<string> {
  const seen = new Set<string>();
  const queue = [SURFACE_ENTRY];
  while (queue.length > 0) {
    const rel = queue.pop() as string;
    if (seen.has(rel)) continue;
    seen.add(rel);
    let text: string;
    try {
      text = readFileSync(join(ENGINE_DIR, rel), "utf8");
    } catch {
      continue;
    }
    // A TYPE-ONLY IMPORT IS NOT A REACH. `import type` is erased at build
    // time, so the panel never loads that file — counting it would make "the
    // panel reaches it" mean "the type checker reaches it", and one such edge
    // (render.ts type-importing session.ts) dragged most of the engine in.
    const runtime = text
      .split("\n")
      .filter((line) => !/^\s*import\s+type\s/.test(line))
      .join("\n");
    for (const m of runtime.matchAll(/from\s+"(\.\.?\/[\w./-]+\.ts)"/g)) {
      const from = rel.includes("/") ? rel.slice(0, rel.lastIndexOf("/")) : ".";
      const target = join(from, m[1]).replace(/\\/g, "/");
      queue.push(target);
    }
  }
  return new Set([...seen].map((rel) => `${ENGINE_PREFIX}/${rel}`));
}

/** The files declared as exceptions, read from the list a person edits.
 *
 *  A BULLET WITH NO REASON IS IGNORED. The reason is what a reviewer reads to
 *  decide whether the exemption still holds, so a bare path buys nothing.
 *
 *  A MISSING FILE MEANS NO EXEMPTIONS, never a crash. The guard has to answer
 *  even where nobody has written the list yet.
 *
 *  THE LIST BELONGS TO THE PRODUCT BEING CHECKED, so a caller that knows the
 *  root says so. Falling back to the path beside this file is right only when
 *  the engine sits inside the tree it is checking.
 *
 *  IT DOES NOT ALWAYS SIT THERE. A test root BORROWS the engine as a link, and
 *  a linked module resolves its own directory to where it REALLY lives — the
 *  template, which carries the engine and nothing else. The list was copied
 *  into the case root and the guard read the template, found no list, and
 *  reported every declared exemption as an unregistered emitter.
 *
 *  THAT FAILED A CHECK RATHER THAN SKIPPING ONE, which is the worse direction:
 *  it held boot short of the front desk in every fixture that walks. */
export function exempted(root?: string): Set<string> {
  const from = root === undefined ? EXEMPTIONS_FILE : join(root, "deliverable", "machines", "widget-exemptions.md");
  let text: string;
  try {
    text = readFileSync(from, "utf8");
  } catch {
    return new Set();
  }
  // ANY DASH SEPARATES THE PATH FROM THE REASON. Demanding an em dash meant a
  // person typing a hyphen got zero exemptions and no error to explain it.
  const bullets = text.matchAll(/^-\s+(deliverable\/engine\/[\w./-]+\.ts)\s+[-–—]\s+\S/gm);
  return new Set([...bullets].map((m) => m[1]));
}

/** REFUSE A WRITE THAT ADDS AN EMITTER OUTSIDE THE REGISTRY.
 *
 *  IT REFUSES THE ADDITION, NEVER THE EDIT. A file that already emits keeps
 *  being editable, because the eighteen that emit today are the collapse's
 *  work and a guard that froze them would block the fix as well as the fault.
 *
 *  SO THE QUESTION IS: did THIS write turn a quiet file into an emitter. That
 *  is one read of the file on disk and one run of the predicate. */
export function guardNoUnregisteredEmitter(root: string, rootRelativePath: string, content: string, source: string): void {
  const path = rootRelativePath.replace(/\\/g, "/");
  if (!path.startsWith(`${ENGINE_PREFIX}/`) || !path.endsWith(".ts")) return;
  if (!emitsWidget(content)) return;
  if (surfaceFiles().has(path) || exempted(root).has(path)) return;
  const abs = join(root, path);
  if (existsSync(abs) && emitsWidget(readFileSync(abs, "utf8"))) return;
  throw new Rejection({
    clause: CLAUSES.UNREGISTERED_EMITTER,
    expected: "widget markup only from a module the editor registry names, or one the exemption list declares",
    got: `${path} would emit widget markup and is on neither list`,
    remedy: {
      tool: "se_file_patch",
      args: {
        ops: [
          {
            path: "deliverable/machines/widget-exemptions.md",
            old_string: "<!-- exemptions below this line -->",
            new_string: `<!-- exemptions below this line -->\n- ${path} — <why this one is not a second surface>`,
          },
        ],
      },
      note: "wire it into the surface so the panel reaches it, or declare it in the exemption list with its reason if it is genuinely not something a person sees",
    },
    source,
  });
}

/** THE FINDING: a file that emits widget markup and the panel never reaches.
 *
 *  IT IS A SECOND SURFACE BY DEFINITION. The person looks at the panel; markup
 *  the panel cannot reach is markup nobody sees, and it is the place an agent
 *  goes to "fix" something the person will never see fixed. */
export function strays(root?: string): string[] {
  const surface = surfaceFiles();
  const allowed = exempted(root);
  return emitters().filter((path) => !surface.has(path) && !allowed.has(path));
}
