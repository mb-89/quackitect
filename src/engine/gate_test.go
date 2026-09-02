package main

import (
	"path/filepath"
	"strings"
	"testing"
)

// NO TOKEN, NO WRITING. And naming one is what puts it in work, so the agent
// never opens a token as a separate act.
//
// THE OWNER'S WORDS: whenever you do something that writes or can write, you
// have to say which token it is about, and that flips the token to in work. It
// flips any other token per agent to not in work. So one agent never holds more
// than one token, and there are never more tokens open than there are agents
// working.

// THE FLIP IS THE WHOLE MECHANISM. Naming a token is not a request to open it
// later. It is the opening.
func TestNamingATokenPutsItInWork(t *testing.T) {
	r := lane(t)
	one := mint(t, r, Token{Title: "the first", Status: ImpOpen})

	got, err := WorkOn(r, one.ID, "main")
	if err != nil {
		t.Fatal(err)
	}
	if got.Status != ImpInWork {
		t.Errorf("naming a token left it %s", got.Status)
	}
	if got.Holder != "main" {
		t.Errorf("naming a token left the holder %q", got.Holder)
	}
	// AND IT IS ON DISK, not only in the value handed back. A flip nothing wrote
	// is a flip the panel never sees, which is the whole reason for this.
	back, err := LoadToken(r, one.ID)
	if err != nil {
		t.Fatal(err)
	}
	if back.Status != ImpInWork || back.Holder != "main" {
		t.Errorf("the note says %s held by %q", back.Status, back.Holder)
	}
}

// ONE AGENT HOLDS ONE TOKEN. Naming a second puts the first back where it came
// from, which is open and not backlogged: backlogged means nobody is doing it,
// and somebody was.
func TestNamingASecondTokenPutsTheFirstBack(t *testing.T) {
	r := lane(t)
	first := mint(t, r, Token{Title: "the first", Status: ImpOpen})
	second := mint(t, r, Token{Title: "the second", Status: ImpOpen})

	if _, err := WorkOn(r, first.ID, "main"); err != nil {
		t.Fatal(err)
	}
	if _, err := WorkOn(r, second.ID, "main"); err != nil {
		t.Fatal(err)
	}

	was, err := LoadToken(r, first.ID)
	if err != nil {
		t.Fatal(err)
	}
	if was.Status != ImpOpen {
		t.Errorf("the first is %s and nobody is working on it", was.Status)
	}
	if was.Holder != "" {
		t.Errorf("the first is still held by %q", was.Holder)
	}
	// THE INVARIANT, ASKED OF THE RECORD RATHER THAN OF THE TWO IDS THIS TEST
	// HAPPENS TO KNOW. A third token flipped by a bug would pass a two-id
	// assertion and fail this one.
	if held := InWorkFor(r, "main"); len(held) != 1 || held[0].ID != second.ID {
		t.Errorf("main holds %d token(s) and the last one named was %s", len(held), second.ID)
	}
}

// AND ONE AGENT DOES NOT MOVE ANOTHER'S. The flip is per agent, which is why
// the call carries who is calling.
func TestNamingATokenLeavesAnotherAgentsAlone(t *testing.T) {
	r := lane(t)
	theirs := mint(t, r, Token{Title: "theirs", Status: ImpOpen, Assignee: "rev-1"})
	mine := mint(t, r, Token{Title: "mine", Status: ImpOpen})

	if _, err := WorkOn(r, theirs.ID, "rev-1"); err != nil {
		t.Fatal(err)
	}
	if _, err := WorkOn(r, mine.ID, "main"); err != nil {
		t.Fatal(err)
	}

	back, err := LoadToken(r, theirs.ID)
	if err != nil {
		t.Fatal(err)
	}
	if back.Status != ImpInWork || back.Holder != "rev-1" {
		t.Errorf("main's naming moved rev-1's token to %s held by %q", back.Status, back.Holder)
	}
	if held := InWorkFor(r, "rev-1"); len(held) != 1 {
		t.Errorf("rev-1 holds %d token(s) after main named one of its own", len(held))
	}
}

