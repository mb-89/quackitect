// The cage while the hooks door stands down: a guarded call meets the
// refusal, and the commands that bring the index back or save the work pass.
// recovers in .claude/skills/level0/hooks/cage.js holds the same contract.
// [[spec/tickets/copilot-hooks-run-in-go]]
package hooks

import (
	"fmt"
	"path"
	"regexp"
	"strings"
)

// The alarm the index keeps its fault under, which AlarmsName in the index owns, and the characters outside quotes that chain, pipe, redirect, substitute or glob. [[spec/tickets/copilot-hooks-run-in-go]]
const (
	alarmsName = "session/alarms"
	shellChars = ";&|<>`$()\\\n\r*?{}[]~#!"
	quoteBans  = "$`\\!"
)

// The runtime folder the standing file stands in, the reads that pass while down, the change of folder a recovery may open on, the work branch a push names, and the flags each saving command takes. [[spec/tickets/copilot-hooks-run-in-go]]
var (
	runtimeFolder = path.Dir(StandingFile)
	unguarded     = map[string]bool{"Read": true, "Grep": true, "Glob": true}
	intoFolder    = regexp.MustCompile(`^\s*cd\s+[\w./-]+\s*&&\s*`)
	workRef       = regexp.MustCompile(`^(HEAD:)?work/[\w./-]+$`)
	longFlag      = regexp.MustCompile(`^--[\w-]+$`)
	commitFlag    = regexp.MustCompile(`(?s)^(-a|--all|-q|--quiet|--message=.*)$`)
	pushFlag      = regexp.MustCompile(`^(-u|--set-upstream|-q|--quiet)$`)
	killSignal    = regexp.MustCompile(`^-(9|15|KILL|TERM)$`)
)

// Whether a call meets the refusal while the door answers nothing. [[spec/tickets/copilot-hooks-run-in-go]]
func Guarded(event string, e map[string]any) bool {
	tool := stringOf(e["tool"])
	if event != toolEvent || unguarded[tool] {
		return false
	}
	command := e["command"]
	if command == nil {
		input, _ := e["input"].(map[string]any)
		command = input["command"]
	}
	return !(tool == "Bash" && Recovers(stringOf(command)))
}

// Whether a command brings the index back or saves the work, standing alone. [[spec/tickets/copilot-hooks-run-in-go]]
func Recovers(command string) bool {
	argv, ok := wordsOf(intoFolder.ReplaceAllString(command, ""))
	if !ok || len(argv) < 2 {
		return false
	}
	head, verb, rest := argv[0], argv[1], argv[2:]
	switch head {
	case "./RUNME.sh":
		if verb == "serve" || verb == "doctor" {
			return every(rest, longFlag.MatchString)
		}
		return verb == "index" && len(rest) == 1 && rest[0] == "standing"
	case "pkill":
		return killsRuntime(argv[1:])
	case "git":
		return gitSaves(verb, rest)
	}
	return false
}

// Whether a git verb and its words read the state or save the work. [[spec/tickets/copilot-hooks-run-in-go]]
func gitSaves(verb string, rest []string) bool {
	switch verb {
	case "status", "log":
		return every(rest, func(word string) bool { return !strings.HasPrefix(word, "--output") })
	case "add":
		return true
	case "commit":
		return commits(rest)
	case "push":
		return pushesWork(rest)
	}
	return false
}

// Whether every word holds. [[spec/tickets/copilot-hooks-run-in-go]]
func every(words []string, holds func(string) bool) bool {
	for _, word := range words {
		if !holds(word) {
			return false
		}
	}
	return true
}

// The words a shell reads off a command, or false where a character outside quotes chains, pipes, redirects or substitutes. [[spec/tickets/copilot-hooks-run-in-go]]
func wordsOf(command string) ([]string, bool) {
	var words []string
	var word strings.Builder
	started := false
	for at := 0; at < len(command); {
		c := command[at]
		switch {
		case c == '\'' || c == '"':
			end := strings.IndexByte(command[at+1:], c)
			if end < 0 {
				return nil, false
			}
			inner := command[at+1 : at+1+end]
			if c == '"' && strings.ContainsAny(inner, quoteBans) {
				return nil, false
			}
			word.WriteString(inner)
			started, at = true, at+end+2
		case c == ' ' || c == '\t':
			if started {
				words = append(words, word.String())
			}
			word.Reset()
			started, at = false, at+1
		case strings.IndexByte(shellChars, c) >= 0:
			return nil, false
		default:
			word.WriteByte(c)
			started, at = true, at+1
		}
	}
	if started {
		words = append(words, word.String())
	}
	return words, true
}

// A commit taking its message and the tracked changes, and no amend and no skipped hook. [[spec/tickets/copilot-hooks-run-in-go]]
func commits(words []string) bool {
	for at := 0; at < len(words); at++ {
		switch word := words[at]; {
		case word == "-m" || word == "-am":
			if at+1 >= len(words) {
				return false
			}
			at++
		case !commitFlag.MatchString(word):
			return false
		}
	}
	return true
}

// A push of a work branch to origin, and no force, no delete and no other ref. [[spec/tickets/copilot-hooks-run-in-go]]
func pushesWork(words []string) bool {
	named := without(words, pushFlag)
	return len(named) == 2 && named[0] == "origin" && workRef.MatchString(named[1])
}

// A pkill matching the full command line against a path under the runtime folder, so it stops the stale index and nothing outside it. [[spec/tickets/copilot-hooks-run-in-go]]
func killsRuntime(words []string) bool {
	named := without(words, killSignal)
	return len(named) == 2 && named[0] == "-f" && strings.Contains(named[1], runtimeFolder+"/")
}

// The words the pattern leaves out. [[spec/tickets/copilot-hooks-run-in-go]]
func without(words []string, out *regexp.Regexp) []string {
	var kept []string
	for _, word := range words {
		if !out.MatchString(word) {
			kept = append(kept, word)
		}
	}
	return kept
}

// A value as the text JavaScript's String reads it, and empty where none stands. [[spec/tickets/copilot-hooks-run-in-go]]
func stringOf(value any) string {
	if value == nil {
		return ""
	}
	if text, ok := value.(string); ok {
		return text
	}
	return fmt.Sprint(value)
}

// The line a guarded call meets while the door stands down. [[spec/tickets/copilot-hooks-run-in-go]]
func RefusedText(e map[string]any) string {
	tool := stringOf(e["tool"])
	if tool == "" {
		tool = "this call"
	}
	return strings.Join([]string{
		"Level zero refuses " + tool + ": the index answers nothing,",
		"so no cage stands behind the call.",
		"The index keeps the fault under " + alarmsName + ".",
		"Run ./RUNME.sh serve to bring it back, or ./RUNME.sh doctor where that fails.",
		"Both pass, and so do read, grep and glob, ./RUNME.sh index standing,",
		"pkill -f naming a path under " + runtimeFolder + "/, and the commands that save the work:",
		"git status, git log, git add, git commit -m, and git push origin work/<name>,",
		"each standing alone, after cd <folder> && at most.",
	}, " ")
}
