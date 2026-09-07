package main

import (
	"os"
	"path/filepath"
	"sort"
	"strings"

	"quackitect/engine/internal/keyword"
)

// A SLASH COMMAND IS THE KEYWORD WITH A HANDLE ON IT.
//
// The panel is the desk's surface for a control, and a cloud box has none. A
// keyword reaches every control from a chat, but nobody in the cloud is ever
// shown the word, so the word is only reachable by whoever already knows it.
// The harness lists .claude/commands in its own menu and completes what a
// person types, so a file there is the word made visible.
//
// NOTHING HERE DECIDES WHAT A WORD IS. keywordsFor already answers the exact
// line the matcher takes, and the panel draws that answer rather than composing
// its own. This is a third reader of the same answer. So the word cannot differ
// by a character between the two surfaces.
//
// THE BODY IS THE MESSAGE AND NOTHING ELSE. keyword.Parse takes a message only
// when the whole trimmed message is one. A mark in the body would stop the line
// matching, on the one file whose only job is to send it. The mark goes in the
// frontmatter description, which is what the harness draws beside the command.
//
// A BRACKETED VALUE IS NOT SENDABLE AS IT STANDS, which is why boundsSay writes
// brackets. Nobody can send KEYWORD:PARALLEL_AGENTS=<0-20>. Such a line takes an
// argument, and the brackets become the hint the harness shows. A line that is
// sendable whole takes nothing, so a rung is two commands and needs no typing.

// commandsFolder is where the harness looks for a command, under the work root.
const commandsFolder = ".claude/commands"

// commandPrefix keeps these commands together in the menu and apart from
// everybody else's.
//
// THE MENU IS SHARED AND THIS FOLDER IS NOT THE ONLY WRITER. A command named
// after the control alone would sit among the harness's own and among whatever
// else a person has, and READY_BUDGET_MS reads as nothing in particular. The
// prefix says who owns it, and the group says which panel section it is in, so
// typing the prefix narrows the menu to this engine's controls.
const commandPrefix = "se-ctrl-"

// arguments is what the harness puts what a person typed in place of.
const arguments = "$ARGUMENTS"

// TheWordsBehind is what a message means to the keyword matcher: the body of a
// slash command where it is one, and what was written otherwise.
//
// BOTH ROUTES A PERSON'S WORDS TAKE ASK THIS. A prompt that starts a turn
// reaches the hook, and a message written into a running turn is copied out of
// the transcript. A command that moved a control on one route and nothing on
// the other is the shape this is placed to stop.
func TheWordsBehind(roots Roots, said string) string {
	if body := TheCommandTyped(roots, said); body != "" {
		return body
	}
	return said
}

// TheCommandTyped answers the message a slash command sends, for a prompt that
// is one of this engine's commands and nothing else.
//
// THE HARNESS SUBMITS THE NAME AND NOT THE BODY. A command file holds
// KEYWORD:GOD=OFF, and what reaches the engine is the literal
// "/se-ctrl-control-god-off". The matcher takes a message only when the whole
// message is a keyword, so it saw a slash, found no word, and moved nothing.
// Every control stayed reachable from the panel alone, and the panel is what a
// cloud box does not have, which is the whole reason these files are written.
//
// MEASURED. A tree was put in god mode from the button.
// /se-ctrl-control-god-off was typed, then /se-ctrl-control-god-on. The session
// log holds both prompts as their slash text with no binding record between
// them, and .se/binding.json still read god. The person was told the command
// and the panel disagreed. They did not. The command did nothing at all, and
// the panel was right throughout.
//
// IT READS BACK THE FILE THE HARNESS RAN, rather than composing the word again.
// That file is written from the one answer keywordsFor gives, so this is a
// fourth reader of that answer and cannot drift from the other three.
//
// ANYTHING ELSE ANSWERS EMPTY and the caller keeps what the person wrote. The
// prefix is what holds this off every other command in a shared menu, and the
// name is one file in one folder rather than a path, so nothing outside that
// folder is ever read.
func TheCommandTyped(roots Roots, prompt string) string {
	line := strings.TrimSpace(prompt)
	if !strings.HasPrefix(line, "/"+commandPrefix) {
		return ""
	}
	name, rest, _ := strings.Cut(strings.TrimPrefix(line, "/"), " ")
	if name == "" || strings.ContainsAny(name, `/\.`) {
		return ""
	}
	raw, err := os.ReadFile(filepath.Join(roots.Work, filepath.FromSlash(commandsFolder), name+".md"))
	if err != nil {
		return ""
	}
	body := theBodyUnder(string(raw))
	if body == "" {
		return ""
	}
	// WHAT WAS TYPED AFTER THE NAME GOES WHERE THE HARNESS WOULD PUT IT. A
	// command whose line is sendable whole carries no placeholder, and such a
	// command is unchanged by this.
	return strings.TrimSpace(strings.ReplaceAll(body, arguments, strings.TrimSpace(rest)))
}

