// The guard while the hooks door stands down: which call stays guarded, which
// command recovers the index or saves the work, and the refusal a guarded call
// meets. The rules leave cage.ts for this file.
// [[spec/tickets/level0-hooks-hold-no-rule]]
package hooks

import (
	"fmt"
	"regexp"
	"slices"
	"strings"
)

// The runtime folder a pkill names and the alarm the index keeps its fault under, which index.Runtime and index.AlarmsName own, spelled again here because the hooks module imports no index. [[spec/rationales/the-cage-refuses-while-down]]
const (
	guardRuntime = ".se/.runtime"
	guardAlarms  = "session/alarms"
	guardRunme   = "./RUNME.sh"
)

// The calls that pass while the door stands down: the harness reads. [[spec/tickets/a-down-index-refuses-calls]] [[spec/tickets/level0-tools-leave-the-bridge]]
var unguarded = []string{"Read", "Grep", "Glob"}

// The change of folder that leads a recovery command, which moves the shell alone, and the words a recovery takes. [[spec/tickets/the-cage-survives-its-index]]
var (
	into       = regexp.MustCompile(`^\s*cd\s+[\w./-]+\s*&&\s*`)
	flagWord   = regexp.MustCompile(`^--[\w-]+$`)
	workRef    = regexp.MustCompile(`^(HEAD:)?work/[\w./-]+$`)
	commitFlag = regexp.MustCompile(`(?s)^(-a|--all|-q|--quiet|--message=.*)$`)
	pushFlag   = regexp.MustCompile(`^(-u|--set-upstream|-q|--quiet)$`)
	killSignal = regexp.MustCompile(`^-(9|15|KILL|TERM)$`)
)

// A character outside quotes that chains, pipes, redirects, substitutes or globs, so the words it stands in run as no recovery command. A double-quoted word refuses the expanding ones. [[spec/tickets/the-cage-survives-its-index]]
const (
	shellChars  = ";&|<>`$()\\\n\r*?{}[]~#!"
	expandChars = "$`\\!"
)

// Whether a call stays guarded while the door stands down. [[spec/tickets/a-down-index-refuses-calls]]
func Guarded(event string, e map[string]any) bool {
	tool := stringOf(e["tool"])
	if event != toolEvent || slices.Contains(unguarded, tool) {
		return false
	}
	return !(tool == "Bash" && Recovers(commandOf(e)))
}

// The command a Bash call carries, on the call or under its input. [[spec/tickets/a-down-index-refuses-calls]]
func commandOf(e map[string]any) string {
	if command, ok := e["command"]; ok && command != nil {
		return stringOf(command)
	}
	input, _ := e["input"].(map[string]any)
	return stringOf(input["command"])
}

// A value as text, and nothing as the empty text. [[spec/tickets/a-down-index-refuses-calls]]
func stringOf(value any) string {
	if value == nil {
		return ""
	}
	if text, ok := value.(string); ok {
		return text
	}
	return fmt.Sprint(value)
}

// Whether a command brings the index back or saves the work, so a box whose door falls mid-work recovers and pushes. Every other command stays guarded. [[spec/tickets/the-cage-survives-its-index]] [[spec/rationales/the-cage-refuses-while-down]]
func Recovers(command string) bool {
	argv := WordsOf(into.ReplaceAllString(command, ""))
	if len(argv) == 0 {
		return false
	}
	head, verb, rest := argv[0], "", []string{}
	if len(argv) > 1 {
		verb, rest = argv[1], argv[2:]
	}
	switch head {
	case guardRunme:
		if verb == "serve" || verb == "doctor" {
			return allMatch(rest, flagWord.MatchString)
		}
		return verb == "index" && len(rest) == 1 && rest[0] == "standing"
	case "pkill":
		return killsRuntime(argv[1:])
	case "git":
		return savesWork(verb, rest)
	}
	return false
}

