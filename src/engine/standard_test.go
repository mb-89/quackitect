package main

import (
	"bytes"
	"encoding/json"
	"os"
	"path/filepath"
	"quackitect/engine/internal/sessionlog"
	"strings"
	"testing"
	"time"
)

// THE STANDARD PROCESS: the change lands, a second agent gives one verdict,
// and nothing blocks. These tests drive the process file the product ships,
// copied into a tree of their own, so a change to the file is a change to
// what these hold.

// mintStandard hands back a tracked token this box may work, claim and all.
//
// A TRACKED TOKEN NEEDS A CLAIM BEFORE IT IS WORKED, so a fixture that did not
// take one handed every test a token the gate refuses. A test about claiming
// wants mintUnclaimed, which is this without the claim.
func mintStandard(t *testing.T, r Roots, title string) Token {
	t.Helper()
	tok := mintUnclaimed(t, r, title)
	if _, err := Claim(r, Claimant(r, "main"), []string{tok.ID}, time.Now().UTC()); err != nil {
		t.Fatalf("claiming the fixture token: %v", err)
	}
	back, err := LoadToken(r, tok.ID)
	if err != nil {
		t.Fatal(err)
	}
	return back
}

func mintUnclaimed(t *testing.T, r Roots, title string) Token {
	t.Helper()
	tok, err := Mint(r, Token{Tracked: tracked(), Process: "standard", Title: title, Status: "open",
		Detail:   "a change that wants an approach first and a verdict after",
		Criteria: []Criterion{{Says: "the check is green: go test -run TestX"}},
		Kept:     []KeptSection{{Head: "approach", Text: "One function, one test, nothing else moves."}}})
	if err != nil {
		t.Fatalf("minting a standard token: %v", err)
	}
	return tok
}

// ticked writes the checklist of the step the token stands at, every line
// ticked with a sentence, so a submission is about the process and not the
// checklist. It answers the token as saved.
func ticked(t *testing.T, r Roots, id string) Token {
	t.Helper()
	tok, err := LoadToken(r, id)
	if err != nil {
		t.Fatal(err)
	}
	p, err := LoadProcess(r.Method, tok.Process)
	if err != nil {
		t.Fatal(err)
	}
	a, found := p.ActivityFrom(string(tok.Status))
	if !found {
		t.Fatalf("no activity from %q", tok.Status)
	}
	if tok.Submission == nil {
		tok.Submission = map[string]string{}
	}
	// EVERY STEP UP TO THIS ONE IS TICKED, because the gate reads them all:
	// the asker ticked the first when it minted, and each holder its own.
	for i, step := range p.Activities {
		if i+1 > p.StepOf(a.Name) {
			break
		}
		rows := "| done | criterion | evidence | receipt |\n|---|---|---|---|\n"
		for _, c := range step.Criteria {
			// THE EVIDENCE IS A WORD, NOT THE CRITERION AGAIN. A section is
			// measured in words, and repeating each criterion doubled the
			// table: a process that gained a criterion pushed every fixture
			// past the cap, and five tests failed about a limit none of them
			// is about. The gate reads whether the cell says anything.
			rows += "| [x] | " + c.Says + " | seen |  |\n"
		}
		tok.Submission["step "+itoa(i+1)+". "+step.Name] = rows
	}
	if err := SaveToken(r, tok); err != nil {
		t.Fatal(err)
	}
	return tok
}