// A WRITE WITH NO TOKEN IS REFUSED, AND THE REFUSAL IS A MENU.
//
// A wall that says no and stops there sends the agent looking for a way round.
// This one names what is open for that agent, so the next call is the right one.
func TestAWriteWithNoTokenIsRefused(t *testing.T) {
	r := lane(t)
	one := mint(t, r, Token{Title: "the open one", Status: ImpOpen})

	why, refuse := WriteNeedsAToken(r, "main", "Write", "")
	if !refuse {
		t.Fatal("a write with no token in hand was allowed")
	}
	if !strings.Contains(why, one.ID) {
		t.Errorf("the refusal does not name what is open for this agent: %s", why)
	}

	if _, err := WorkOn(r, one.ID, "main"); err != nil {
		t.Fatal(err)
	}
	if why, refuse := WriteNeedsAToken(r, "main", "Write", ""); refuse {
		t.Errorf("a write was refused with a token in hand: %s", why)
	}
}

// A SHELL COMMAND CAN WRITE, so it is gated like a write. This is the owner's
// own clause and it is the one an agent would route around.
//
// THE SET IS ASKED FOR RATHER THAN LISTED TWICE. The tools that can write are
// declared in one place and this walks that declaration, so a tool added there
// is gated here without anybody remembering to add it.
func TestEveryToolThatCanWriteIsGated(t *testing.T) {
	r := lane(t)
	mint(t, r, Token{Title: "the open one", Status: ImpOpen})
	if len(WriteTools) == 0 {
		t.Fatal("no tool is declared as one that can write, so this guards nothing")
	}
	for name := range WriteTools {
		if _, refuse := WriteNeedsAToken(r, "main", name, ""); !refuse {
			t.Errorf("%s can write and was allowed with no token in hand", name)
		}
	}
	if _, ok := WriteTools["Bash"]; !ok {
		t.Error("a shell command can write and Bash is not gated")
	}
}

// AND A READ IS LEFT ALONE. Reading changes nothing, and an agent that cannot
// read cannot find out which token it needs, which is the shape of a guard
// somebody turns off.
func TestAReadNeedsNoToken(t *testing.T) {
	r := lane(t)
	mint(t, r, Token{Title: "the open one", Status: ImpOpen})
	for _, tool := range []string{"Read", "Grep", "Glob"} {
		if why, refuse := WriteNeedsAToken(r, "main", tool, ""); refuse {
			t.Errorf("%s only reads and was refused: %s", tool, why)
		}
	}
}

