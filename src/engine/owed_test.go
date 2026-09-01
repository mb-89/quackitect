package main

import (
	"os"
	"os/exec"
	"path/filepath"
	"strconv"
	"strings"
	"sync"
	"testing"
	"time"
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

	// THE GRACE IS SPENT FIRST, and it is warned rather than refused. A prompt
	// lands while a call is already in flight, and killing that call kills work
	// the agent began before it could have known.
	for i := 0; i < GraceCalls; i++ {
		if out := hookSays(t, exe, r.Method, "PreToolUse", read); strings.Contains(out, `"deny"`) {
			t.Fatalf("call %d of the grace was refused: %s", i+1, out)
		} else if !strings.Contains(out, "the editor is still not right") {
			t.Fatalf("call %d of the grace says nothing about the prompt: %s", i+1, out)
		}
	}

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
		`grep -rn "--answer" src/`,
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
	// The grace first, which is warned, and then the refusal.
	for i := 0; i < GraceCalls; i++ {
		hookSays(t, exe, r.Method, "PreToolUse", read)
	}
	if out := hookSays(t, exe, r.Method, "PreToolUse", read); !strings.Contains(out, `"deny"`) {
		t.Fatalf("the subagent was not refused after its grace: %s", out)
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

// A VERB THAT CANNOT KNOW WHOSE OBLIGATION IT IS WRITES NOBODY'S.
//
// The store is keyed by actor and the one writer every agent reaches always
// wrote the key main. The stub runs the engine with no actor named, and the
// flag defaulted to main, so any agent's answer discharged main's obligation
// and any agent's fallback record landed on main. A message given to a reviewer
// blocked main, which was never shown it and can never answer it.
//
// TWO HALVES, BOTH ASSERTED. The create and the clear are two separate ways one
// defaulted key does damage, and a check on the clear alone would pass a verb
// that still misfiles every message.
func TestAnUnnamedActorWritesNobodysObligation(t *testing.T) {
	r := lane(t)
	if err := TheyAsked(r, "main", "the thing main was told"); err != nil {
		t.Fatal(err)
	}
	if err := TheyAsked(r, "reviewer", "the thing the reviewer was told"); err != nil {
		t.Fatal(err)
	}

	// THE CLEAR. An answer with nobody named leaves both standing.
	if err := TheyWereAnsweredIfNamed(r, ""); err != nil {
		t.Fatal(err)
	}
	for _, who := range []string{"main", "reviewer"} {
		if _, owed := AnswerOwed(r, who); !owed {
			t.Errorf("%s's obligation was discharged by an answer from nobody", who)
		}
	}

	// THE CREATE IS THE OTHER WAY ROUND, AND THE ASYMMETRY IS THE POINT. A
	// message has an obvious owner and an answer does not. So a message nobody
	// attributed is the walker's, here as in the copier, and leaving it
	// unattributed meant the fallback verb recorded the words and left nobody
	// owing, so the guard refused nothing.
	fresh := lane(t)
	if err := TheyAskedIfNamed(fresh, "", "a message given to somebody"); err != nil {
		t.Fatal(err)
	}
	if said, owed := AnswerOwed(fresh, Walker); !owed || said != "a message given to somebody" {
		t.Errorf("a message nobody was named for left nobody owing: %q %v", said, owed)
	}

	// AND A NAMED ACTOR IS STILL THE ONE NAMED, so the default is a default.
	if err := TheyAskedIfNamed(fresh, "reviewer", "a message given to the reviewer"); err != nil {
		t.Fatal(err)
	}
	if _, owed := AnswerOwed(fresh, "reviewer"); !owed {
		t.Fatal("a named actor's obligation was not written")
	}
	if err := TheyWereAnsweredIfNamed(fresh, "reviewer"); err != nil {
		t.Fatal(err)
	}
	if _, owed := AnswerOwed(fresh, "reviewer"); owed {
		t.Fatal("a named actor's answer did not discharge it")
	}
}

// TWO AGENTS ASKING AT THE SAME MOMENT BOTH STILL OWE.
//
// The store was read whole, one key changed, and the whole map written back.
// The guard is a fresh process on every tool call of every agent, so the gap
// between the read and the write is not a rare event: two agents overlapping
// lost one of the two obligations every time, and a lost obligation is a
// question in the record that nobody is refused for.
func TestTwoAgentsAskingAtOnceBothStillOwe(t *testing.T) {
	for round := 0; round < 200; round++ {
		r := lane(t)
		var wg sync.WaitGroup
		for _, who := range []string{"one", "two"} {
			wg.Add(1)
			go func(who string) {
				defer wg.Done()
				_ = TheyAsked(r, who, "a question for "+who)
			}(who)
		}
		wg.Wait()
		for _, who := range []string{"one", "two"} {
			if said, owed := AnswerOwed(r, who); !owed {
				t.Fatalf("round %d: %s's question was erased by the other agent's write (%q)",
					round, who, said)
			}
		}
	}
}

// AN OBLIGATION DOES NOT OUTLIVE THE SESSION IT WAS MADE IN.
//
// The store had no lifetime, so a question from three hours ago was still owed
// by an agent that had been gone since the engine restarted. Agent names are
// handed out per session and reused, so the first thing a fresh agent of that
// name is told is to answer a message the owner moved past hours before.
//
// arrivals.json had the same problem and solved it: an arrival from an earlier
// session says nothing about this one. The same sentence is true here.
func TestAnObligationDiesWithItsSession(t *testing.T) {
	r := guidanceTree(t)
	l, _ := OpenLog(r.Private("log"))
	l.Write("engine", "start", "engine", "started", Yes(), nil)
	l.Close()

	if err := TheyAsked(r, "main", "the thing said in this session"); err != nil {
		t.Fatal(err)
	}
	if _, owed := AnswerOwed(r, "main"); !owed {
		t.Fatal("nothing is owed in the session it was said in")
	}

	// The engine restarts. Everything before this belongs to another run.
	os.Remove(filepath.Join(r.Private("log"), Current))
	l2, _ := OpenLog(r.Private("log"))
	// A session is stamped to the second, and a test runs faster than that, so
	// the second run is named rather than waiting for the clock.
	l2.session = l2.session + "-after-the-restart"
	l2.Write("engine", "start", "engine", "started again", Yes(), nil)
	l2.Close()

	if said, owed := AnswerOwed(r, "main"); owed {
		t.Fatalf("a question from a session that ended is still owed: %q", said)
	}
	// And the new session can carry its own.
	if err := TheyAsked(r, "main", "the thing said after the restart"); err != nil {
		t.Fatal(err)
	}
	said, owed := AnswerOwed(r, "main")
	if !owed || said != "the thing said after the restart" {
		t.Fatalf("the new session cannot record one: %q %v", said, owed)
	}
}

// THE WAITER OUTLASTS THE STALENESS.
//
// A lock is resolved by being stolen when its holder has died, and going ahead
// without it is the last resort. The two numbers were the wrong way round: a
// waiter gave up after a second and a lock went stale after five, so no waiter
// ever lived long enough to steal one and every one of them wrote unlocked.
func TestTheWaiterOutlastsTheStaleness(t *testing.T) {
	budget := time.Duration(lockTries) * lockWait
	if budget <= lockIsStale {
		t.Fatalf("a waiter gives up after %v and a lock goes stale after %v, "+
			"so no waiter ever steals one", budget, lockIsStale)
	}
}

// AND A LOCK NOBODY IS BEHIND IS TAKEN RATHER THAN WAITED OUT.
//
// This is written in terms of the staleness, so it says the steal works and it
// says nothing about whether the number is right. The one above is what holds
// the numbers in the right order, and that one goes red.
func TestADeadLockIsStolenAndTheWriteHappensUnderIt(t *testing.T) {
	r := lane(t)
	os.MkdirAll(r.Private(), 0o755)
	lock := owedPath(r) + ".lock"
	if err := os.WriteFile(lock, nil, 0o644); err != nil {
		t.Fatal(err)
	}
	// A lock left by a process that died is one nothing is touching.
	// Just past stale, so this fails rather than passes if the staleness is set
	// beyond what a waiter lives to see.
	old := time.Now().Add(-lockIsStale - 200*time.Millisecond)
	if err := os.Chtimes(lock, old, old); err != nil {
		t.Fatal(err)
	}

	began := time.Now()
	if err := TheyAsked(r, "main", "a question behind a dead lock"); err != nil {
		t.Fatal(err)
	}
	took := time.Since(began)
	if _, owed := AnswerOwed(r, "main"); !owed {
		t.Fatal("the write behind a dead lock did not happen")
	}
	if _, err := os.Stat(lock); err == nil {
		t.Fatal("the lock is still there, so the write went ahead beside it rather than under it")
	}
	if took > lockIsStale {
		t.Fatalf("it waited %v for a lock nobody was behind", took)
	}
}

// THE FALLBACK VERB WRITES THE SAME FACT THE COPIER WRITES.
//
// The stub runs se --said with no actor, and the guidance names that verb as
// the fallback for a message the engine has not copied. It recorded the words
// and left nobody owing, so for a message that arrived that way the guard
// refused nothing and the turn went quiet on the person with their sentence
// sitting in the log.
//
// TWO WRITERS OF ONE FACT HAVE TO AGREE ABOUT WHOSE IT IS. The copier writes it
// against the walker. So does this.
func TestTheFallbackVerbLeavesTheWalkerOwing(t *testing.T) {
	exe := buildEngine(t)
	r := guidanceTree(t)
	l, _ := OpenLog(r.Private("log"))
	l.Write("engine", "start", "engine", "started", Yes(), nil)
	l.Close()

	const said = "the reviewer backlog is too big"
	// Exactly as the stub runs it: no actor named.
	out, err := exec.Command(exe, "--work", r.Work, "--method", r.Method, "--said", said).CombinedOutput()
	if err != nil {
		t.Fatalf("the verb failed: %v\n%s", err, out)
	}
	got, owed := AnswerOwed(r, Walker)
	if !owed {
		t.Fatalf("the words are in the log and nobody owes an answer: %s", out)
	}
	if got != said {
		t.Fatalf("the walker owes %q", got)
	}
}

// AND THE TWO WRITERS MAKE ONE OBLIGATION, WHICHEVER GETS THERE FIRST.
//
// The defect is that they disagree, so a check on one order alone would pass a
// tree where the other order still loses the message.
func TestTheTwoWritersMakeOneObligationInEitherOrder(t *testing.T) {
	exe := buildEngine(t)
	const said = "and one more thing while you are at it"

	fallbackFirst := func(t *testing.T, r Roots, l *Log, path string) {
		out, err := exec.Command(exe, "--work", r.Work, "--method", r.Method, "--said", said).CombinedOutput()
		if err != nil {
			t.Fatalf("the verb failed: %v\n%s", err, out)
		}
		CopyWhatWasHeard(r, path, l, "reviewer3")
	}
	copierFirst := func(t *testing.T, r Roots, l *Log, path string) {
		CopyWhatWasHeard(r, path, l, "reviewer3")
		out, err := exec.Command(exe, "--work", r.Work, "--method", r.Method, "--said", said).CombinedOutput()
		if err != nil {
			t.Fatalf("the verb failed: %v\n%s", err, out)
		}
	}
	for name, order := range map[string]func(*testing.T, Roots, *Log, string){
		"the fallback first": fallbackFirst,
		"the copier first":   copierFirst,
	} {
		t.Run(name, func(t *testing.T) {
			r := guidanceTree(t)
			l, _ := OpenLog(r.Private("log"))
			l.Write("engine", "start", "engine", "started", Yes(), nil)

			path := filepath.Join(t.TempDir(), "session.jsonl")
			os.WriteFile(path, nil, 0o644)
			StartWhereItIs(r, path)
			os.WriteFile(path, []byte(queued(said)), 0o644)

			order(t, r, l, path)
			l.Close()

			owed := loadOwed(r)
			n := 0
			for _, who := range owed {
				for _, one := range who {
					if one == said {
						n++
					}
				}
			}
			if n != 1 {
				t.Fatalf("one message left %d obligations: %v", n, owed)
			}
			if got, yes := AnswerOwed(r, Walker); !yes || got != said {
				t.Fatalf("the walker owes %q, %v", got, yes)
			}
		})
	}
}

// A BADLY TIMED FIRST CALL IS NOT KILLED, AND THE FOURTH ONE IS.
//
// THE OWNER'S RULE: the first three calls after a prompt arrives get a warning
// saying there is a prompt waiting and how many are left. Only then does the
// engine block.
//
// WHY A GRACE AT ALL. A prompt lands while a tool call is already in flight, so
// the agent is refused for not answering something it has not been shown yet,
// and the work it was doing dies with the refusal. The rule is about an agent
// that goes quiet into its work, and a call that started before the message
// arrived is not that.
func TestAnAnswerIsAskedForThreeTimesBeforeItIsRefused(t *testing.T) {
	r := lane(t)
	if err := TheyAsked(r, "main", "what is going on with the icons"); err != nil {
		t.Fatal(err)
	}
	for i := 1; i <= GraceCalls; i++ {
		said, refuse := AnswerOwedNow(r, "main")
		if refuse {
			t.Fatalf("call %d of %d was refused, and the grace is %d", i, GraceCalls, GraceCalls)
		}
		if said == "" {
			t.Fatalf("call %d says nothing about the prompt waiting", i)
		}
		if !strings.Contains(said, "what is going on with the icons") {
			t.Fatalf("the warning does not carry what they said: %q", said)
		}
		// AND IT SAYS HOW MANY ARE LEFT, because a warning that does not is a
		// warning an agent learns to read past.
		if !strings.Contains(said, strconv.Itoa(GraceCalls-i)) {
			t.Fatalf("warning %d does not say %d are left: %q", i, GraceCalls-i, said)
		}
	}
	if _, refuse := AnswerOwedNow(r, "main"); !refuse {
		t.Fatalf("the call after %d warnings was not refused", GraceCalls)
	}
	// AND IT KEEPS REFUSING. A grace that renewed itself would be no gate.
	if _, refuse := AnswerOwedNow(r, "main"); !refuse {
		t.Fatal("the refusal did not hold")
	}
	// ANSWERING CLEARS IT, and the next prompt gets its own grace.
	if err := TheyWereAnswered(r, "main"); err != nil {
		t.Fatal(err)
	}
	if _, refuse := AnswerOwedNow(r, "main"); refuse {
		t.Fatal("an agent that answered is still refused")
	}
	if err := TheyAsked(r, "main", "and another thing"); err != nil {
		t.Fatal(err)
	}
	if _, refuse := AnswerOwedNow(r, "main"); refuse {
		t.Fatal("a fresh prompt was refused on its first call")
	}
}

// THE GRACE IS ONE AGENT'S. Two agents overlapping is why this store is keyed
// by actor at all, and a grace spent by one would refuse the other early.
func TestTheGraceIsCountedPerAgent(t *testing.T) {
	r := lane(t)
	if err := TheyAsked(r, "main", "a question"); err != nil {
		t.Fatal(err)
	}
	if err := TheyAsked(r, "reviewer1", "another question"); err != nil {
		t.Fatal(err)
	}
	for i := 0; i <= GraceCalls; i++ {
		AnswerOwedNow(r, "main")
	}
	if _, refuse := AnswerOwedNow(r, "main"); !refuse {
		t.Fatal("main spent its grace and was not refused")
	}
	if _, refuse := AnswerOwedNow(r, "reviewer1"); refuse {
		t.Fatal("reviewer1 was refused on a grace main spent")
	}
}

// AN EDITOR SAYING WHERE SOMEBODY IS LOOKING IS NOT A QUESTION.
//
// The harness writes a notice into the turn when a person opens a file. It is
// the editor telling the agent where the person is, and treating it as a prompt
// made the engine demand an answer to a file being opened.
//
// IT IS NOT COUNTED RATHER THAN FORGIVEN. A notice that became an obligation
// and then had its grace spent is still an obligation nobody can clear.
func TestANoticeFromTheEditorIsNotAQuestion(t *testing.T) {
	r := lane(t)
	notices := []string{
		"<ide_opened_file>The user opened the file c:/x/y.md in the IDE. " +
			"This may or may not be related to the current task.</ide_opened_file>",
		"  <ide_opened_file>a file</ide_opened_file>  ",
	}
	for _, one := range notices {
		if err := TheyAsked(r, "main", one); err != nil {
			t.Fatal(err)
		}
		if said, _ := AnswerOwedNow(r, "main"); said != "" {
			t.Fatalf("an editor notice became something to answer: %q", said)
		}
	}
	// AND A REAL QUESTION IN THE SAME MESSAGE IS STILL A QUESTION, because a
	// person types after the notice and that is what they said.
	both := "<ide_opened_file>a file</ide_opened_file>\nwhy is the light still red"
	if err := TheyAsked(r, "main", both); err != nil {
		t.Fatal(err)
	}
	said, _ := AnswerOwedNow(r, "main")
	if !strings.Contains(said, "why is the light still red") {
		t.Fatalf("a question written under a notice was dropped: %q", said)
	}
	if strings.Contains(said, "ide_opened_file") {
		t.Fatalf("the notice was kept as part of what they said: %q", said)
	}
}
