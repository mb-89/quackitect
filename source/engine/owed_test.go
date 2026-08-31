package main

import (
	"path/filepath"
	"strings"
	"testing"
)

// SOMEBODY WAITING TO BE ANSWERED WHILE THE AGENT WORKS ON is the failure this
// exists to stop. The order was a rule the agent kept, and it forgot it twice.
func TestNothingHappensWhileAnAnswerIsOwed(t *testing.T) {
	exe := buildEngine(t)
	r := guidanceTree(t)
	Project(r)
	l, _ := OpenLog(r.Private("log"))
	l.Write("engine", "start", "engine", "engine started", Yes(), nil)
	l.Close()

	read := map[string]any{
		"cwd": r.Work, "tool_name": "Read", "tool_use_id": "t1",
		"tool_input": map[string]any{"file_path": filepath.Join(r.Work, "notes.md")},
	}
	// With nothing owed, an ordinary call goes through.
	if out := hookSays(t, exe, r.Method, "PreToolUse", read); strings.Contains(out, `"deny"`) {
		t.Fatalf("a read was refused with nothing owed: %s", out)
	}

	// They said something.
	hookSays(t, exe, r.Method, "UserPromptSubmit",
		map[string]any{"cwd": r.Work, "prompt": "the editor is still not right"})

	out := hookSays(t, exe, r.Method, "PreToolUse", read)
	if !strings.Contains(out, `"permissionDecision":"deny"`) {
		t.Fatalf("work went on while they waited: %s", out)
	}
	// The refusal carries what they said, so the agent answers the right thing.
	if !strings.Contains(out, "the editor is still not right") {
		t.Fatalf("the refusal does not say what they said: %s", out)
	}

	// THE ONE CALL THAT IS ALLOWED IS THE ONE THAT ANSWERS. A refusal nobody
	// can satisfy is a trap.
	answering := map[string]any{
		"cwd": r.Work, "tool_name": "Bash", "tool_use_id": "t2",
		"tool_input": map[string]any{"command": `se --answer "I am on it"`},
	}
	if out := hookSays(t, exe, r.Method, "PreToolUse", answering); strings.Contains(out, `"deny"`) {
		t.Fatalf("answering was refused: %s", out)
	}

	// Answered, and the work goes on.
	if err := TheyWereAnswered(r, "main"); err != nil {
		t.Fatal(err)
	}
	if out := hookSays(t, exe, r.Method, "PreToolUse", read); strings.Contains(out, `"deny"`) {
		t.Fatalf("a read was refused after they were answered: %s", out)
	}
}

// The newest prompt is the one that is owed. Answering one and being asked
// another leaves the second owed.
// A PROMPT FLIPS IT AND AN ANSWER CLEARS IT. Nothing reads the log back.
func TestAPromptFlipsTheFlagAndAnAnswerClearsIt(t *testing.T) {
	r := guidanceTree(t)

	if _, owed := AnswerOwed(r, "main"); owed {
		t.Fatal("something was owed before anybody said anything")
	}
	if err := TheyAsked(r, "main", "the first thing"); err != nil {
		t.Fatal(err)
	}
	if said, owed := AnswerOwed(r, "main"); !owed || said != "the first thing" {
		t.Fatalf("it owes %q, %v", said, owed)
	}
	if err := TheyWereAnswered(r, "main"); err != nil {
		t.Fatal(err)
	}
	if _, owed := AnswerOwed(r, "main"); owed {
		t.Fatal("it still owes an answer after answering")
	}
	// TWO QUESTIONS BEFORE EITHER IS ANSWERED ARE TWO QUESTIONS. A slot that
	// held one erased the first, and the refusal then showed the newest while
	// the older one was handed to nobody.
	TheyAsked(r, "main", "the first thing")
	TheyAsked(r, "main", "the second thing")
	said, owed := AnswerOwed(r, "main")
	if !owed {
		t.Fatal("nothing is owed after two questions")
	}
	for _, want := range []string{"the first thing", "the second thing"} {
		if !strings.Contains(said, want) {
			t.Fatalf("%q was lost: it owes %q", want, said)
		}
	}
	// One answer settles the lot. A person waiting on two questions is waiting
	// for one reply that covers both.
	if err := TheyWereAnswered(r, "main"); err != nil {
		t.Fatal(err)
	}
	if _, owed := AnswerOwed(r, "main"); owed {
		t.Fatal("one answer did not settle both questions")
	}
}

