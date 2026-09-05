package main

import (
	"strings"
	"testing"
)

// A COMMAND A REFUSAL HANDS YOU HAS TO PARSE.
//
// The notes guard is a handing-over: it holds the work and tells the agent how
// to get out. Its one copyable line named two flags that were never declared,
// se work --close and --as, so the agent held by it spent a turn on a parse
// error and then had to read work.go to find the real command.
//
// Nothing read the refusal's commands. This does: it pulls every se work line
// out of the text and hands it to the verb, which parses it against the flag
// set runWork declares. A flag nobody declared answers with the flag package's
// own words, and that is what fails here.
const noSuchFlag = "flag provided but not defined"

// theArgsIn splits one command into arguments, keeping a double-quoted run
// whole, and fills the placeholders a refusal writes so the line can be parsed.
// An angle-bracket word is a token id, and "..." is whatever a person types.
func theArgsIn(command string) []string {
	var args []string
	var cur strings.Builder
	quoted, opened := false, false
	for _, ch := range command {
		switch {
		case ch == '"':
			quoted, opened = !quoted, true
		case (ch == ' ' || ch == '\t') && !quoted:
			if opened || cur.Len() > 0 {
				args = append(args, cur.String())
				cur.Reset()
				opened = false
			}
		default:
			cur.WriteRune(ch)
		}
	}
	if opened || cur.Len() > 0 {
		args = append(args, cur.String())
	}
	for i, a := range args {
		switch {
		case strings.HasPrefix(a, "<") && strings.HasSuffix(a, ">"):
			args[i] = "wk-0000000000"
		case a == "...":
			args[i] = "what it says"
		}
	}
	return args
}

// theSeWorkCommands is every se work line the text prints, as arguments the
// verb can be handed.
func theSeWorkCommands(text string) [][]string {
	const verb = "se work"
	var out [][]string
	for _, line := range strings.Split(text, "\n") {
		if i := strings.Index(line, verb); i >= 0 {
			out = append(out, theArgsIn(line[i+len(verb):]))
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

	held, refuse := TooManyNotes(r, "main", "mcp__quackitect__se_apply", "")
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
	for _, args := range commands {
		said := runVerbInside(t.Context(), r, verbAsk{Verb: "work", Args: args})
		// THE FIRST LINE ALONE. A parse error is followed by the whole usage,
		// and a failure that prints it buries the flag it is about.
		i := strings.Index(said.Err, noSuchFlag)
		if i < 0 {
			continue
		}
		answer := said.Err[i:]
		if j := strings.IndexByte(answer, '\n'); j >= 0 {
			answer = answer[:j]
		}
		t.Errorf("the refusal hands the agent se work %s, and the verb answers: %s",
			strings.Join(args, " "), answer)
	}
}
