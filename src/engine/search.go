package main

import (
	"fmt"
	"os"
	"path/filepath"
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
	parts := []string{withoutHereDocs(command)}
	for _, sep := range separators {
		var next []string
		for _, p := range parts {
			next = append(next, strings.Split(p, sep)...)
		}
		parts = next
	}
	return parts
}

// withoutHereDocs answers the command with every here-doc body taken out.
//
// A HERE-DOC BODY IS DATA AND NOT COMMANDS. It sits between << and its
// terminator and is written to a file or piped to a program, so a script that
// CONTAINS a recursive search was refused although nothing was searched.
//
// THE COST OF THE FALSE POSITIVE IS THE REASON. Refusing a permitted case sends
// somebody looking for a workaround, and a rule people work around stops being
// read. Writing a script about the guard is exactly the case the guard should
// leave alone.
//
// THE TERMINATOR IS THE WHOLE LINE, trimmed. A body line reading EOFISH does
// not end a body opened with EOF.
func withoutHereDocs(command string) string {
	lines := strings.Split(command, nl)
	var out []string
	end := ""
	for _, line := range lines {
		if end != "" {
			if strings.TrimSpace(line) == end {
				end = ""
			}
			continue
		}
		out = append(out, line)
		if at := strings.Index(line, "<<"); at >= 0 {
			end = hereDocEnd(line[at+2:])
		}
	}
	return strings.Join(out, nl)
}

// hereDocEnd answers the terminator a here-doc opener names, or nothing.
//
// The word after << is the terminator, with a leading dash, quotes or a
// backslash taken off, and anything after it on the line ignored.
func hereDocEnd(after string) string {
	after = strings.TrimSpace(after)
	after = strings.TrimPrefix(after, "-")
	after = strings.TrimSpace(after)
	if after == "" || strings.HasPrefix(after, "<") {
		return "" // << with nothing, or a <<< here-string, which has no body
	}
	word := strings.Fields(after)[0]
	word = strings.Trim(word, "\"'\\")
	if word == "" {
		return ""
	}
	return word
}

// A SEARCH OVER THE TREE GOES THROUGH THE INDEX, AND THE DISK IS FOR OUTSIDE.
//
// THE OWNER'S WORDS: everything that's inside the system should be routed
// there. Obviously, if the agent wants to do something outside of our system,
// you can still use the other tools.
//
// So the line is the tree. A search whose every path is inside it, or that
// names no path and so searches where it stands, is refused and told the
// door. One that names a path outside is left alone.

// searchers are the programs this is about, by the name they are run as.
func searcher(word string) bool {
	name := word
	if i := strings.LastIndexAny(name, "/"+string(os.PathSeparator)); i >= 0 {
		name = name[i+1:]
	}
	name = strings.ToLower(strings.TrimSuffix(name, ".exe"))
	switch name {
	case "rg", "grep", "egrep", "fgrep", "findstr", "ag", "ack":
		return true
	}
	return false
}

// ASearchOverTheTree answers whether this command searches inside the tree
// at work with a program that reads the disk, and says where to search
// instead.
func ASearchOverTheTree(command, work string) (string, bool) {
	parts := pipeline(command)
	for i, part := range parts {
		words := shellWords(part)
		if len(words) == 0 || !searcher(words[0]) {
			continue
		}
		paths := pathsAmong(words[1:])
		// grep WITH NO PATH READS ITS INPUT, and behind a pipe that input is
		// another program's output rather than the tree. rg with no path
		// searches where it stands, which is the tree.
		if len(paths) == 0 && i > 0 {
			continue
		}
		if len(paths) == 0 && strings.HasPrefix(strings.ToLower(filepath.Base(words[0])), "grep") {
			continue
		}
		if len(paths) > 0 && !anyInside(paths, work) {
			continue
		}
		return theIndexDoor(strings.TrimSpace(part)), true
	}
	return "", false
}

// AToolSearchOverTheTree is the same question for the harness's own Grep
// and Glob, which take a path and search where they stand without one.
func AToolSearchOverTheTree(tool, path, work string) (string, bool) {
	if tool != "Grep" && tool != "Glob" {
		return "", false
	}
	if path != "" && !anyInside([]string{path}, work) {
		return "", false
	}
	what := tool
	if path != "" {
		what += " over " + path
	}
	return theIndexDoor(what), true
}

// theIndexDoor is the refusal, and it says exactly what to run instead.
func theIndexDoor(what string) string {
	return "THE TREE IS INDEXED, AND A SEARCH OVER IT GOES THROUGH THE INDEX. " +
		"Every line of every text file is in it, and the engine keeps it in step with the tree.\n\n" +
		"Use se_find, or se find at a prompt:\n" +
		"- words: terms in FTS5 syntax, best hit first. \"one phrase\", pre*, a AND b, a NOT b.\n" +
		"- regex: a Go regular expression matched against every line.\n" +
		"- path: a glob that narrows either, src/**/*.go, or on its own lists the files it names.\n" +
		"Every hit is a path, a line number and the line. se_ask takes SQL over the same tables.\n\n" +
		"What was asked: " + what + "\n\n" +
		theShellDoor("find --words ...") + "\n\n" +
		"OUTSIDE THIS TREE THE DISK IS YOURS: a search naming a path outside it is not refused."
}

