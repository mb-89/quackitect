// THE CAGE UNDER NEW. The hooks door decides the events it names, and Go holds every rule: the door answers the step, and the cage verb answers a guarded call while the door stands down. The loader follows $ into no import, so the bridgehead makes every call on $, and this file holds the post and the verb road. [[spec/tickets/a-down-index-refuses-calls]] [[spec/tickets/level0-hooks-hold-no-rule]] [[spec/rationales/the-cage-refuses-while-down]]

import type { AgentSpawnArgs, HttpInit } from "claude-code";
import type { Fields } from "./shape.ts";

// The runtime folder, which src/modules/check/folders.go owns, spelled again here because the hooks import their own folder alone. [[spec/tickets/plugin-libs-leave]]
const RUN = ".se/.runtime";
// The binary under the method root, which serveIndexBin in src/quack/serve_verb.go names. [[spec/tickets/cli-js-leaves]]
const BINARY = `${RUN}/bin/se-index`;

// The binary under the method root, with the suffix a Windows box builds it with. [[spec/tickets/the-hook-registers-index-tools]]
export function binaryOf(method: string, windows: boolean): string {
  return `${method}/${BINARY}${windows ? ".exe" : ""}`;
}

// Whether the method root reads as a Windows path, since the hook reaches no platform of its own. [[spec/tickets/the-hook-registers-index-tools]]
export function windowsOf(method: string): boolean {
  return /^[A-Za-z]:/.test(method) || method.includes("\\");
}

// What the step answers a call with, read off the door's JSON, which Step in src/modules/hooks/step.go owns. [[spec/design_output/model#the-effects]]
export type Answer = {
  readonly register?: unknown;
  readonly clear?: { readonly prompt?: unknown };
  readonly needs?: unknown;
  readonly spawn?: AgentSpawnArgs;
  readonly back?: Readonly<Fields> & { readonly event?: unknown };
  readonly result?: unknown;
  readonly pass?: unknown;
  readonly event?: unknown;
  readonly after?: Readonly<Fields>;
  readonly deny?: string;
  readonly block?: string;
};
// The step the door answers beside its effects, which StepOf in src/modules/hooks/step.go builds. [[spec/tickets/level0-hooks-hold-no-rule]]
export type Step = {
  answer?: Answer;
  rows?: string;
  blocks?: { name: string; text: string }[];
  after?: string[];
};
// What the door answers a post. [[spec/tickets/level0-hooks-hold-no-rule]]
export type Said = { readonly step?: Step };

// The standing file the hooks door writes, which StandingFile in src/modules/hooks/hooks.go owns, spelled again here because this hook imports its own folder alone. [[spec/tickets/a-down-index-refuses-calls]]
export const HOOKS_FILE = `${RUN}/hooks.json`;

// The post the door reads at a path: its address, and the body with the standing token as a bearer. [[spec/design_output/model#a-post-and-its-answer]]
export function postOf(
  standing: { readonly port?: unknown; readonly token?: unknown } | null | undefined,
  path: string,
  body: Readonly<Fields>,
): { where: string; init: HttpInit } {
  return {
    where: `http://127.0.0.1:${standing?.port}/${path}`,
    init: {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${standing?.token}`,
      },
      body: JSON.stringify(body),
    },
  };
}

// The hook post of an event. [[spec/design_output/model#a-post-and-its-answer]]
export function hookOf(
  standing: { readonly port?: unknown; readonly token?: unknown } | null | undefined,
  event: string,
  e: unknown,
  root: string,
  extra: Readonly<Fields> | undefined,
): { where: string; init: HttpInit } {
  return postOf(standing, "hook", { event, e: e ?? null, root, ...extra });
}

// A verb of the index binary under a root, so Go answers what the hook hands it. A Windows box builds the binary with its suffix. [[spec/tickets/level0-hooks-hold-no-rule]] [[spec/tickets/level0-smoke-runs-in-seconds]]
export function verbOf(at: string, ...words: string[]): string[] {
  return [binaryOf(at, windowsOf(at)), "verb", `${at}/src/scripts`, ...words];
}

// The cage verb's input: the event and the call it guards. [[spec/tickets/level0-hooks-hold-no-rule]]
export function cageInput(event: string, e: unknown): string {
  return JSON.stringify({ event, e: e ?? null });
}

// The deny the cage verb printed, or null where it passes the call. [[spec/tickets/level0-hooks-hold-no-rule]]
export function cageDeny(stdout: unknown): { deny: string } | null {
  try {
    const said = JSON.parse(String(stdout ?? "").trim() || "null");
    return typeof said?.deny === "string" ? { deny: said.deny } : null;
  } catch {
    return null;
  }
}
