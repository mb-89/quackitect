// se.shoot — RENDER THE MIRROR AND LOOK AT IT.
//
// Why this is a tool and not a script: the assistant cannot judge a surface it
// has never seen, and every UI round without it has cost the owner a
// correction. Built by hand twice in one session, which is v2's own rule for
// what a missing tool looks like — every ad-hoc script the agent writes is an
// SE tool that does not exist yet.
//
// NEVER OVER HTTP. Calling this session's own mirror from inside a run blocks
// the server's event loop, so the mirror cannot answer itself. Rendering
// straight to a file sidesteps that entirely and needs no server at all.
//
// The shot lands under .se/, which is SESSION state — never project/, where a
// binary file is a defect the suite refuses.
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { CLAUSES, Rejection } from "./errors.ts";
import { IMAGE_BUDGET } from "./files.ts";
import { contentHash } from "./hash.ts";
import { seDir } from "./paths.ts";

const SRC = "engine/shoot.ts";

/** Where a headless Chromium might be. First hit wins; none is a refusal. */
const BROWSERS = [
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  "/usr/bin/chromium",
  "/usr/bin/google-chrome",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
];

function findBrowser(): string {
  const hit = BROWSERS.find((p) => existsSync(p));
  if (hit === undefined) {
    throw new Rejection({
      clause: CLAUSES.REQUIRED_ARGS,
      expected: "a headless Chromium the lane can drive (Chrome or Edge)",
      got: "none of the known locations holds one",
      remedy: { tool: "se_run", args: { command: "# install Chrome or Edge, or add its path to BROWSERS in engine/shoot.ts" } },
      source: SRC,
    });
  }
  return hit;
}

export interface ShootResult {
  path: string;
  hash: string;
  bytes: number;
  media_type: string;
  content: string;
  width: number;
  height: number;
  _attachments: { type: string; data: string; mimeType: string }[];
}

/**
 * Write `html` to a file and photograph it. The caller supplies the HTML, so
 * this stays a PHOTOGRAPHER and never learns what a mirror is.
 */
export function shoot(root: string, html: string, opts: { width?: number; height?: number; name?: string } = {}): ShootResult {
  const width = opts.width ?? 1600;
  const height = opts.height ?? 1000;
  const dir = join(seDir(root), "shots");
  mkdirSync(dir, { recursive: true });
  const name = (opts.name ?? "shot").replace(/[^a-z0-9-]/gi, "-");
  const page = join(dir, `${name}.html`);
  const png = join(dir, `${name}.png`);
  writeFileSync(page, html, "utf8");

  const r = spawnSync(
    findBrowser(),
    ["--headless", "--disable-gpu", "--hide-scrollbars", `--window-size=${width},${height}`, `--screenshot=${png}`, page],
    { encoding: "utf8", timeout: 30_000 },
  );
  if (!existsSync(png)) {
    throw new Rejection({
      clause: CLAUSES.REQUIRED_ARGS,
      expected: "a screenshot on disk",
      got: `the browser wrote none (status ${String(r.status)}): ${String(r.stderr ?? "").slice(0, 300)}`,
      remedy: { tool: "se_run", args: { command: `# try the browser by hand against ${page}` } },
      source: SRC,
    });
  }

  const bytes = readFileSync(png);
  if (bytes.length > IMAGE_BUDGET) {
    throw new Rejection({
      clause: CLAUSES.OVERSIZE_READ,
      expected: `a shot under ${IMAGE_BUDGET} bytes — this one is ${bytes.length}`,
      got: `${width}x${height}`,
      remedy: {
        tool: "se_shoot",
        args: { width: Math.round(width / 2), height: Math.round(height / 2) },
        note: "shoot a smaller window, or one widget instead of the page",
      },
      source: SRC,
    });
  }
  return {
    path: `.se/shots/${name}.png`,
    hash: contentHash(bytes),
    bytes: bytes.length,
    media_type: "image/png",
    content: `image/png, ${bytes.length} bytes at ${width}x${height} — the image itself rides with this result`,
    width,
    height,
    _attachments: [{ type: "image", data: bytes.toString("base64"), mimeType: "image/png" }],
  };
}