// THE GUARD IS WHERE THE REFUSAL HAS TO HAPPEN, so it is driven here rather
// than only reasoned about. A function that would refuse and a hook that never
// calls it is half a mechanism, and the half left out is the one that acts.
func TestTheGuardRefusesAWriteWithNoTokenAndTakesTheEngineThrough(t *testing.T) {
	exe := buildEngine(t)
	r := guidanceTree(t)
	if _, err := Project(r); err != nil {
		t.Fatal(err)
	}
	l, _ := OpenLog(r.Private("log"))
	l.Close()
	one := mint(t, r, Token{Title: "the open one", Status: ImpOpen})

	deny := hookSays(t, exe, r.Method, "PreToolUse", map[string]any{
		"cwd": r.Work, "tool_name": "Write",
		"tool_input": map[string]any{"file_path": filepath.Join(r.Work, "notes.md"), "content": "a line"},
	})
	if !strings.Contains(deny, `"permissionDecision":"deny"`) {
		t.Fatalf("a write with no token in hand was allowed: %s", deny)
	}
	if !strings.Contains(deny, one.ID) {
		t.Errorf("the refusal does not name what is open: %s", deny)
	}

	// A SHELL COMMAND CAN WRITE and is refused the same way. This is the clause
	// an agent would route around: refusing Write and allowing Bash refuses
	// nothing at all.
	deny = hookSays(t, exe, r.Method, "PreToolUse", map[string]any{
		"cwd": r.Work, "tool_name": "Bash",
		"tool_input": map[string]any{"command": "echo hello > notes.md"},
	})
	if !strings.Contains(deny, `"permissionDecision":"deny"`) {
		t.Fatalf("a shell command with no token in hand was allowed: %s", deny)
	}

	// AND THE SCRATCHPAD GOES THROUGH, which is the carve-out the detail asks
	// for and the one clause three rounds of review went past. It is driven
	// end to end rather than on WriteNeedsAToken alone, because the path has to
	// reach the gate through the hook to be worth anything, and round 3 named
	// this exact call as the check.
	pad := hookSays(t, exe, r.Method, "PreToolUse", map[string]any{
		"cwd": r.Work, "tool_name": "Write",
		"tool_input": map[string]any{
			"file_path": filepath.Join(r.Private("scratchpad"), "thinking.md"),
			"content":   "working out which token this is",
		},
	})
	if strings.Contains(pad, `"permissionDecision":"deny"`) {
		t.Errorf("a write into the scratchpad with nothing in hand was refused: %s", pad)
	}
	// AND ITS COMPANION, so a gate that opened for everybody cannot satisfy the
	// case above. Same actor, same empty hand, a path outside the folder.
	deny = hookSays(t, exe, r.Method, "PreToolUse", map[string]any{
		"cwd": r.Work, "tool_name": "Write",
		"tool_input": map[string]any{
			"file_path": filepath.Join(r.Work, "src", "engine", "gate.go"),
			"content":   "package main",
		},
	})
	if !strings.Contains(deny, `"permissionDecision":"deny"`) {
		t.Fatalf("a write to source with nothing in hand was allowed: %s", deny)
	}

	// AND MENTIONING THE ENGINE IS NOT RUNNING IT. This case stands beside the
	// one below on purpose: every other case of the exception in this suite is a
	// case that must be allowed, so a suite of them cannot see the exception
	// being too wide.
	deny = hookSays(t, exe, r.Method, "PreToolUse", map[string]any{
		"cwd": r.Work, "tool_name": "Bash",
		"tool_input": map[string]any{"command": "echo se > notes.md"},
	})
	if !strings.Contains(deny, `"permissionDecision":"deny"`) {
		t.Fatalf("a command that only mentions the engine skipped the gate: %s", deny)
	}
	// AND A COMPOUND DOES NOT CARRY ITS SECOND HALF THROUGH. The gate reads one
	// string, so a command that runs the engine and then writes was one call.
	deny = hookSays(t, exe, r.Method, "PreToolUse", map[string]any{
		"cwd": r.Work, "tool_name": "Bash",
		"tool_input": map[string]any{"command": ".bin/se pull --actor main && echo x > notes.md"},
	})
	if !strings.Contains(deny, `"permissionDecision":"deny"`) {
		t.Fatalf("a compound took its writing half through the gate: %s", deny)
	}

	// AND THE WAY OUT IS OPEN. The call that names a token runs the engine, and
	// an agent with nothing in hand has to be able to make it.
	allow := hookSays(t, exe, r.Method, "PreToolUse", map[string]any{
		"cwd": r.Work, "tool_name": "Bash",
		"tool_input": map[string]any{"command": ".bin/se work --on " + one.ID + " --by main"},
	})
	if strings.Contains(allow, `"permissionDecision":"deny"`) {
		t.Fatalf("naming a token was refused, so nothing can ever be named: %s", allow)
	}

	// With one in hand the write goes through.
	if _, err := WorkOn(r, one.ID, "main"); err != nil {
		t.Fatal(err)
	}
	out := hookSays(t, exe, r.Method, "PreToolUse", map[string]any{
		"cwd": r.Work, "tool_name": "Write",
		"tool_input": map[string]any{"file_path": filepath.Join(r.Work, "notes.md"), "content": "a line"},
	})
	if strings.Contains(out, `"permissionDecision":"deny"`) {
		t.Fatalf("a write was refused with a token in hand: %s", out)
	}
}

