package main

import (
	"fmt"
	"os"
	"path/filepath"
	"regexp"
	"strings"
	"testing"
)

// A WINDOW SAYS IT IS HERE, AND STOPS SAYING IT WHEN IT CLOSES.
//
// MEASURED. Closing the editor left the engine running. The fix has to know
// whether this window is the last one on the tree, and nothing in the editor is
// shared between windows, so each window writes a file under .se named by its
// pid, the way the engine writes its own pid to .se/engine.json. The name is
// the pid because the name is the one thing a half finished write cannot spoil.
//
// THE READER AND THE WRITER ARE ONE RULE. A writer nothing reads back is the
// half that goes missing, and a reader with nothing written under it answers
// none and looks correct, so the registry is judged whole.
//
// THE CHECK THIS REPLACES BUNDLED THE MODULE WITH ESBUILD AND CALLED IT. That
// wanted a node module folder beside the extension and it read the live tree,
// so it could only ever say whether this disk happened to be right today. It
// also asked the operating system whether pid 424242 was running and read a yes
// as a failure, which holds only where pids come in multiples of four. On Linux,
// and the cloud is Linux, that pid can belong to something and the check went
// red with nothing wrong. This reads the source of a registry instead, and
// plants both a registry that keeps the rule and ones that break each part.

// windowsSayFile is where the registry is read from, under the work root.
const windowsSayFile = "src/extension/windows.ts"

// windowsSayTheFive are the calls a window makes over its life. It says it is
// here, it asks who else is, it asks whether a pid answers, it sweeps what a
// crashed window left, and it stops saying it is here when it closes.
var windowsSayTheFive = []string{
	"sayWindowIsHere", "forgetWindow", "windowsThere", "windowAnswers", "sweepWindowsGone",
}

// windowsSayMustCatch are the four that touch the disk or a process, and so are
// the four that can throw. None of them may throw at a window.
var windowsSayMustCatch = []string{
	"sayWindowIsHere", "forgetWindow", "windowsThere", "windowAnswers",
}

// windowsAreCountedAndTheGoneAreSwept judges the window registry a tree carries.
// It asks whether every call is there to be driven, whether asking who else is
// here leaves this window out, whether the sweep forgets what does not answer,
// and whether any of it can throw at a window that is only opening or closing.
func windowsAreCountedAndTheGoneAreSwept(r Roots) error {
	raw, err := os.ReadFile(filepath.Join(r.Work, filepath.FromSlash(windowsSayFile)))
	if err != nil {
		return fmt.Errorf("the window registry could not be read, so which windows are on this "+
			"tree cannot be judged: %v", err)
	}
	text := windowsSayWithoutComments(string(raw))

	for _, name := range windowsSayTheFive {
		if !strings.Contains(text, "export function "+name) {
			return fmt.Errorf("%s exports no %s, so that half of the registry is not there to be "+
				"driven. A writer nothing reads back goes missing, and a reader with nothing "+
				"written under it answers none and looks correct. Closing the editor left the "+
				"engine running for exactly that reason. Export all of %s.",
				windowsSayFile, name, strings.Join(windowsSayTheFive, ", "))
		}
	}

	there, held := windowsSayBody(text, "windowsThere")
	if !held {
		return fmt.Errorf("%s declares windowsThere in a shape this cannot read, so whether a "+
			"window counts itself among the others cannot be told at all. Declare it as a plain "+
			"function taking the work root and the pid of the window asking.", windowsSayFile)
	}
	mine, named := windowsSaySecondParam(text, "windowsThere")
	if !named {
		return fmt.Errorf("%s hands windowsThere no second parameter, so it is never told which "+
			"window is asking and cannot leave that one out. Counting itself means no window is "+
			"ever the last one out and the engine outlives the editor, which is the failure this "+
			"file exists to stop. Take the pid of the window asking and skip it.", windowsSayFile)
	}
	skips, readable := windowsSaySkipsItself(there, mine)
	if !readable {
		return fmt.Errorf("%s names the window asking in a way this cannot hold a comparison "+
			"against, so nothing here can say whether it is left out. Name that parameter plainly "+
			"and compare the pid read off each name to it.", windowsSayFile)
	}
	if !skips {
		return fmt.Errorf("%s counts every window it finds, the one that asked included, because "+
			"windowsThere never holds the pid it read against %s. Then no window is ever the last "+
			"one out, every window sees another beside it, and closing the editor leaves the "+
			"engine running. That is the incident. Skip the name whose pid is %s.",
			windowsSayFile, mine, mine)
	}

	sweep, held := windowsSayBody(text, "sweepWindowsGone")
	if !held {
		return fmt.Errorf("%s declares sweepWindowsGone in a shape this cannot read, so whether "+
			"a crashed window is ever taken off the tree cannot be told. Declare it as a plain "+
			"function taking the work root and the pid of the window asking.", windowsSayFile)
	}
	if !strings.Contains(sweep, "windowAnswers") {
		return fmt.Errorf("%s sweeps without asking windowAnswers, so it cannot tell a window "+
			"that is watching the tree from one that crashed. A sweep that guesses either takes a "+
			"live window off the list or takes nothing off it. Ask signal zero about each pid and "+
			"act on the answer.", windowsSayFile)
	}
	if !strings.Contains(sweep, "forgetWindow") {
		return fmt.Errorf("%s counts the windows that do not answer and forgets none of them, so "+
			"what a crashed window left is a window for ever and no window after it is ever the "+
			"last one out. The engine then outlives every editor on the box. Call forgetWindow on "+
			"each pid that does not answer.", windowsSayFile)
	}

	for _, name := range windowsSayMustCatch {
		body, held := windowsSayBody(text, name)
		if !held {
			return fmt.Errorf("%s declares %s in a shape this cannot read, so whether it throws "+
				"at a window cannot be told. Declare it as a plain function.", windowsSayFile, name)
		}
		if !strings.Contains(body, "catch") {
			return fmt.Errorf("%s lets %s throw. A folder that is not there yet, a file a sweep "+
				"took first, and a pid nothing is running under are all ordinary, and a window "+
				"that cannot say it is here still has to open. What that costs is an engine which "+
				"outlives the window, and that is where this started rather than a new failure. "+
				"Catch what it throws and answer nothing, none, or false.", windowsSayFile, name)
		}
	}
	return nil
}

