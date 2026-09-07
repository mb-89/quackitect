package main

import (
	"os"
	"path/filepath"
	"strings"
	"testing"

	"quackitect/engine/internal/keyword"
)

// A COMMAND IS THE KEYWORD LINE, AND NOTHING ELSE IS DECIDED HERE.
//
// The value of these rows is that they read the shapes rather than the words. A
// rung is sendable whole and a number is not, and those two are the whole of
// what the writer has to tell apart.

func numberAt(f float64) *float64 { return &f }

// aTreeOfEveryShape is the smallest tree carrying one of every shape that
// answers a word, and one node that answers none.
func aTreeOfEveryShape() Node {
	return Node{Name: "quackitect", Type: "group", Children: []Node{
		{Name: "control", Type: "group", Children: []Node{
			{Name: "god", Type: "toggle", Console: true, GestureCommand: "quackitect.god"},
			{Name: "ideation", Type: "bool", Console: true},
			{Name: "parallel_agents", Type: "int", Console: true,
				Min: numberAt(0), Max: numberAt(20)},
			{Name: "actor", Type: "text", Console: true, Placeholder: "a name"},
			{Name: "log", Type: "action", Console: true, Command: "quackitect.showLog"},
			{Name: "hidden", Type: "bool"},
		}},
	}}
}

func commandsByName(t *testing.T, root Node) map[string]aCommand {
	t.Helper()
	out := map[string]aCommand{}
	for _, c := range theCommands(root) {
		if _, seen := out[c.Name]; seen {
			t.Fatalf("two commands are named %q, so one file would eat the other", c.Name)
		}
		out[c.Name] = c
	}
	return out
}

// A RUNG IS TWO COMMANDS AND NEEDS NOTHING TYPED. Its line is sendable as it
// stands, so the body is that line and the command takes no argument.
func TestARungIsSendableWhole(t *testing.T) {
	by := commandsByName(t, aTreeOfEveryShape())
	for name, want := range map[string]string{
		"se-ctrl-control-god-on":       "KEYWORD:GOD=ON",
		"se-ctrl-control-god-off":      "KEYWORD:GOD=OFF",
		"se-ctrl-control-ideation-on":  "KEYWORD:IDEATION=ON",
		"se-ctrl-control-ideation-off": "KEYWORD:IDEATION=OFF",
	} {
		c, ok := by[name]
		if !ok {
			t.Fatalf("no command named %q, and the tree answers its line", name)
		}
		if c.Hint != "" {
			t.Errorf("%s asks for %q to be typed, and its line takes nothing", name, c.Hint)
		}
		if c.Body != want {
			t.Errorf("%s sends %q, and the line is %q", name, c.Body, want)
		}
	}
}

// A BRACKETED VALUE BECOMES AN ARGUMENT. Nobody can send the brackets, so the
// hint carries what they said and the body carries the substitution.
func TestABracketedValueBecomesAnArgument(t *testing.T) {
	by := commandsByName(t, aTreeOfEveryShape())
	for name, hint := range map[string]string{
		"se-ctrl-control-parallel-agents": "0-20",
		"se-ctrl-control-actor":           "a name",
	} {
		c, ok := by[name]
		if !ok {
			t.Fatalf("no command named %q, and the tree answers its line", name)
		}
		if c.Hint != hint {
			t.Errorf("%s hints %q, and the line said %q", name, c.Hint, hint)
		}
		if strings.Contains(c.Body, "<") {
			t.Errorf("%s sends %q, which carries brackets nobody can type", name, c.Body)
		}
		if !strings.HasSuffix(c.Body, "="+arguments) {
			t.Errorf("%s sends %q, and it should end in the substitution", name, c.Body)
		}
	}
}

// A CONTROL THAT ANSWERS NO WORD ANSWERS NO COMMAND. An action opens a window,
// a cloud box has none, and a node with no console flag is not reachable at all.
func TestAControlWithNoWordHasNoCommand(t *testing.T) {
	by := commandsByName(t, aTreeOfEveryShape())
	for _, name := range []string{
		"se-ctrl-control-log",
		"se-ctrl-control-hidden",
		"se-ctrl-control-hidden-on",
		"se-ctrl-control-hidden-off",
	} {
		if _, ok := by[name]; ok {
			t.Errorf("%s has a command, and the tree answers it no line", name)
		}
	}
}