func TestTheStandardProcess(t *testing.T) {
	t.Parallel()
	r := aTreeWithTheProcesses(t)
	tok := mintStandard(t, r, "a standard change")

	// A WORKER IS HANDED IT, and the reviewer's queue does not see it yet.
	if got := Pull(r, "reviewer-1", RoleReviewer, Payload{}); got.Pull == AnswerWork {
		t.Fatalf("an open token was handed to a reviewer: %+v", got.Token)
	}
	got := Pull(r, "worker-1", RoleWorker, Payload{})
	if got.Pull != AnswerWork || got.Token.ID != tok.ID {
		t.Fatalf("the worker was not handed the token: %s %+v", got.Pull, got.Notice)
	}

	// THE WORK STEP IS SUBMITTED, and the token stands at done, owing a
	// verdict, with the worker written down as its author.
	ticked(t, r, tok.ID)
	got = Pull(r, "worker-1", RoleWorker, Payload{ID: tok.ID})
	if got.Pull == AnswerRefused {
		t.Fatalf("the work step was refused: %+v", got.Findings)
	}
	done, _ := LoadToken(r, tok.ID)
	if done.Status != "done" || done.Author != "worker-1" || done.Ended() {
		t.Fatalf("after the work step the token reads %q by %q, ended %v", done.Status, done.Author, done.Ended())
	}

	// THE WORKER'S QUEUE IS EMPTY NOW: a verdict is not a worker's step.
	if got := Pull(r, "worker-2", RoleWorker, Payload{}); got.Pull == AnswerWork {
		t.Fatalf("a token owing a verdict was handed to a worker: %+v", got.Token)
	}
	// AND THE AUTHOR IS NEVER THE REVIEWER, on the queue or by submission.
	if got := Pull(r, "worker-1", RoleReviewer, Payload{}); got.Pull == AnswerWork {
		t.Fatalf("the author was handed its own verdict: %+v", got.Token)
	}
	// A REVIEWER IS HANDED IT, and closes it with one verdict.
	got = Pull(r, "reviewer-1", RoleReviewer, Payload{})
	if got.Pull != AnswerWork || got.Token.ID != tok.ID {
		t.Fatalf("the reviewer was not handed the token: %s %s", got.Pull, got.Notice)
	}
	ticked(t, r, tok.ID)
	got = Pull(r, "reviewer-1", RoleReviewer, Payload{ID: tok.ID, Disposition: "done"})
	if got.Pull == AnswerRefused {
		t.Fatalf("the verdict was refused: %+v", got.Findings)
	}
	closed, _ := LoadToken(r, tok.ID)
	if !closed.Ended() || closed.Disposition != Done {
		t.Fatalf("after the verdict the token reads %q %q", closed.Status, closed.Disposition)
	}
}

// THE AUTHOR IS REFUSED THE VERDICT EVEN WHEN IT HOLDS THE TOKEN, which a
// hand-edited holder could arrange.
func TestTheVerdictIsNeverTheAuthors(t *testing.T) {
	t.Parallel()
	r := aTreeWithTheProcesses(t)
	tok := mintStandard(t, r, "held by its author")
	tok.Status, tok.Author, tok.Holder = "done", "worker-1", "worker-1"
	if err := SaveToken(r, tok); err != nil {
		t.Fatal(err)
	}
	ticked(t, r, tok.ID)
	got := Pull(r, "worker-1", RoleReviewer, Payload{ID: tok.ID, Disposition: "done"})
	if got.Pull != AnswerRefused || got.Findings[0].Clause != "author" {
		t.Fatalf("the author's verdict was answered %s %+v", got.Pull, got.Findings)
	}
}

