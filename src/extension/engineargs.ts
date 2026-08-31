// EVERY ARGUMENT LIST THIS EXTENSION SENDS THE ENGINE, IN ONE PLACE.
//
// A control in the panel sent `se work --form "test"`. The engine has no
// --form, it has --title, so it printed its usage and minted nothing. The
// person who typed a token watched it vanish. Nothing anywhere noticed,
// because the two halves are two programs and the only thing joining them is
// an array of strings that neither one checks.
//
// SO THE ARRAYS LIVE HERE AND A CHECK RUNS EVERY ONE OF THEM. Not against a
// description of the engine, against the engine: .se/scratchpad/engine-args.mjs
// builds each list below and hands it to the real binary in a throwaway folder,
// and an unknown flag is an unknown flag on the day it is typed rather than on
// the day somebody uses the button.
//
// A BUILDER TAKES WHAT THE CONTROL HAS AND ANSWERS WHAT THE ENGINE GETS.
// Nothing here reads the filesystem, spawns anything, or knows about vscode, so
// the check can call it.

export function mintArgs(text: string, kind: string): string[] | undefined {
  const said = text.trim();
  if (!said) return undefined;
  const [scope, traced] = readKind(kind);
  // THE FORM IS BEFORE THE SLASH AND THE DETAIL IS AFTER IT. Four words name
  // the work and the rest is everything the next hand needs.
  const cut = said.indexOf("/");
  const title = (cut < 0 ? said : said.slice(0, cut)).trim();
  const detail = cut < 0 ? "" : said.slice(cut + 1).trim();
  const args = ["work", "--title", title, "--assignee", "human", "--by", "person",
                "--scope", scope, "--traced=" + traced];
  if (detail) args.push("--detail", detail);
  return args;
}

// The picker carries one word for two decisions, so one place reads it apart.
export function readKind(kind: string): [string, string] {
  const [left, right] = kind.split("·");
  const scope = left === "MS" ? "multi-step" : left === "T" ? "token" : "single-step";
  return [scope, right === "E" ? "false" : "true"];
}

export function editCellArgs(id: string, col: string, text: string): string[] {
  return ["work", "--set", id, "--field", col, "--to", text, "--by", "person"];
}

// FILING PUTS A TOKEN IN A GROUPING. The column a person dropped it on says
// which field is written, and the engine decides whether that is allowed.
export function fileArgs(id: string, sets: string, into: string): string[] {
  return ["work", "--set", id, "--" + sets, into];
}

export function groupArgs(ids: string[]): string[] | undefined {
  if (ids.length === 0) return undefined;
  return ["work", "--file", ids.join(","), "--by", "person"];
}

export function renameGroupArgs(from: string, to: string): string[] {
  return ["work", "--rename", from, "--to", to, "--by", "person"];
}

export function holdArgs(on: boolean): string[] {
  return ["hold", on ? "--off" : "--on", "--by", "person"];
}

export function viewArgs(file: string, side: string, rest: string[]): string[] {
  return ["view", "--file", file, "--pane", side, ...rest];
}

export function paneArgs(file: string, side: string): string[] {
  return ["query", "--view", file, "--pane", side];
}

export function panesArgs(file: string): string[] {
  return ["query", "--view", file, "--panes"];
}

export function viewsArgs(): string[] {
  return ["query", "--list"];
}

// PINNING IS ITS OWN BUILDER because a declared group is pinned by name alone.
// Its filter is already in the view file, so sending one would write the same
// rule twice, and sending an absent one put an undefined into the list.
export function pinArgs(name: string, matching?: string): string[] {
  const args = ["--pin", name];
  if (matching !== undefined && matching.trim() !== "") {
    args.push("--matching", matching);
  }
  return args;
}

export function unpinArgs(name: string): string[] {
  return ["--unpin", name];
}

export function widthArgs(property: string, px: number): string[] {
  return ["--width", property + "=" + px];
}

export function orderArgs(cols: string[]): string[] {
  return ["--order", cols.join(",")];
}

// A LEVEL CARRIES ITS POSITION. Without one every level was the same level and
// the engine could hold only one, so a second one overwrote the first.
export function levelArgs(kind: string, at: number, property: string, direction: string): string[] {
  return ["--" + kind, property, "--direction", direction, "--at", String(at)];
}

export function dropLevelArgs(kind: string, at: number): string[] {
  return ["--drop", kind, "--at", String(at)];
}

export function filterArgs(groups: string): string[] {
  return ["--filter", groups];
}