// AN OBLIGATION BELONGS TO ONE AGENT. Several run here at once, and one flag
// for the project blocked every one of them on a message given to one, then let
// any of them clear it. That drew three answers to one question.
func TestAnObligationBelongsToOneAgent(t *testing.T) {
	r := guidanceTree(t)

	if err := TheyAsked(r, "main", "the editor is still not right"); err != nil {
		t.Fatal(err)
	}
	if _, owed := AnswerOwed(r, "reviewer"); owed {
		t.Fatal("a message to main is owed by the reviewer")
	}
	if said, owed := AnswerOwed(r, "main"); !owed || said != "the editor is still not right" {
		t.Fatalf("main owes %q, %v", said, owed)
	}

	// ANOTHER AGENT ANSWERING DOES NOT RELEASE THIS ONE.
	if err := TheyWereAnswered(r, "reviewer"); err != nil {
		t.Fatal(err)
	}
	if _, owed := AnswerOwed(r, "main"); !owed {
		t.Fatal("the reviewer answering cleared main's obligation")
	}
	if err := TheyWereAnswered(r, "main"); err != nil {
		t.Fatal(err)
	}
	if _, owed := AnswerOwed(r, "main"); owed {
		t.Fatal("main still owes after answering")
	}

	// Two agents can owe at once, and each is told what it was told.
	TheyAsked(r, "main", "one thing")
	TheyAsked(r, "reviewer", "another thing")
	if said, _ := AnswerOwed(r, "main"); said != "one thing" {
		t.Fatalf("main owes %q", said)
	}
	if said, _ := AnswerOwed(r, "reviewer"); said != "another thing" {
		t.Fatalf("the reviewer owes %q", said)
	}
}

// THE ESCAPE MATCHES THE COMMAND, NOT THE TEXT. A substring match opened the
// guard for anything that mentioned the words.
func TestOnlyTheEngineAnsweringEscapesTheRefusal(t *testing.T) {
	answering := []string{
		`se --answer "I am on it"`,
		`.bin/se.exe --answer "I am on it"`,
		`"C:/x/.bin/se.exe" --answer "I am on it"`,
		`se --answer="I am on it"`,
	}
	for _, cmd := range answering {
		if !runsTheEngineWith(cmd, "--answer") {
			t.Errorf("an answering call was refused: %s", cmd)
		}
	}
	notAnswering := []string{
		`grep -rn "--answer" source/`,
		`cat > sub.json <<EOF
{"evidence":{"what":"se_answer is in the live tools list"}}
EOF`,
		`git commit -m "the --answer flag"`,
		`se --said "they asked about --answer"`,
		`echo --answer`,
		`ls --answer.md`,
	}
	for _, cmd := range notAnswering {
		if runsTheEngineWith(cmd, "--answer") {
			t.Errorf("the guard opened for a call that answers nobody: %s", cmd)
		}
	}
}

// THE GUARD CLEARS THE OBLIGATION, BECAUSE ONLY THE GUARD KNOWS WHO ANSWERED.
//
// The answer verb runs as a program with no idea which agent called it, so it
// cleared the default actor and left the caller still owing. A reviewer
// answered seven times, watched the engine say recorded seven times, and stayed
// refused until it gave up holding a token in review.
func TestAnsweringClearsTheObligationOfWhoeverAnswered(t *testing.T) {
	exe := buildEngine(t)
	r := guidanceTree(t)
	l, _ := OpenLog(r.Private("log"))
	l.Write("engine", "start", "engine", "started", Yes(), nil)
	l.Close()

	// A subagent is given a name, and that name is what the obligation is under.
	NoteAgent(r, "agent-1", "general-purpose")
	them := NameOf(r, "agent-1")
	if them == "main" {
		t.Fatalf("the subagent was not named: %q", them)
	}
	if err := TheyAsked(r, them, "the editor is still not right"); err != nil {
		t.Fatal(err)
	}

	read := map[string]any{
		"cwd": r.Work, "tool_name": "Read", "tool_use_id": "t1", "agent_id": "agent-1",
		"tool_input": map[string]any{"file_path": filepath.Join(r.Work, "notes.md")},
	}
	if out := hookSays(t, exe, r.Method, "PreToolUse", read); !strings.Contains(out, `"deny"`) {
		t.Fatalf("the subagent was not refused: %s", out)
	}

	// It answers with the tool, which runs as a program that does not know it.
	answering := map[string]any{
		"cwd": r.Work, "tool_name": "mcp__quackitect__se_answer",
		"tool_use_id": "t2", "agent_id": "agent-1",
		"tool_input": map[string]any{"answer": "I am on it"},
	}
	hookSays(t, exe, r.Method, "PreToolUse", answering)
	hookSays(t, exe, r.Method, "PostToolUse", answering)

	if said, owed := AnswerOwed(r, them); owed {
		t.Fatalf("%s still owes %q after answering", them, said)
	}
	if out := hookSays(t, exe, r.Method, "PreToolUse", read); strings.Contains(out, `"deny"`) {
		t.Fatalf("the subagent is still refused after answering: %s", out)
	}
}