// A DISPOSITION ON THE WORK STEP IS NOT AN ENDING. The standard process's work
// step goes open to done and owes a verdict, so a worker submitting it with the
// "done" every other process wants there has to leave the token open to its
// reviewer. Ended() is Disposition != "", so a disposition written at done made
// the token read as ended while its status still read done, and the verdict
// activity — declared from done to closed — could not be reached by anyone:
// the submission came back "this token is already closed", and TakeUp refused
// se run and se apply naming it, so a reviewer could not run a criterion's
// command against the thing it was reviewing. Every standard token that
// reached done stranded there.
func TestTheWorkStepDoesNotEndTheToken(t *testing.T) {
	t.Parallel()
	r := aTreeWithTheProcesses(t)
	tok := mintStandard(t, r, "submitted carrying a disposition")

	ticked(t, r, tok.ID)
	if got := Pull(r, "worker-1", RoleWorker, Payload{ID: tok.ID, Disposition: "done"}); got.Pull == AnswerRefused {
		t.Fatalf("the work step was refused: %+v", got.Findings)
	}
	done, _ := LoadToken(r, tok.ID)
	if done.Status != "done" || done.Ended() {
		t.Fatalf("after the work step the token reads %q, disposition %q, ended %v",
			done.Status, done.Disposition, done.Ended())
	}

	// AND IT IS OPEN TO ITS REVIEWER: nameable, which is what se run and se
	// apply ask for, and rulable, which is the step the process says is left.
	//
	// THE REVIEWER CLAIMS IT FIRST, the way any actor takes a travelling token.
	// It used to be nameable without one, by riding the worker's claim, which
	// still stood because a submission released the hold and not the claim.
	if _, err := Claim(r, Claimant(r, "reviewer-1"), []string{tok.ID}, time.Now().UTC()); err != nil {
		t.Fatalf("the reviewer claiming the token it is reviewing: %v", err)
	}
	if _, err := TakeUp(r, tok.ID, "reviewer-1"); err != nil {
		t.Fatalf("a reviewer could not name the token it is reviewing: %v", err)
	}
	ticked(t, r, tok.ID)
	if got := Pull(r, "reviewer-1", RoleReviewer, Payload{ID: tok.ID, Disposition: "done"}); got.Pull == AnswerRefused {
		t.Fatalf("the verdict was refused: %+v", got.Findings)
	}
	closed, _ := LoadToken(r, tok.ID)
	if closed.Status != "closed" || closed.Disposition != Done {
		t.Fatalf("after the verdict the token reads %q %q", closed.Status, closed.Disposition)
	}

	// AND WHAT IS SHUT STAYS SHUT. The verdict ended it, so a second verdict is
	// refused and the token can no longer be named: opening done did not open
	// closed with it.
	if got := Pull(r, "reviewer-2", RoleReviewer, Payload{ID: tok.ID, Disposition: "done"}); got.Pull != AnswerRefused {
		t.Fatalf("a closed token took a second verdict: %s", got.Pull)
	}
	if _, err := TakeUp(r, tok.ID, "reviewer-2"); err == nil {
		t.Fatal("a closed token could still be named on se run and se apply")
	}
}

// AN ENDING SENT TO A STEP THAT DOES NOT END IS REFUSED, and not quietly
// dropped: a dropped carries its reason and a became its successors, and
// swallowing either loses what somebody meant to say. Ending a token early is
// se stop's, which moves the status to where the process stops rather than
// leaving it standing at a state that still owes a step.
func TestAnEndingIsRefusedOnAStepThatDoesNotEnd(t *testing.T) {
	t.Parallel()
	r := aTreeWithTheProcesses(t)
	tok := mintStandard(t, r, "dropped while working")
	ticked(t, r, tok.ID)
	got := Pull(r, "worker-1", RoleWorker,
		Payload{ID: tok.ID, Disposition: "dropped", Reason: "not wanted after all"})
	if got.Pull != AnswerRefused || got.Findings[0].Clause != "disposition" {
		t.Fatalf("a drop on the work step was answered %s %+v", got.Pull, got.Findings)
	}
	// A REFUSAL MOVES NOTHING.
	still, _ := LoadToken(r, tok.ID)
	if still.Status != "open" || still.Ended() {
		t.Fatalf("the refused submission left the token at %q, ended %v", still.Status, still.Ended())
	}
}

