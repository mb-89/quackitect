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

// THE PANEL MINTS A NOTE, and nothing else.
//
// A note is what a person writes down before anything is decided, which is what
// the box is for. Every other process is minted by an agent, which has to say
// whether the token is tracked. A note takes no such answer, so the box asks
// one question and the engine answers the rest.
export function mintArgs(text: string): string[] | undefined {
  const said = text.trim();
  if (!said) return undefined;
  // THE TITLE IS BEFORE THE SLASH AND THE DETAIL IS AFTER IT. Four words name
  // the work and the rest is everything the next hand needs.
  const cut = said.indexOf("/");
  const title = (cut < 0 ? said : said.slice(0, cut)).trim();
  const detail = cut < 0 ? "" : said.slice(cut + 1).trim();
  const args = ["work", "--title", title, "--by", "person",
                "--process", "note"];
  if (detail) args.push("--detail", detail);
  return args;
}

export function editCellArgs(id: string, col: string, text: string): string[] {
  return ["work", "--set", id, "--field", col, "--to", text, "--by", "person"];
}

// FILING PUTS A TOKEN IN A GROUP THE PERSON MADE.
//
// TWO KINDS OF GROUP AND THIS IS THE SECOND. A query is a filter in the view
// file and nothing drags a row into one. A bucket is a place, and the column
// a person dropped the row on says which field is written. The engine decides
// whether that is allowed, and it refuses a bucket from anybody but a person.
export function fileArgs(id: string, sets: string, into: string): string[] {
  return ["work", "--set", id, "--field", sets, "--to", into, "--by", "person"];
}

// TICKED ROWS MAKE A GROUP. No name is sent: the engine knows which names are
// taken and hands back a free one, which is why the group is made first and
// named afterwards. A webview cannot raise a prompt, so a control that asked
// for a name first did nothing at all when pressed.
export function groupArgs(ids: string[]): string[] | undefined {
  if (ids.length === 0) return undefined;
  return ["work", "--file", ids.join(","), "--by", "person"];
}

export function renameGroupArgs(from: string, to: string): string[] {
  return ["work", "--rename", from, "--to", to, "--by", "person"];
}

// THE HOLD IS A WORD WITH THREE VALUES. One press finishes up, five presses
// hold everything, and a press from either goes back to off. See
// src/engine/hold.go.
export function holdArgs(to: string): string[] {
  return ["hold", "--state", to, "--by", "person"];
}

// HOW MUCH OF THE ENGINE SPEAKS TO THE AGENT. One press moves between bound and
// unbound; the five-press gesture asks for god. See src/engine/unbound.go.
export function bindArgs(to: string): string[] {
  return ["--bind", to];
}

export function bindingArgs(): string[] {
  return ["--bind", "status"];
}

// THE PERSON ASKS WHAT IS HAPPENING, and nothing else runs until it is said.
export function askArgs(on: boolean): string[] {
  return ["--ask", on ? "on" : "off"];
}

export function askedArgs(): string[] {
  return ["--ask", "status"];
}

// THE TREE AS THE ENGINE ANSWERS IT, AND NOT AS THE FILE DECLARES IT.
//
// util/parameters.json is what somebody wrote. The engine's answer is that plus
// what it derives: the icons it resolves, the pickers it fills from the tree,
// and the keyword lines a chat reaches a control by. None of those are in the
// file, because deriving them is what stops anybody keeping a second copy.
//
// A PANEL BUILT FROM THE FILE DRAWS NONE OF THEM. Measured on 2026-09-06: the
// engine answered thirty-two keyword lines, the panel knew how to draw them,
// and the extension handed it the file. Every part worked and none of them met.
export function treeArgs(method: string): string[] {
  return ["--tree", "--method", method];
}

// THE AGENT MAY PUT ITS OWN IDEAS IN. Nothing reads the flag yet, and it is the
// engine's rather than this window's so a chat can reach it and a reload cannot
// lose it. See src/engine/ideation.go.
export function ideationArgs(on: boolean): string[] {
  return ["--ideation", on ? "on" : "off"];
}