// windowsSayDeclared is one declared function, with its name and its parameter
// list held so a body and a parameter can be found from it.
var windowsSayDeclared = regexp.MustCompile(`function\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*\(([^)]*)\)`)

// windowsSayBody is what a declared function does. The return types written
// here carry no braces, so the first brace past the parameter list opens the
// body, and braces are counted plainly.
func windowsSayBody(text, name string) (string, bool) {
	for _, where := range windowsSayDeclared.FindAllStringSubmatchIndex(text, -1) {
		if text[where[2]:where[3]] != name {
			continue
		}
		at := where[1]
		for at < len(text) && text[at] != '{' {
			at++
		}
		return windowsSayBraced(text, at)
	}
	return "", false
}

// windowsSayBraced takes the balanced group that opens at open.
func windowsSayBraced(text string, open int) (string, bool) {
	if open >= len(text) || text[open] != '{' {
		return "", false
	}
	depth := 0
	for at := open; at < len(text); at++ {
		switch text[at] {
		case '{':
			depth++
		case '}':
			depth--
			if depth == 0 {
				return text[open : at+1], true
			}
		}
	}
	return "", false
}

// windowsSaySecondParam is the name a function calls its second parameter,
// which is where the pid of the window asking is handed in.
func windowsSaySecondParam(text, name string) (string, bool) {
	for _, m := range windowsSayDeclared.FindAllStringSubmatch(text, -1) {
		if m[1] != name {
			continue
		}
		parts := strings.Split(m[2], ",")
		if len(parts) < 2 {
			return "", false
		}
		one := strings.TrimSpace(parts[1])
		if at := strings.Index(one, ":"); at >= 0 {
			one = strings.TrimSpace(one[:at])
		}
		if !windowsSayIsAName(one) {
			return "", false
		}
		return one, true
	}
	return "", false
}

