package main

import (
	"fmt"
	"strings"
)

// SEARCH WITH THE TOOL THE PROBE FOUND.
//
// The engine probes this machine on every boot and hands the list over on the
// first pull of a session. It found the searching tool and wrote it down, and
// the agent went on typing the one its fingers knew. So the gap was never
// knowledge: nothing said prefer it, and nothing noticed when it was not used.
//
// A REFUSAL IS THE ONLY THING THAT WORKS. Every rule the agent was asked to
// remember it eventually forgot. So a recursive search over the tree with the
// older tool is refused, and the refusal names what the probe found.
//
// A SEARCH ON ONE NAMED FILE IS LEFT ALONE. The newer tool is not that tool: it
// reads a tree where the other reads a file or standard input, and refusing the
// permitted case would send the agent looking for a workaround rather than a
// better search.
//
// THE ENGINE CARRIES NO TOOL NAME. The probe's list is the only place a tool is
// named, so the day the probe finds a different one the refusal changes with no
// edit here.

// TheSearcher answers what this machine's probe found for searching file
// contents, or nothing.
func TheSearcher(r Roots, session string) (Tool, bool) {
	for _, t := range KnownTools(r, session) {
		if strings.Contains(t.For, searchingFor) {
			return t, true
		}
	}
	return Tool{}, false
}

// What the candidate list says a searching tool is for. It is the one string
// that ties this rule to the probe, and it lives in util/tools.json.
const searchingFor = "searching file contents"

// ARecursiveSearch answers whether this command searches a tree with a tool the
// probe has something better than, and names what it found.
//
// IT READS THE COMMAND RATHER THAN THE WORD. A word anywhere in a sentence is
// not a program being run, and a command behind a pipe still runs one.
func ARecursiveSearch(command string, better Tool) (string, bool) {
	for _, part := range pipeline(command) {
		words := strings.Fields(part)
		if len(words) == 0 {
			continue
		}
		if !olderSearcher(words[0]) {
			continue
		}
		if !readsATree(words[1:]) {
			continue
		}
		return fmt.Sprintf(
			"A RECURSIVE SEARCH OVER THE TREE GOES THROUGH %s, which this machine has "+
				"at %s. It reads a tree where %s reads a file, it respects the ignore "+
				"rules, and it is about six times faster on this tree.\n\n"+
				"What was run: %s\n\n"+
				"A SEARCH ON ONE NAMED FILE IS LEFT ALONE, so %s on a path is fine and "+
				"this is only about the recursive form.",
			better.Name, better.Path, words[0], strings.TrimSpace(part), words[0]), true
	}
	return "", false
}

// THE OLDER SEARCHER, BY THE NAME IT IS RUN AS. This is not a second tool list:
// it is the thing being refused, and the probe's list decides what replaces it.
func olderSearcher(word string) bool {
	name := word
	if i := strings.LastIndexAny(name, "/\\"); i >= 0 {
		name = name[i+1:]
	}
	name = strings.TrimSuffix(name, ".exe")
	return name == "grep" || name == "egrep" || name == "fgrep"
}

// READS A TREE means -r, or a directory named where a file would go. Standard
// input names nothing, so a command with no path at all is left alone.
func readsATree(args []string) bool {
	saw := false
	for _, a := range args {
		if strings.HasPrefix(a, "-") && !strings.HasPrefix(a, "--") {
			if strings.ContainsAny(a, "rR") {
				return true
			}
			continue
		}
		if a == "--recursive" || a == "--dereference-recursive" {
			return true
		}
		if strings.HasPrefix(a, "--include") || strings.HasPrefix(a, "--exclude") {
			// A filter over many files is a tree search whatever else it says.
			saw = true
		}
	}
	return saw
}

// pipeline splits a shell command into the programs it runs, so a search behind
// a pipe is judged the same way as one at the front.
//
// A NEWLINE SEPARATES TWO PROGRAMS AS SURELY AS A SEMICOLON DOES. It was left
// out, and a command written over several lines was judged on its first line
// only, so every search after the first walked past the rule. A shell command
// in a tool call is routinely several lines.
//
// THE SEPARATORS ARE THE SHELL'S, so the list is the shell's rather than the
// three that happened to come to mind: a pipe, both ands, both ors, a
// semicolon, a newline, and the carriage return that comes with one here.
var separators = []string{"\r\n", "\n", "\r", "&&", "||", "|", ";", "&"}

func pipeline(command string) []string {
	parts := []string{command}
	for _, sep := range separators {
		var next []string
		for _, p := range parts {
			next = append(next, strings.Split(p, sep)...)
		}
		parts = next
	}
	return parts
}
