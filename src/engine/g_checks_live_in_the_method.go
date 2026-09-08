package main

import (
	"fmt"
	"os"
	"path"
	"path/filepath"
	"regexp"
	"strings"
)

// THE CHECKS LIVE IN THE METHOD, NOT IN THE FOLDER THE RETRO DRAINS.
//
// A retro empties .se/scratchpad. While the checks lived there, one run took the
// thing that judges the next one, and the battery would have come back answering
// all ok over nothing.
//
// A CRITERION ONCE DECIDED THIS BY SEARCHING THE RUNNER FOR THE WORDS "go test".
// Those words are in the runner whatever the checks are and wherever they sit. A
// reviewer built the forbidden tree, with every check pointed back at the
// scratchpad, and that command exited zero over it. So this reads the path the
// runner builds and never the words the runner happens to hold.
//
// IT CLEANS THE PATH BEFORE IT JUDGES IT. The check this replaces asked whether
// the built path started with util/checks/, and util/checks/../../.se/scratchpad
// starts with util/checks/ and lands in the drained folder, so the forbidden tree
// walks straight through the rule written against it.
//
// AND A NAME HAS TO HAVE A FILE BEHIND IT. A name written into the list with
// nothing under it makes the runner report a check it could not run, which is a
// red nobody can act on, and the one box that holds the file reads green while
// every other box reads red. That is what dd2fed69 cost, where a check was listed
// while its file stayed out of the commit, and it stopped only because another
// token's commit swept the file in.
//
// WHAT IT DOES NOT ASK IS WHETHER GIT CARRIES THE FILE. A write door sees the
// tree a moment before the write and a check is legally uncommitted for as long
// as it takes to commit it, so demanding a commit here would be a wall. This door
// holds the half a single write can decide.
func aCheckPathTheMethodDoesNotHold(r Roots, _ bool, rel, text string) error {
	if !strings.HasSuffix(rel, ".sh") {
		return nil
	}
	for _, loop := range aCheckLoop.FindAllStringSubmatch(text, -1) {
		use, err := aShellVariable(loop[1])
		if err != nil {
			continue
		}
		names := strings.Fields(loop[2])
		for _, tmpl := range theRunPathsUsing(use, text) {
			for _, name := range names {
				if !aPlainName.MatchString(name) {
					continue // a glob or an expansion is not a name this can resolve
				}
				at, ok := theBuiltPath(tmpl, name, use)
				if !ok {
					continue // a path this cannot read is not a path this refuses
				}
				if at == ".." || strings.HasPrefix(at, "../") {
					return fmt.Errorf("%s runs the check %q out of %s, which climbs out of the work root. "+
						"Nothing outside the tree is carried by a clone, so the run judges whatever that one "+
						"box happens to hold and says nothing about the branch. Build the path under the "+
						"method, as util/checks/%s.mjs, so every box runs the same judge.", rel, name, at, name)
				}
				if at == ".se" || strings.HasPrefix(at, ".se/") {
					return fmt.Errorf("%s runs the check %q out of %s, which sits under .se. "+
						"A retro empties .se/scratchpad, so one run would take the thing that judges the "+
						"next one and the battery would come back answering all ok over nothing. "+
						"Build the path under the method, as util/checks/%s.mjs, where the retro cannot "+
						"reach it.", rel, name, at, name)
				}
				if _, err := os.Stat(filepath.Join(r.Work, filepath.FromSlash(at))); err != nil {
					return fmt.Errorf("%s lists the check %q and builds %s for it, and this tree holds no "+
						"such file. The runner then reports a check it could not run, which is a red "+
						"nobody can act on, and a box that happens to hold the file reads green while "+
						"every other one reads red. That is what dd2fed69 cost, where a name went into "+
						"the list and the file stayed out of the commit. Write %s first and add the name "+
						"in a later write, or leave the name out of the list until the check is there.",
						rel, name, at, at)
				}
			}
		}
	}
	return nil
}

// A LOOP OVER NAMES, read for the variable it walks and the names it walks over.
// The check this replaces asked only for a loop named c and only at column zero,
// so the same list one indent in was invisible to it.
var aCheckLoop = regexp.MustCompile(`(?m)^[ \t]*for[ \t]+([A-Za-z_][A-Za-z0-9_]*)[ \t]+in[ \t]+([^;\n]+);[ \t]*do[ \t]*$`)

// A PATH TO SOMETHING THAT RUNS. The quote is outside the class, so a path in a
// shell string ends where the string does.
var aRunnablePath = regexp.MustCompile(`[A-Za-z0-9_./${}-]*\.(?:mjs|cjs|js|sh|go|py|rb|pl)`)

// A LINE THAT HANDS A FILE TO AN INTERPRETER. This is what separates a path the
// runner runs from a path the runner writes to, and a rule that skipped the
// difference would refuse a loop that builds files it has not built yet.
var anInterpreter = regexp.MustCompile(`(?:^|[\s;|&(])(?:node|deno|bun|sh|bash|zsh|python3?|go|ruby|perl)[ \t]`)

// A NAME THIS CAN RESOLVE. A loop over a glob or over an expansion walks names
// only the shell knows, and those are left alone rather than guessed at.
var aPlainName = regexp.MustCompile(`^[A-Za-z0-9][A-Za-z0-9._-]*$`)

// aShellVariable answers the pattern that finds one use of a shell variable, in
// both the bare and the braced spelling. THE WORD BOUNDARY IS THE POINT. Asking
// for the bare name alone turns $root into the name plus oot when the loop walks
// r, and the path that comes out of that is refused for a reason that is not
// there.
func aShellVariable(name string) (*regexp.Regexp, error) {
	q := regexp.QuoteMeta(name)
	return regexp.Compile(`\$(?:\{` + q + `\}|` + q + `\b)`)
}

// theRunPathsUsing answers every path template the runner hands an interpreter
// that is built from this variable. A comment line is not a run.
func theRunPathsUsing(use *regexp.Regexp, text string) []string {
	seen := map[string]bool{}
	out := []string{}
	for _, line := range strings.Split(text, "\n") {
		if strings.HasPrefix(strings.TrimSpace(line), "#") || !anInterpreter.MatchString(line) {
			continue
		}
		for _, one := range aRunnablePath.FindAllString(line, -1) {
			if !use.MatchString(one) || seen[one] {
				continue
			}
			seen[one] = true
			out = append(out, one)
		}
	}
	return out
}

// theBuiltPath answers where one name lands, as a slash path under the work root,
// and false when the runner spells it in a way this cannot read.
func theBuiltPath(tmpl, name string, use *regexp.Regexp) (string, bool) {
	built := use.ReplaceAllLiteralString(tmpl, name)
	// A VARIABLE IN FRONT STANDS FOR THE FOLDER THE RUNNER WAS HANDED. The
	// battery is given the root to judge and spells the rest under it, so that
	// first segment is the work root and not a folder inside it.
	if strings.HasPrefix(built, "$") {
		if cut := strings.Index(built, "/"); cut >= 0 {
			built = built[cut+1:]
		}
	}
	if strings.Contains(built, "$") || strings.HasPrefix(built, "/") {
		return "", false
	}
	if len(built) > 1 && built[1] == ':' {
		return "", false // a drive letter is a path off this tree
	}
	at := path.Clean(built)
	if at == "." || at == "" {
		return "", false
	}
	return at, true
}