// THE MARK IS IN THE FRONTMATTER AND THE MESSAGE IS THE WHOLE BODY. A mark in
// the body would stop keyword.Parse matching the one line the file exists to
// send, so this reads both halves of that split.
func TestTheFileSaysItIsGeneratedWithoutSpoilingTheMessage(t *testing.T) {
	for _, c := range theCommands(aTreeOfEveryShape()) {
		file := c.file()
		head, body, ok := strings.Cut(strings.TrimPrefix(file, "---\n"), "---\n")
		if !ok {
			t.Fatalf("%s carries no frontmatter: %q", c.Name, file)
		}
		if !strings.Contains(head, generatedMark) {
			t.Errorf("%s does not say it is generated: %q", c.Name, head)
		}
		if !strings.Contains(head, "util/parameters.json") {
			t.Errorf("%s does not name the source to edit instead: %q", c.Name, head)
		}
		if c.Hint != "" && !strings.Contains(head, "argument-hint:") {
			t.Errorf("%s asks for an argument and hints at none: %q", c.Name, head)
		}
		if strings.TrimSpace(body) != c.Body {
			t.Errorf("%s has %q in its body, and its message is %q",
				c.Name, strings.TrimSpace(body), c.Body)
		}
		said, ok := keyword.Parse(strings.TrimSpace(body))
		if !ok {
			t.Errorf("%s sends %q, which the matcher does not take", c.Name, strings.TrimSpace(body))
			continue
		}
		if said.Word == "" {
			t.Errorf("%s names no control", c.Name)
		}
	}
}

// EVERY COMMAND CARRIES THE PREFIX, so a person typing it narrows the menu to
// this engine's controls rather than reading somebody else's.
func TestEveryCommandCarriesThePrefix(t *testing.T) {
	for _, c := range theCommands(aTreeOfEveryShape()) {
		if !strings.HasPrefix(c.Name, commandPrefix) {
			t.Errorf("%s does not begin with %s, so it reads as nobody's", c.Name, commandPrefix)
		}
	}
}

// EVERY COMMAND THIS TREE WRITES REACHES A CONTROL. The words are derived twice
// by two functions, and this is where the two answers are held together.
func TestEveryCommandReachesAControl(t *testing.T) {
	roots := Roots{Method: filepath.Join("..", ".."), Work: t.TempDir()}
	if _, err := WriteCommands(roots); err != nil {
		t.Fatalf("the commands could not be written: %v", err)
	}
	root, err := LoadTree(roots.Method)
	if err != nil {
		t.Fatalf("the tree could not be read: %v", err)
	}
	reach := theReachable(root)
	dir := filepath.Join(roots.Work, filepath.FromSlash(commandsFolder))
	entries, err := os.ReadDir(dir)
	if err != nil {
		t.Fatalf("no commands folder was written: %v", err)
	}
	if len(entries) == 0 {
		t.Fatal("the folder is empty, so this test is judging nothing")
	}
	for _, e := range entries {
		b, err := os.ReadFile(filepath.Join(dir, e.Name()))
		if err != nil {
			t.Fatalf("%s cannot be read: %v", e.Name(), err)
		}
		_, body, _ := strings.Cut(strings.TrimPrefix(string(b), "---\n"), "---\n")
		said, ok := keyword.Parse(strings.TrimSpace(body))
		if !ok {
			t.Errorf("%s sends %q, which the matcher does not take", e.Name(), strings.TrimSpace(body))
			continue
		}
		if _, ok := reach[said.Word]; !ok {
			t.Errorf("%s sends %s, which reaches no control", e.Name(), said.Word)
		}
	}
	if n := len(theCommands(root)); n != len(entries) {
		t.Errorf("the tree answers %d lines and %d files were written", n, len(entries))
	}
}

// A WORD THAT NO LONGER EXISTS LEAVES NO COMMAND BEHIND. A renamed control
// would otherwise keep its old command in the menu, and pressing it would send
// a message that reaches nothing.
func TestAStaleCommandIsTakenAway(t *testing.T) {
	roots := Roots{Method: filepath.Join("..", ".."), Work: t.TempDir()}
	if _, err := WriteCommands(roots); err != nil {
		t.Fatalf("the commands could not be written: %v", err)
	}
	dir := filepath.Join(roots.Work, filepath.FromSlash(commandsFolder))
	stale := filepath.Join(dir, "a-control-that-went-away.md")
	if err := os.WriteFile(stale, []byte("KEYWORD:GONE=ON\n"), 0o644); err != nil {
		t.Fatalf("the stale file could not be written: %v", err)
	}
	if _, err := WriteCommands(roots); err != nil {
		t.Fatalf("the commands could not be written again: %v", err)
	}
	if _, err := os.Stat(stale); !os.IsNotExist(err) {
		t.Errorf("%s is still there, so a renamed control keeps its old command", stale)
	}
}