// theBodyUnder is the message a command file sends, which is everything under
// the frontmatter. A file that opens no frontmatter is all body, and one that
// opens frontmatter and never closes it is not a command file.
func theBodyUnder(file string) string {
	s := strings.ReplaceAll(file, "\r\n", "\n")
	if !strings.HasPrefix(s, "---\n") {
		return strings.TrimSpace(s)
	}
	if _, after, ok := strings.Cut(s[len("---\n"):], "\n---\n"); ok {
		return strings.TrimSpace(after)
	}
	return ""
}

// aCommand is one file: the message it sends, and what it asks to be typed.
type aCommand struct {
	Name string // the file, without its suffix
	Body string // the message, as the harness submits it
	Hint string // what goes after the command, empty when it takes nothing
}

// theCommands answers one command per line the tree offers a console.
//
// IT WALKS THE SAME NODES theReachable walks, and asks the same function the
// tooltip asks. A control that carries no word carries no command.
func theCommands(root Node) []aCommand {
	var out []aCommand
	Walk(root, "", func(path string, n Node) {
		if !n.Console {
			return
		}
		for _, line := range keywordsFor(n) {
			out = append(out, commandFor(theSectionOf(path), line))
		}
	})
	sort.Slice(out, func(i, j int) bool { return out[i].Name < out[j].Name })
	return out
}

// commandFor turns one line into one file. The line is the whole input, so a
// word this does not recognise cannot be invented here.
func commandFor(group, line string) aCommand {
	word, value, _ := strings.Cut(strings.TrimPrefix(line, keyword.Prefix), "=")
	if hint, ok := bracketed(value); ok {
		return aCommand{
			Name: fileNameOf(group, word),
			Body: keyword.Line(word, arguments),
			Hint: hint,
		}
	}
	name := word
	if value != "" {
		name = word + "-" + value
	}
	return aCommand{Name: fileNameOf(group, name), Body: line}
}

// theSectionOf is the section a control is drawn in, which is the node above
// it. It is read off the path the walk already carries, so no node names its
// own group and a control moved between sections carries its command with it.
func theSectionOf(path string) string {
	parts := strings.Split(path, ".")
	if len(parts) < 3 {
		return ""
	}
	return parts[len(parts)-2]
}

// bracketed answers what a placeholder asks for, and whether it is one.
func bracketed(value string) (string, bool) {
	if len(value) < 2 || !strings.HasPrefix(value, "<") || !strings.HasSuffix(value, ">") {
		return "", false
	}
	return value[1 : len(value)-1], true
}

// fileNameOf is what a person types after the slash. Every part of it is
// derived, so a rename anywhere carries the command with it.
func fileNameOf(group, name string) string {
	out := commandPrefix
	if group != "" {
		out += aFileWord(group) + "-"
	}
	return out + aFileWord(name)
}

// aFileWord is one part of a command's name, in the spelling a menu wants.
func aFileWord(s string) string {
	return strings.ToLower(strings.ReplaceAll(s, "_", "-"))
}

// file is what the command is written as.
//
// THE DESCRIPTION IS QUOTED because the mark carries a colon, and an unquoted
// scalar carrying one is not the string it looks like.
func (c aCommand) file() string {
	var b strings.Builder
	b.WriteString("---\n")
	b.WriteString("description: \"" + generatedMark +
		" It is written again every time the tree is projected, so an edit here is lost." +
		" Source: util/parameters.json\"\n")
	if c.Hint != "" {
		b.WriteString("argument-hint: \"" + c.Hint + "\"\n")
	}
	b.WriteString("---\n\n")
	b.WriteString(c.Body + "\n")
	return b.String()
}

// WriteCommands writes one file per word and takes away every file no word
// answers. It is idempotent, and it returns only what it changed.
//
// A WORD THAT NO LONGER EXISTS LEAVES NO COMMAND BEHIND. A renamed control
// would otherwise keep its old command in the menu, and pressing it would send
// a message that reaches nothing.
func WriteCommands(roots Roots) ([]string, error) {
	// No declaration is not a failure. It means there is nothing to offer.
	if _, err := os.Stat(filepath.Join(roots.Method, "util", "parameters.json")); os.IsNotExist(err) {
		return nil, nil
	}
	root, err := LoadTree(roots.Method)
	if err != nil {
		return nil, err
	}
	dir := filepath.Join(roots.Work, filepath.FromSlash(commandsFolder))
	if err := os.MkdirAll(dir, 0o755); err != nil {
		return nil, err
	}
	wanted := map[string]bool{}
	var written []string
	for _, c := range theCommands(root) {
		name := c.Name + ".md"
		wanted[name] = true
		changed, err := writeIfDifferent(filepath.Join(dir, name), c.file())
		if err != nil {
			return written, err
		}
		if changed {
			written = append(written, filepath.Join(dir, name))
		}
	}
	entries, err := os.ReadDir(dir)
	if err != nil {
		return written, err
	}
	for _, e := range entries {
		if e.IsDir() || !strings.HasSuffix(e.Name(), ".md") || wanted[e.Name()] {
			continue
		}
		if err := os.Remove(filepath.Join(dir, e.Name())); err != nil {
			return written, err
		}
		written = append(written, filepath.Join(dir, e.Name()))
	}
	return written, nil
}
