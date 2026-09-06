package main

import (
	"os"
	"regexp"
	"strings"
	"testing"
)

// A COMMAND A REFUSAL HANDS YOU HAS TO NAME FLAGS THAT EXIST.
//
// The notes guard is a handing-over: it holds the work and tells the agent how
// to get out. Its one copyable line was
//
//	se work --close <id> --as dropped --why "..."
//
// and neither flag is declared, so the agent held by it spent a turn on
// "flag provided but not defined: -close" and then had to read work.go to find
// the real command.
//
// NOTHING READ THE REFUSAL'S COMMANDS. This does. It pulls every se work line
// out of the text the guard writes and asks runWork's own declaration whether
// each flag on it exists. Both halves are the product's: the command comes from
// the refusal as an agent reads it, and the set comes from the source that
// declares it, so neither can be satisfied by a copy of the other.
//
// THE SET IS READ OFF THE SOURCE, because runWork builds it inside itself and
// hands it to nobody. A test that drove the verb would answer the same question
// while riding on the shape of a call, which is not what is under test here.

// declaredFlag matches a flag as work.go declares one, whichever kind it is.
// fs.Var puts the value first, so the name is the argument before the usage in
// both shapes.
var declaredFlag = regexp.MustCompile(`fs\.(?:String|Bool|Int|Int64|Float64|Duration|Var)\((?:&[\w.]+, )?"([\w-]+)"`)

// theFlagsSeWorkDeclares is every flag name runWork declares.
func theFlagsSeWorkDeclares(t *testing.T) map[string]bool {
	t.Helper()
	b, err := os.ReadFile("work.go")
	if err != nil {
		t.Fatal(err)
	}
	out := map[string]bool{}
	for _, m := range declaredFlag.FindAllStringSubmatch(string(b), -1) {
		out[m[1]] = true
	}
	// A CHECK THAT FINDS NOTHING TO JUDGE IS NOT A GREEN CHECK. Reworded past
	// the pattern, this would read an empty set, and then every flag in every
	// refusal would be undeclared or none would.
	if len(out) < 10 {
		t.Fatalf("only %d flag(s) were read out of work.go, and se work declares more than that", len(out))
	}
	return out
}

// theFlagsOn is every long flag a command names, in the order it names them.
func theFlagsOn(command string) []string {
	var out []string
	for _, word := range strings.Fields(command) {
		if !strings.HasPrefix(word, "--") {
			continue
		}
		name := strings.TrimPrefix(word, "--")
		if i := strings.IndexByte(name, '='); i >= 0 {
			name = name[:i]
		}
		out = append(out, name)
	}
	return out
}

// theSeWorkCommands is every se work command the text prints, one per line.
func theSeWorkCommands(text string) []string {
	const verb = "se work"
	var out []string
	for _, line := range strings.Split(text, "\n") {
		if i := strings.Index(line, verb); i >= 0 {
			out = append(out, strings.TrimSpace(line[i:]))
		}
	}
	return out
}

func TestEverySeWorkCommandARefusalPrintsIsParsed(t *testing.T) {
	r := aTreeWithTheProcesses(t)
	aHostTable(t, r)
	for i := 0; i < TheNoteCeiling; i++ {
		mintNote(t, r, "a note nobody decided")
	}
	t.Setenv("CLAUDE_CODE_REMOTE", "true")

	held, refuse := TooManyNotes(r, "main", "mcp__quackitect__se_pull", "")
	if !refuse {
		t.Fatalf("%d notes on a cloud box were not held, so there is no refusal to read", TheNoteCeiling)
	}
	stopped, _ := NotesGoWithTheBox(r)

	// BOTH REFUSALS THIS FILE WRITES, because a rule taught to one half of a
	// mirrored pair is the same defect again.
	commands := append(theSeWorkCommands(held), theSeWorkCommands(stopped)...)
	if len(commands) == 0 {
		t.Fatal("neither refusal prints a se work command, so this test would pass on silence")
	}
	declared := theFlagsSeWorkDeclares(t)
	for _, command := range commands {
		for _, named := range theFlagsOn(command) {
			if !declared[named] {
				t.Errorf("the refusal hands the agent %q, and se work declares no --%s, "+
					"so what the agent gets is: flag provided but not defined: -%s",
					command, named, named)
			}
		}
	}
}
