#!/usr/bin/env node
// se-fence — Claude Code PreToolUse hook. Reads every lock.json under the
// machine-local state base and denies direct harness access to locked
// product roots (exit 2 = block; stderr goes back to the agent). The lane,
// not the fence, is the way in.
//
// Guardrail, not sandbox: path fields are checked exactly; shell commands
// by contains-match on the locked roots and their basenames. An honest
// agent under pressure is the threat model.
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { homedir } from "node:os";
import { basename, join, resolve } from "node:path";

interface Lock {
  product: string;
  locked_roots: string[];
  workspace_exempt?: string;
}

const base = process.env.SE_STATE_DIR ?? join(homedir(), ".se");
const locks: Lock[] = [];
if (existsSync(base)) {
  for (const d of readdirSync(base, { withFileTypes: true })) {
    if (!d.isDirectory()) continue;
    const p = join(base, d.name, "lock.json");
    if (!existsSync(p)) continue;
    try {
      locks.push(JSON.parse(readFileSync(p, "utf8").replace(/^﻿/, "")) as Lock);
    } catch {
      // an unreadable lock never blocks
    }
  }
}
if (locks.length === 0) process.exit(0);

const norm = (s: string): string => s.replaceAll("\\", "/").toLowerCase();

function deny(lock: Lock, what: string): never {
  process.stderr.write(
    `se-fence: "${what}" touches the locked product "${lock.product}". ` +
      `Product access rides the se lane: se_file_search / list / read / write / patch / delete. ` +
      `If the lane lacks the affordance, call se_help first — the logged miss is the demand signal.`,
  );
  process.exit(2);
}

let input = "";
process.stdin.on("data", (c: Buffer) => (input += c.toString()));
process.stdin.on("end", () => {
  let call: { tool_name?: string; tool_input?: Record<string, unknown> };
  try {
    call = JSON.parse(input) as typeof call;
  } catch {
    process.exit(0);
  }
  const ti = call.tool_input ?? {};
  const paths = ["file_path", "path", "notebook_path", "cwd"]
    .map((k) => ti[k])
    .filter((v): v is string => typeof v === "string");
  const command = typeof ti.command === "string" ? ti.command : "";
  for (const lock of locks) {
    const exempt = lock.workspace_exempt !== undefined ? norm(lock.workspace_exempt) : null;
    const inExempt = (abs: string): boolean => exempt !== null && (abs === exempt || abs.startsWith(exempt + "/"));
    for (const rootRaw of lock.locked_roots ?? []) {
      const root = norm(resolve(rootRaw));
      for (const p of paths) {
        const abs = norm(resolve(p));
        if ((abs === root || abs.startsWith(root + "/")) && !inExempt(abs)) deny(lock, p);
      }
      if (command !== "") {
        const cmd = exempt !== null ? norm(command).split(exempt).join("") : norm(command);
        if (cmd.includes(root) || cmd.includes("/" + basename(root).toLowerCase())) deny(lock, command.slice(0, 120));
      }
    }
  }
  process.exit(0);
});