// shellWords splits one program's words the way the shell that runs it would,
// so a quoted pattern stays one word.
//
// SPLITTING ON SPACES TURNS A PATTERN INTO PATHS. This is the redirection
// defect again by another road. rg -n "agent proxy" /root/.ccr/README.md handed
// the guard proxy" as a bare word, a bare word that is not a flag is a path, a
// relative path is inside the tree, and the search was refused by the message
// whose last line promises a path outside is not. So the words the guard weighs
// are the words the shell would run. See wk-7bab432426.
//
// A BACKSLASH ESCAPES INSIDE DOUBLE QUOTES AND OUTSIDE THEM, AND NOWHERE INSIDE
// SINGLE ONES, which is the one place here the two quotes differ.
func shellWords(part string) []string {
	var out []string
	var word strings.Builder
	open := false // a word has begun, and the empty string is a word
	quote := byte(0)
	for i := 0; i < len(part); i++ {
		c := part[i]
		switch {
		case quote != 0 && c == quote:
			quote = 0
		case quote == 0 && (c == '\'' || c == '"'):
			quote, open = c, true
		case quote != '\'' && c == '\\' && i+1 < len(part):
			i++
			word.WriteByte(part[i])
			open = true
		case quote == 0 && (c == ' ' || c == '\t'):
			if open {
				out = append(out, word.String())
				word.Reset()
				open = false
			}
		default:
			word.WriteByte(c)
			open = true
		}
	}
	if open {
		out = append(out, word.String())
	}
	return out
}

// pathsAmong answers the words that name a path: everything that is not a
// flag and not the pattern, which is the first bare word.
func pathsAmong(args []string) []string {
	var out []string
	pattern := false
	for i := 0; i < len(args); i++ {
		a := args[i]
		if a == "--" {
			out = append(out, args[i+1:]...)
			break
		}
		// A REDIRECTION IS NOT A PATH TO SEARCH. It names a file the shell writes
		// or reads, and the program never sees it. Reading one as a path was the
		// whole of a live defect: 2>/dev/null is relative, a relative path counts
		// as inside the tree, so one word of plumbing turned a search of /root
		// into a search of the tree. The refusal then promised, in its own last
		// line, that it would not have refused. See wk-7bab432426.
		if aRedirection(a) {
			if theArrowStandsAlone(a) {
				i++ // its target is the next word, and that is not a path either
			}
			continue
		}
		if strings.HasPrefix(a, "-") {
			// A FLAG THAT TAKES A VALUE TAKES THE NEXT WORD, and the ones that
			// matter here are the pattern and the type: -e p, -g glob, -t go.
			if a == "-e" || a == "-g" || a == "-t" || a == "-T" || a == "--regexp" || a == "--glob" || a == "--type" {
				i++
				if a == "-e" || a == "--regexp" {
					pattern = true
				}
			}
			continue
		}
		if !pattern {
			pattern = true
			continue
		}
		out = append(out, a)
	}
	return out
}

// aRedirection says whether this word is the shell redirecting, rather than a
// path handed to the program. A file descriptor may lead it and an ampersand
// may join it: 2>, &>, >>, < are all the shell's.
//
// A FILENAME MAY BEGIN WITH A DIGIT, so the digits come off only where an arrow
// follows them. 2026-report.txt keeps its name and stays a path.
func aRedirection(word string) bool {
	w := strings.TrimLeft(word, "0123456789&")
	return strings.HasPrefix(w, ">") || strings.HasPrefix(w, "<")
}

// theArrowStandsAlone answers whether a redirection names its file as the next
// word, as in `2> out.txt`, rather than joined to it as in `2>out.txt`.
func theArrowStandsAlone(word string) bool {
	w := strings.TrimLeft(word, "0123456789&")
	return strings.Trim(w, "><") == ""
}

// anyInside says whether any of these paths is inside the tree at work. A
// relative path is inside unless it climbs out; an absolute one is inside
// when it starts with the root.
func anyInside(paths []string, work string) bool {
	root := filepath.Clean(work)
	for _, p := range paths {
		p = strings.Trim(p, "'\"")
		if !filepath.IsAbs(p) {
			if strings.HasPrefix(filepath.ToSlash(filepath.Clean(p)), "../") {
				continue
			}
			return true
		}
		if rel, err := filepath.Rel(root, filepath.Clean(p)); err == nil && !strings.HasPrefix(rel, "..") {
			return true
		}
	}
	return false
}