// The git commands that read or save the work: a status or a log writing no file, an add, a plain commit, and a push of a work branch. [[spec/tickets/the-cage-survives-its-index]]
func savesWork(verb string, rest []string) bool {
	switch verb {
	case "status", "log":
		return allMatch(rest, func(word string) bool { return !strings.HasPrefix(word, "--output") })
	case "add":
		return true
	case "commit":
		return commits(rest)
	case "push":
		return pushesWork(rest)
	}
	return false
}

// Whether every word passes. [[spec/tickets/the-cage-survives-its-index]]
func allMatch(words []string, passes func(string) bool) bool {
	for _, word := range words {
		if !passes(word) {
			return false
		}
	}
	return true
}

// The words a shell reads off a command, or nil where a character outside quotes chains, pipes, redirects or substitutes. A single-quoted word holds anything, and a double-quoted one holds no expansion, so a commit message stays one word. [[spec/tickets/the-cage-survives-its-index]]
func WordsOf(command string) []string {
	words := []string{}
	var word *strings.Builder
	for at := 0; at < len(command); {
		c := command[at]
		switch {
		case c == '\'' || c == '"':
			end := strings.IndexByte(command[at+1:], c)
			if end < 0 {
				return nil
			}
			inner := command[at+1 : at+1+end]
			if c == '"' && strings.ContainsAny(inner, expandChars) {
				return nil
			}
			if word == nil {
				word = &strings.Builder{}
			}
			word.WriteString(inner)
			at += end + 2
		case c == ' ' || c == '\t':
			if word != nil {
				words = append(words, word.String())
			}
			word = nil
			at++
		case strings.IndexByte(shellChars, c) >= 0:
			return nil
		default:
			if word == nil {
				word = &strings.Builder{}
			}
			word.WriteByte(c)
			at++
		}
	}
	if word != nil {
		words = append(words, word.String())
	}
	return words
}

// A commit taking its message and the tracked changes, and no amend and no skipped hook. [[spec/tickets/the-cage-survives-its-index]]
func commits(words []string) bool {
	for at := 0; at < len(words); at++ {
		word := words[at]
		if word == "-m" || word == "-am" {
			if at+1 >= len(words) {
				return false
			}
			at++
		} else if !commitFlag.MatchString(word) {
			return false
		}
	}
	return true
}

// A push of a work branch to origin, and no force, no delete and no other ref. [[spec/tickets/the-cage-survives-its-index]]
func pushesWork(words []string) bool {
	named := slices.DeleteFunc(slices.Clone(words), pushFlag.MatchString)
	return len(named) == 2 && named[0] == "origin" && workRef.MatchString(named[1])
}

// A pkill matching the full command line against a path under the runtime folder, so it stops the stale index and nothing outside it. [[spec/tickets/the-cage-survives-its-index]]
func killsRuntime(words []string) bool {
	named := slices.DeleteFunc(slices.Clone(words), killSignal.MatchString)
	return len(named) == 2 && named[0] == "-f" && strings.Contains(named[1], guardRuntime+"/")
}

// The one line a guarded call meets while the hooks door stands down. [[spec/tickets/a-down-index-refuses-calls]]
func RefusedText(e map[string]any) string {
	tool := "this call"
	if named, ok := e["tool"]; ok && named != nil {
		tool = stringOf(named)
	}
	return strings.Join([]string{
		"Level zero refuses " + tool + ": the index answers nothing,",
		"so no cage stands behind the call.",
		"The index keeps the fault under " + guardAlarms + ".",
		"Run ./RUNME.sh serve to bring it back, or ./RUNME.sh doctor where that fails.",
		"Both pass, and so do read, grep and glob, ./RUNME.sh index standing,",
		"pkill -f naming a path under " + guardRuntime + "/, and the commands that save the work:",
		"git status, git log, git add, git commit -m, and git push origin work/<name>,",
		"each standing alone, after cd <folder> && at most.",
	}, " ")
}