export function ideatingArgs(): string[] {
  return ["--ideation", "status"];
}

// WHETHER AN UPDATE IS STILL OWED, read off what askedArgs answered.
//
// THE RULE LIVES HERE BECAUSE THE PANEL AND THE CHECK BOTH NEED IT. The button
// is down while the person is owed an update, and a check that decided that by
// a rule of its own would agree with the panel only by luck. The engine writes
// the press as a record with the time on it and clears the file when the answer
// lands, so the question is whether anything is there.
export function askIsOwed(asked: { on?: string } | null | undefined): boolean {
  return typeof asked?.on === "string" && asked.on !== "";
}

// AND WHETHER IDEATION IS ON, read the same way off what ideatingArgs answered.
// The engine writes the same shape for both, so the rule is the same rule.
export function isIdeating(now: { on?: string } | null | undefined): boolean {
  return typeof now?.on === "string" && now.on !== "";
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

// ---------------------------------------------------------------------------
// THE LIFECYCLE CALLS, which are every other way the extension starts the
// engine.
//
// WHY THEY ARE HERE AND NOT AT THE CALL SITE. The token this file exists for
// says every argument list the extension sends the engine is built in one place
// and driven against the real engine. Seven of the eight were still written as
// literals in extension.ts, so the check bundling this module could not reach
// one of them however many calls it drove. A check whose entry point is the
// module the work created can only ever report on that module.
//
// THEY ARE THE SAME KIND OF THING THAT BROKE. --form against --title is the
// same mistake as --attach or --copies drifting, and the only reason none of
// these is wrong today is that nobody has renamed one yet.
//
// THE WORK FOLDER IS NOT HERE. Every one of these ends with --work <folder> and
// the caller has it, so it is appended at the call site the way it always was.
// What this file owns is which flags a call sends.

export function rotateArgs(): string[] {
  return ["--rotate"];
}

export function projectArgs(): string[] {
  return ["--project"];
}

export function copiesArgs(method: string): string[] {
  return ["--copies", "--method", method];
}

export function attachArgs(method: string): string[] {
  return ["--attach", "--method", method];
}

export function configArgs(method: string): string[] {
  return ["--config", "--method", method];
}

// THE BURN DOWN, for the work editor's bar. The day is the engine's own word
// for today, so the caller does not compute one and get the timezone wrong.
export function burndownArgs(day = "today"): string[] {
  return ["--burndown", day];
}

// WHAT EACH ACTOR IS DOING, for the panel header. It is read off the record by
// the engine, so the panel draws a fact rather than something an agent said.
export function doingArgs(): string[] {
  return ["--doing"];
}

// The kind of vehicle is the person's, chosen from a list the engine answered.
export function initArgs(kind: string): string[] {
  return ["--init", kind];
}

// STARTING THE ENGINE SENDS NO FLAG AT ALL, and that is the whole call. It is
// here so the check can say it looked at it rather than not knowing it exists.
export function startArgs(): string[] {
  return [];
}

// SETTING ONE THING ABOUT A TOKEN, from the panel or from a cell a person
// edited. The key and the text are the person's and the method root is the
// caller's, and the flags are this file's like every other call.
export function setArgs(key: string, text: string, method: string): string[] {
  return ["--set", key + "=" + text, "--method", method];
}

// The language server, which the editor starts and then speaks to over stdio.
//
// THE WHOLE ARGUMENT LIST IS HERE, --stdio INCLUDED. The language client adds
// that flag itself when it is told a transport, and the engine refuses a flag
// it was not given, so the server exited before it read a byte and the editor
// gave up after five tries. The transport is left off the client and the flag
// is written here, so one place says what the server is run with.
export function lspArgs(work: string): string[] {
  return ["lsp", "--work", work, "--stdio"];
}