// A TOKEN THAT HAS ENDED CANNOT BE NAMED. Writing under a closed token files
// the work where nobody will look for it.
func TestAnEndedTokenCannotBeNamed(t *testing.T) {
	r := lane(t)
	// Mint refuses to make one that has already ended, so it is ended here the
	// way the engine ends one: by writing the note.
	done := mint(t, r, Token{Title: "the finished one", Status: ImpOpen})
	done.Status = ImpDone
	if err := SaveToken(r, done); err != nil {
		t.Fatal(err)
	}
	if _, err := WorkOn(r, done.ID, "main"); err == nil {
		t.Fatal("a token that has ended was named and taken")
	}
}

// A TEST THAT DRIVES THE GUARD THROUGH A WRITE NEEDS A TOKEN IN HAND, because
// that is now true of the system. It is here rather than inside guidanceTree so
// that a test which says nothing about a token still meets the gate, which is
// what a new agent meets.
func withATokenInHand(t *testing.T, r Roots) Token {
	t.Helper()
	one := mint(t, r, Token{Title: "the work in hand", Status: ImpOpen})
	if _, err := WorkOn(r, one.ID, "main"); err != nil {
		t.Fatal(err)
	}
	return one
}

// THE EXCEPTION IS THE ENGINE BEING THE PROGRAM, NOT THE WORD APPEARING.
//
// It split the command into fields and answered true if ANY field was se after
// quote and path stripping. So the write gate was skipped for any command that
// merely mentioned the engine, and for the whole of a compound whose first half
// ran it: .bin/se pull && python -c "open(...).write(...)" ran the engine and
// then wrote, and the gate saw one string and let it through.
//
// AND NOTHING COULD SEE IT. Every case of the exception in this suite is a case
// that must be ALLOWED, so a test suite full of them cannot notice the exception
// being too wide. These are the negative side.
func TestTheEngineExceptionIsAnchoredToTheProgram(t *testing.T) {
	allowed := []string{
		".bin/se work --on wk-1234567890 --by main",
		"se pull --actor main",
		`"C:\Users\x\.bin\se.exe" --answer "a sentence; with punctuation"`,
		`./.bin/se --answer "one thing && another"`,
	}
	for _, c := range allowed {
		if !runsTheEngine(c) {
			t.Errorf("this runs the engine and nothing else, and was taken out of the exception: %s", c)
		}
	}
	refused := []string{
		"echo se",
		"echo se && rm -rf src/engine",
		".bin/se pull --actor main && python -c print(1)",
		".bin/se pull --actor main; touch notes.md",
		".bin/se pull --actor main | tee notes.md",
		"python -c print(1) && .bin/se pull --actor main",
		"echo $(.bin/se pull --actor main) > notes.md",
		// A REDIRECTION IS A WRITE AND IT NEEDS NO SECOND PROGRAM. This was in
		// the exception, so se --version > src/engine/gate.go was an ungated
		// write of the gate's own source. A reviewer found it on the shipped
		// binary: the redirection was allowed while a plain rg was refused.
		"se --version > src/engine/gate.go",
		".bin/se pull --actor main >> notes.md",
		"se query > q.json 2>&1",
	}
	for _, c := range refused {
		if runsTheEngine(c) {
			t.Errorf("this does not run the engine alone and the write gate was skipped for it: %s", c)
		}
	}
}