// windowsSayIsAName says whether this is a plain identifier, which is all a
// comparison can be built around.
func windowsSayIsAName(said string) bool {
	if said == "" {
		return false
	}
	for at := 0; at < len(said); at++ {
		c := said[at]
		letter := c == '_' || c == '$' || (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z')
		digit := at > 0 && c >= '0' && c <= '9'
		if !letter && !digit {
			return false
		}
	}
	return true
}

// windowsSaySkipsItself says whether the body holds the window asking against
// what it read, from either side of the comparison. It answers false and
// unreadable when no comparison can be built at all.
func windowsSaySkipsItself(body, mine string) (bool, bool) {
	held := regexp.QuoteMeta(mine)
	against, err := regexp.Compile(`[=!]==?\s*` + held + `\b|\b` + held + `\s*[=!]==?`)
	if err != nil {
		return false, false
	}
	return against.MatchString(body), true
}

// windowsSayWithoutComments blanks the comments before anything is looked for.
// A rule about what the registry does must not be met by a sentence about doing
// it, and this module is written mostly in sentences.
func windowsSayWithoutComments(src string) string {
	out := []byte(src)
	for at := 0; at+1 < len(out); {
		if out[at] == '/' && out[at+1] == '/' {
			for at < len(out) && out[at] != '\n' {
				out[at] = ' '
				at++
			}
			continue
		}
		if out[at] == '/' && out[at+1] == '*' {
			for at < len(out) {
				closing := out[at] == '*' && at+1 < len(out) && out[at+1] == '/'
				if out[at] != '\n' {
					out[at] = ' '
				}
				at++
				if closing {
					if at < len(out) {
						out[at] = ' '
						at++
					}
					break
				}
			}
			continue
		}
		at++
	}
	return string(out)
}

// THE PIECES A PLANTED REGISTRY IS BUILT FROM. Each case swaps exactly one of
// them, so what is judged is the one difference and nothing beside it.

const windowsSayHead = `
import * as fs from "node:fs";
import * as path from "node:path";

export type Window = { pid: number };

const SUFFIX = ".json";

function dir(work: string): string {
  return path.join(work, ".se", "windows");
}
`

const windowsSaySaysItIsHere = `
export function sayWindowIsHere(work: string, pid: number): void {
  try {
    fs.mkdirSync(dir(work), { recursive: true });
    fs.writeFileSync(path.join(dir(work), pid + SUFFIX), JSON.stringify({ pid }), "utf8");
  } catch {
    return;
  }
}
`

const windowsSaySaysItIsHereAndThrows = `
export function sayWindowIsHere(work: string, pid: number): void {
  fs.mkdirSync(dir(work), { recursive: true });
  fs.writeFileSync(path.join(dir(work), pid + SUFFIX), JSON.stringify({ pid }), "utf8");
}
`

const windowsSayForgets = `
export function forgetWindow(work: string, pid: number): void {
  try {
    fs.rmSync(path.join(dir(work), pid + SUFFIX));
  } catch {
    return;
  }
}
`

const windowsSayReadsTheOthers = `
export function windowsThere(work: string, self: number): Window[] {
  let names: string[] = [];
  try {
    names = fs.readdirSync(dir(work));
  } catch {
    return [];
  }
  const out: Window[] = [];
  for (const name of names) {
    if (!name.endsWith(SUFFIX)) continue;
    const pid = Number(name.slice(0, name.length - SUFFIX.length));
    if (!Number.isInteger(pid) || pid <= 0 || pid === self) continue;
    out.push({ pid });
  }
  return out;
}
`

// ANOTHER HAND WRITING THE SAME RULE. The parameter is named differently, the
// comparison sits on the other side, and the pid comes off the name another
// way. A door that knows only one spelling passes the planted cases for the
// wrong reason, so this one has to be let through as well.
const windowsSayReadsTheOthersInOtherWords = `
export function windowsThere(work: string, mine: number): Window[] {
  let names: string[] = [];
  try {
    names = fs.readdirSync(dir(work));
  } catch {
    return [];
  }
  const out: Window[] = [];
  for (const name of names) {
    const pid = Number(path.basename(name, SUFFIX));
    if (!name.endsWith(SUFFIX) || !Number.isInteger(pid) || pid < 1) continue;
    if (mine !== pid) out.push({ pid });
  }
  return out;
}
`

const windowsSayReadsTheOthersAndItself = `
export function windowsThere(work: string, self: number): Window[] {
  let names: string[] = [];
  try {
    names = fs.readdirSync(dir(work));
  } catch {
    return [];
  }
  const out: Window[] = [];
  for (const name of names) {
    if (!name.endsWith(SUFFIX)) continue;
    const pid = Number(name.slice(0, name.length - SUFFIX.length));
    if (!Number.isInteger(pid) || pid <= 0) continue;
    out.push({ pid });
  }
  return out;
}
`

const windowsSayReadsTheOthersAndThrows = `
export function windowsThere(work: string, self: number): Window[] {
  const names: string[] = fs.readdirSync(dir(work));
  const out: Window[] = [];
  for (const name of names) {
    if (!name.endsWith(SUFFIX)) continue;
    const pid = Number(name.slice(0, name.length - SUFFIX.length));
    if (!Number.isInteger(pid) || pid <= 0 || pid === self) continue;
    out.push({ pid });
  }
  return out;
}
`

const windowsSayAsksAPid = `
export function windowAnswers(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}
`

const windowsSayAsksAPidAndThrows = `
export function windowAnswers(pid: number): boolean {
  process.kill(pid, 0);
  return true;
}
`

const windowsSaySweeps = `
export function sweepWindowsGone(work: string, self: number): number {
  let swept = 0;
  for (const w of windowsThere(work, self)) {
    if (windowAnswers(w.pid)) continue;
    forgetWindow(work, w.pid);
    swept++;
  }
  return swept;
}
`

const windowsSaySweepsAndKeepsThem = `
export function sweepWindowsGone(work: string, self: number): number {
  let swept = 0;
  for (const w of windowsThere(work, self)) {
    if (windowAnswers(w.pid)) continue;
    swept++;
  }
  return swept;
}
`

const windowsSaySweepsUnexported = `
function sweepWindowsGone(work: string, self: number): number {
  let swept = 0;
  for (const w of windowsThere(work, self)) {
    if (windowAnswers(w.pid)) continue;
    forgetWindow(work, w.pid);
    swept++;
  }
  return swept;
}
`

// windowsSayWhole builds one planted registry out of the five pieces.
func windowsSayWhole(says, forgets, there, answers, sweep string) string {
	return windowsSayHead + says + forgets + there + answers + sweep
}

// TestWindowsAreCountedAndTheGoneAreSwept drives two registries that keep the
// rule and six that break one part of it each. A reader that refused every
// registry would pass the planted cases for the wrong reason, so the two clean
// registries carry the most weight here.
func TestWindowsAreCountedAndTheGoneAreSwept(t *testing.T) {
	t.Parallel()
	cases := []struct {
		said     string
		registry string
		refused  bool
	}{
		{
			said: "a window says it is here, leaves itself out, and sweeps the gone",
			registry: windowsSayWhole(windowsSaySaysItIsHere, windowsSayForgets,
				windowsSayReadsTheOthers, windowsSayAsksAPid, windowsSaySweeps),
		},
		{
			said: "the same rule written by another hand",
			registry: windowsSayWhole(windowsSaySaysItIsHere, windowsSayForgets,
				windowsSayReadsTheOthersInOtherWords, windowsSayAsksAPid, windowsSaySweeps),
		},
		{
			said: "the window counts itself among the others",
			registry: windowsSayWhole(windowsSaySaysItIsHere, windowsSayForgets,
				windowsSayReadsTheOthersAndItself, windowsSayAsksAPid, windowsSaySweeps),
			refused: true,
		},
		{
			said: "the sweep counts what is gone and forgets none of it",
			registry: windowsSayWhole(windowsSaySaysItIsHere, windowsSayForgets,
				windowsSayReadsTheOthers, windowsSayAsksAPid, windowsSaySweepsAndKeepsThem),
			refused: true,
		},
		{
			said: "asking who is here throws on a tree nobody has opened",
			registry: windowsSayWhole(windowsSaySaysItIsHere, windowsSayForgets,
				windowsSayReadsTheOthersAndThrows, windowsSayAsksAPid, windowsSaySweeps),
			refused: true,
		},
		{
			said: "asking whether a pid answers throws when it does not",
			registry: windowsSayWhole(windowsSaySaysItIsHere, windowsSayForgets,
				windowsSayReadsTheOthers, windowsSayAsksAPidAndThrows, windowsSaySweeps),
			refused: true,
		},
		{
			said: "the sweep is written and never exported",
			registry: windowsSayWhole(windowsSaySaysItIsHere, windowsSayForgets,
				windowsSayReadsTheOthers, windowsSayAsksAPid, windowsSaySweepsUnexported),
			refused: true,
		},
		{
			said: "saying it is here throws at a window that is only opening",
			registry: windowsSayWhole(windowsSaySaysItIsHereAndThrows, windowsSayForgets,
				windowsSayReadsTheOthers, windowsSayAsksAPid, windowsSaySweeps),
			refused: true,
		},
	}
	for _, c := range cases {
		c := c
		t.Run(c.said, func(t *testing.T) {
			t.Parallel()
			dir := t.TempDir()
			windowsSayPlant(t, dir, c.registry)
			err := windowsAreCountedAndTheGoneAreSwept(Roots{Work: dir, Method: dir})
			if c.refused && err == nil {
				t.Fatal("the registry was let through, and the engine outlives the editor that " +
					"was watching the tree")
			}
			if !c.refused && err != nil {
				t.Fatalf("a registry that keeps the rule was refused: %v", err)
			}
		})
	}
}

// TestWindowsAreCountedSayWhichHalfWentWrong holds the refusals to naming the
// defect. A sentence that only says no leaves the reader to work out which of
// the five calls it meant.
func TestWindowsAreCountedSayWhichHalfWentWrong(t *testing.T) {
	t.Parallel()
	cases := []struct {
		registry string
		names    string
	}{
		{
			registry: windowsSayWhole(windowsSaySaysItIsHere, windowsSayForgets,
				windowsSayReadsTheOthersAndItself, windowsSayAsksAPid, windowsSaySweeps),
			names: "windowsThere",
		},
		{
			registry: windowsSayWhole(windowsSaySaysItIsHere, windowsSayForgets,
				windowsSayReadsTheOthers, windowsSayAsksAPid, windowsSaySweepsAndKeepsThem),
			names: "forgetWindow",
		},
		{
			registry: windowsSayWhole(windowsSaySaysItIsHere, windowsSayForgets,
				windowsSayReadsTheOthers, windowsSayAsksAPidAndThrows, windowsSaySweeps),
			names: "windowAnswers",
		},
		{
			registry: windowsSayWhole(windowsSaySaysItIsHere, windowsSayForgets,
				windowsSayReadsTheOthers, windowsSayAsksAPid, windowsSaySweepsUnexported),
			names: "sweepWindowsGone",
		},
	}
	for _, c := range cases {
		c := c
		t.Run(c.names, func(t *testing.T) {
			t.Parallel()
			dir := t.TempDir()
			windowsSayPlant(t, dir, c.registry)
			err := windowsAreCountedAndTheGoneAreSwept(Roots{Work: dir, Method: dir})
			if err == nil {
				t.Fatal("the planted registry was let through")
			}
			if !strings.Contains(err.Error(), c.names) {
				t.Errorf("the refusal does not name %s. said: %v", c.names, err)
			}
		})
	}
}

// TestWindowsAreCountedReadNoLiveTree makes the point that this plants what it
// judges. A work root with no registry in it is a plain refusal rather than a
// reach into whatever this repository holds today, and nothing here asks the
// operating system about a pid, which is what made the file this replaces go
// red on Linux with nothing wrong.
func TestWindowsAreCountedReadNoLiveTree(t *testing.T) {
	t.Parallel()
	if err := windowsAreCountedAndTheGoneAreSwept(Roots{Work: t.TempDir(), Method: t.TempDir()}); err == nil {
		t.Fatal("an empty work root was read as a registry that keeps the rule")
	}
}

// windowsSayPlant writes one registry into a temporary work root.
func windowsSayPlant(t *testing.T, dir, registry string) {
	t.Helper()
	at := filepath.Join(dir, filepath.FromSlash(windowsSayFile))
	if err := os.MkdirAll(filepath.Dir(at), 0o755); err != nil {
		t.Fatalf("the planted extension folder was not made: %v", err)
	}
	if err := os.WriteFile(at, []byte(registry), 0o644); err != nil {
		t.Fatalf("the planted registry was not written: %v", err)
	}
}