// THE QUEUE WANTS HANDS, AND THE MAIN AGENT IS HELD UNTIL THEY PULL. As many
// of each role as there is work for, never more than the one number, and a
// spawned agent counts the moment it pulls.
func TestTheQueueIsStaffed(t *testing.T) {
	t.Parallel()
	r := aTreeWithTheProcesses(t)
	noEngineHere(t, r)
	log, err := sessionlog.Open(r.Private("log"))
	if err != nil {
		t.Fatal(err)
	}
	defer log.Close()
	// THE RUN IS NAMED BY THE FIRST LINE OF ITS LOG, which the engine writes
	// at start. A mint writing first would name it current, which is no name.
	record(log, "engine", "start", "engine", "engine started", sessionlog.Yes(), nil)
	// THE NUMBER IS THIS TEST'S, AND THE TREE SAYS IT.
	//
	// It was set on a Config value the assertions below never reach: the hook
	// loads its own config out of the tree, so it read the declared five while
	// the story said two, and the last three assertions were about a number
	// nobody had set. Storing it is how a person sets it, so both halves agree.
	theParametersSay(t, r, "limits.parallel_agents", 3)
	cfg := LoadConfig(r)
	if cfg.ParallelAgents != 3 {
		t.Fatalf("the tree says three parallel agents and the config reads %d", cfg.ParallelAgents)
	}
	// AND IT IS THE TREE'S NUMBER RATHER THAN THE METHOD'S OWN.
	//
	// Three is also what the method declares, so every count below reads the
	// same whether the store worked or not. Taking the store out left the whole
	// test green, which is the defect this test was fixed for reading as sound.
	// Where the value came from is the one answer the default cannot fake.
	if from := cfg.From["limits.parallel_agents"]; from != "the project" {
		t.Fatalf("the number came from %q and not from the tree this test wrote", from)
	}

	// FOUR OPEN TOKENS WANT THREE WORKERS, because there is work for all three.
	for i := 0; i < 4; i++ {
		mintStandard(t, r, "open work")
	}
	s := StaffingOf(r, cfg)
	if s.OpenWork != 4 || s.WorkersWanted != 3 || s.WorkersHere != 0 {
		t.Fatalf("four open tokens: %+v", s)
	}
	// AND FIVE STILL WANT THREE, because the number is a maximum.
	mintStandard(t, r, "one more")
	if s := StaffingOf(r, cfg); s.WorkersWanted != 3 {
		t.Fatalf("five open tokens want %d workers", s.WorkersWanted)
	}

	// THE MAIN AGENT IS REFUSED THE QUEUE, and told to spawn. Everything else
	// goes through, including the tools it needs to answer the person.
	decide := func(tool string) string {
		t.Helper()
		body, _ := json.Marshal(map[string]any{"hook_event_name": "PreToolUse", "cwd": r.Work, "session_id": "s-1",
			"tool_name": tool, "tool_input": map[string]any{"query": "x"}})
		var out bytes.Buffer
		answerHook(t.Context(), body, []string{"--method", r.Method}, &out, log)
		return out.String()
	}
	// THE PULL, BECAUSE WHAT IS HELD IS THE QUEUE. It was the work that was
	// held, and that reached past the rule: the owner asked a question and the
	// answer came back as a demand to spawn. See heldDuringShortfall.
	if said := decide("mcp__quackitect__se_pull"); !strings.Contains(said, "spawn 2 subagents") {
		t.Fatalf("the main agent was not held for two workers: %s", said)
	}
	// AND ITS OWN CALL PUT IT IN THE REGISTER, WHERE IT COUNTS AS A WORKER.
	// Three is the main agent and two spawned, so it is asked for two rather
	// than three.
	if s := StaffingOf(r, cfg); s.WorkersHere != 1 {
		t.Fatalf("the main agent has called and the count says %d worker(s): %+v", s.WorkersHere, s)
	}
	if said := decide("Read"); strings.Contains(said, "deny") {
		t.Fatalf("a read was refused, so the agent cannot read the guard refusing it: %s", said)
	}
	// AND A PERSON CAN STILL BE TALKED TO. WebSearch stands for every tool that
	// is not the queue: a shortfall is answered by spawning, and refusing these
	// never made a hand appear.
	if said := decide("WebSearch"); strings.Contains(said, "spawn") {
		t.Fatalf("a search was held for a shortfall, so a person cannot ask a question: %s", said)
	}
	if said := decide("mcp__quackitect__se_stop"); strings.Contains(said, "deny") {
		t.Fatalf("the stop was refused, so an agent that cannot work cannot stop either: %s", said)
	}
	if said := decide("Agent"); strings.Contains(said, "deny") {
		t.Fatalf("the spawning tool was refused: %s", said)
	}
	if said := decide("mcp__quackitect__se_answer"); strings.Contains(said, "deny") {
		t.Fatalf("answering the person was refused: %s", said)
	}

	// A HELPER THAT PULLS IS A HAND, and the token it takes leaves the open
	// count: four open want three workers, and two of the three are here.
	tellHelper := func(id, actor string) {
		t.Helper()
		body, _ := json.Marshal(map[string]any{"hook_event_name": "PreToolUse", "cwd": r.Work, "session_id": "s-1",
			"agent_id": id, "agent_type": "general-purpose", "tool_name": "mcp__quackitect__se_pull",
			"tool_input": map[string]any{"actor": actor, "role": "worker"}})
		var out bytes.Buffer
		answerHook(t.Context(), body, []string{"--method", r.Method}, &out, log)
		Pull(r, actor, RoleWorker, Payload{})
	}
	tellHelper("a1", "worker-a")
	if s := StaffingOf(r, cfg); s.OpenWork != 4 || s.WorkersHere != 2 || s.WorkersWanted != 3 {
		t.Fatalf("after one helper pulled: %+v", s)
	}
	// TWO OF THE THREE ARE HERE, so the main agent is still held for the third.
	if said := decide("mcp__quackitect__se_pull"); !strings.Contains(said, "spawn 1 subagent") {
		t.Fatalf("with one of two here, the main agent was not held for the second: %s", said)
	}
	tellHelper("a2", "worker-b")
	// THREE WORKERS IS THE MAIN AGENT AND TWO SPAWNED, so the shortfall lifts
	// here rather than at a third spawn.
	if s := StaffingOf(r, cfg); s.WorkersHere != 3 {
		t.Fatalf("the main agent and two spawned workers counted %d: %+v", s.WorkersHere, s)
	}
	// THE SHORTFALL IS WHAT LIFTS, and not every refusal. A bare Bash is still
	// refused by the command gate, which is a different rule and stays.
	if said := decide("mcp__quackitect__se_pull"); strings.Contains(said, "THE QUEUE WANTS MORE HANDS") {
		t.Fatalf("with both workers here, the main agent is still held: %s", said)
	}

	// A VERDICT OWED WANTS A REVIEWER, and a worker is not one.
	held, _ := LoadToken(r, Tokens(r)[0].ID)
	tokDone := held
	if tokDone.Holder == "" {
		got := Pull(r, "worker-a", RoleWorker, Payload{})
		tokDone = *got.Token
	}
	tokDone = ticked(t, r, tokDone.ID)
	if got := Pull(r, tokDone.Holder, RoleWorker, Payload{ID: tokDone.ID}); got.Pull == AnswerRefused {
		t.Fatalf("the work step was refused: %+v", got.Findings)
	}
	s = StaffingOf(r, cfg)
	if s.AwaitingVerdict != 1 || s.ReviewersWanted != 1 || s.ReviewersHere != 0 {
		t.Fatalf("a verdict owed: %+v", s)
	}
	if said := decide("mcp__quackitect__se_pull"); !strings.Contains(said, "reviewing.md") {
		t.Fatalf("the main agent was not told to spawn a reviewer: %s", said)
	}
}

// theParametersSay stores one parameter in the tree, the way the panel does, so
// a test and the engine reading the same tree read the same value.
func theParametersSay(t *testing.T, r Roots, key string, value any) {
	t.Helper()
	for _, name := range []string{"parameters.json", "icons.json"} {
		b, err := os.ReadFile(filepath.Join("..", "..", "util", name))
		if err != nil {
			t.Fatal(err)
		}
		if err := writeAtomic(filepath.Join(r.Method, "util", name), b, 0o644); err != nil {
			t.Fatal(err)
		}
	}
	b, err := json.Marshal(map[string]any{key: value})
	if err != nil {
		t.Fatal(err)
	}
	if err := writeAtomic(valuesPath(r), b, 0o644); err != nil {
		t.Fatal(err)
	}
}