// A REVIEWER HOLDS A TOKEN TOO, AND THE GATE HAS TO SEE IT.
//
// MEASURED, BY THE REVIEWERS THIS BROKE. Two reviewers reported the same thing
// in one afternoon: the gate refuses all Bash unless a token is named, a
// reviewer has none to name, so neither could run go test, node or the battery.
// One wrote that every measurement it reported was recomputed by hand and named
// the claims it could not confirm. That is a reviewer stopped from doing the
// first thing doc/guidance/reviewing.md asks of it, which is to reproduce every
// measurement, and it is this gate refusing too much.
//
// THE ANSWER IS NOT A LIST OF SAFE COMMANDS, which goes stale the day somebody
// runs a new one. A reviewer holding a token in review IS working on a token.
func TestAReviewerHoldingATokenMayWrite(t *testing.T) {
	r := lane(t)
	one := mint(t, r, Token{Title: "the probe", Assignee: "probeA", Status: ImpOpen})
	if _, done := settle(r, "probeA", RoleWorker, Payload{ID: one.ID, Disposition: "done"}); done {
		t.Fatal("the submission was refused")
	}
	// The reviewer takes it, which is what puts it in review under that name.
	if got := next(r, "rev-1", RoleReviewer); got.Pull != AnswerReview {
		t.Fatalf("the reviewer was handed nothing: %+v", got)
	}
	if why, refuse := WriteNeedsAToken(r, "rev-1", "Bash", ""); refuse {
		t.Errorf("a reviewer holding a token in review was refused: %s", why)
	}
	// AND IT IS THE HOLDER AND NOT THE STATE. Another actor with nothing in hand
	// is still refused while that token sits in review, so this is one reviewer
	// gaining its own token rather than the gate opening for everybody.
	if _, refuse := WriteNeedsAToken(r, "rev-2", "Bash", ""); !refuse {
		t.Error("an actor holding nothing was allowed because somebody else holds a review")
	}
}

// THE NAME THE HARNESS USES AND THE NAME THE AGENT PULLS WITH ARE TWO NAMES FOR
// ONE PROCESS, AND THE GATE HAS TO KNOW THAT.
//
// MEASURED, BY THE REVIEWER IT BROKE. rev-6 held a token in review under the
// name rev-6 and the guard asked about general-purpose-28, which is what the
// harness calls it. They never match, so the reviewer was refused every command
// including ls, could not deliver a rejection through the only door it had left,
// and closed a token it had not reviewed.
//
// THE LINK IS THE PULL ITSELF. The guard sees the command go past, and that
// command carries --actor. So the guard writes down that this harness name
// answers to that one, and asks about both.
func TestTheGateKnowsTheNameAnAgentPullsWith(t *testing.T) {
	r := lane(t)
	one := mint(t, r, Token{Title: "the probe", Assignee: "probeA", Status: ImpOpen})
	if _, done := settle(r, "probeA", RoleWorker, Payload{ID: one.ID, Disposition: "done"}); done {
		t.Fatal("the submission was refused")
	}
	if got := next(r, "rev-6", RoleReviewer); got.Pull != AnswerReview {
		t.Fatalf("the reviewer was handed nothing: %+v", got)
	}
	// The harness calls it something else, and with no link the gate refuses it.
	if _, refuse := WriteNeedsAToken(r, "general-purpose-28", "Bash", ""); !refuse {
		t.Fatal("an unknown harness name was allowed before any link was written")
	}
	// The guard sees the pull go past and writes the link.
	NoteTheNameItPullsWith(r, "general-purpose-28", ".bin/se pull --actor rev-6 --as reviewer")
	if why, refuse := WriteNeedsAToken(r, "general-purpose-28", "Bash", ""); refuse {
		t.Errorf("the harness name is linked to rev-6, which holds a review, and was refused: %s", why)
	}
	// AND THE LINK IS ONE NAME AND NOT A SKELETON KEY. Another harness name that
	// has pulled as nobody is still refused.
	if _, refuse := WriteNeedsAToken(r, "general-purpose-99", "Bash", ""); !refuse {
		t.Error("a harness name that has pulled as nobody was allowed")
	}
}
