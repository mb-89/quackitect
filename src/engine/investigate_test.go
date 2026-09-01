package main

import (
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"regexp"
	"strings"
	"testing"
)

// A hold nobody is behind, built the way the engine builds one, with a walker
// pulling and a reviewer that took a token and then stopped.
type quiet struct {
	roots Roots
	held  Token
	log   *Log
}

func aQuietHold(t *testing.T, status Status, holder string) quiet {
	t.Helper()
	r := guidanceTree(t)
	l, _ := OpenLog(r.Private("log"))
	l.Write("engine", "start", "engine", "started", Yes(), nil)
	l.Close()

	// Enough open work that the queue has something to hand out, so answering
	// an investigation instead is a decision rather than the only thing left.
	for i := 0; i < 4; i++ {
		if _, err := Mint(r, Token{Title: fmt.Sprintf("a thing number %d", i),
			Assignee: "main", Scope: SingleStep, MintedBy: "person"}); err != nil {
			t.Fatal(err)
		}
	}
	// THE HOLDER OWNS IT. A token in work assigned to the walker is reclaimed
	// by the walker's own arrival, so a fixture that assigns it to the walker
	// tests the reclaim rather than the investigation.
	held, err := Mint(r, Token{Title: "the stuck one", Assignee: holder,
		Scope: SingleStep, MintedBy: "person"})
	if err != nil {
		t.Fatal(err)
	}
	// The holder arrives for real, so it is an actor the engine has seen.
	if !Arrived(r, currentSession(r), holder) {
		t.Fatalf("%s did not arrive", holder)
	}
	held.Status, held.Holder = status, holder
	if err := SaveToken(r, held); err != nil {
		t.Fatal(err)
	}
	return quiet{roots: r, held: held}
}

// pullPast asks for work enough times that the holder falls behind the queue.
func pullPast(r Roots, actor string) Answer {
	var a Answer
	for i := 0; i <= TheFloor().PullsBeforeHoldIsStale; i++ {
		a = Pull(r, actor, RoleWorker, Payload{})
	}
	return a
}

// A QUIET HOLD SENDS SOMEBODY TO LOOK.
//
// A reviewer that stopped left a token held, and nothing said so. The refusal
// built for a queue that is over its limit does not fire under the limit, so a
// token held by somebody who is gone sat there and nothing noticed.
func TestAQuietHoldSendsSomebodyToInvestigate(t *testing.T) {
	q := aQuietHold(t, ImpInReview, "reviewer1")
	a := pullPast(q.roots, "main")
	if a.Pull != AnswerInvestigate {
		t.Fatalf("the queue answered %q with a hold nobody is behind: %s", a.Pull, a.Notice)
	}
}

// AND IT SAYS WHAT IS STUCK, WHO LEFT IT, AND HOW FAR BEHIND THEY ARE.
func TestAnInvestigationNamesWhoHoldsWhatAndHowFarBehind(t *testing.T) {
	q := aQuietHold(t, ImpInReview, "reviewer1")
	a := pullPast(q.roots, "main")
	for _, want := range []string{q.held.ID, q.held.Title, "reviewer1"} {
		if !strings.Contains(a.Notice, want) {
			t.Errorf("the investigation does not name %q: %s", want, a.Notice)
		}
	}
	// HOW FAR BEHIND, AS A NUMBER. Saying only that a holder is behind leaves
	// the person it woke to go and find out, and the difference between one
	// pull and thirty is the difference between reading and gone.
	//
	// THE WORD PULL IS NOT THE CHECK. Every investigation ends with Then pull
	// again, so asserting on that word passes whatever the notice says about
	// how far.
	behind, _ := HowFarBehind(q.roots, currentSession(q.roots), "reviewer1")
	if behind <= 0 {
		t.Fatalf("the fixture left the holder %d pulls behind, so this guards nothing", behind)
	}
	if !strings.Contains(a.Notice, fmt.Sprintf("%d pulls", behind)) {
		t.Fatalf("the investigation does not say how far behind, which is %d: %s", behind, a.Notice)
	}
}

// A DRAFT IN REVIEW IS THE ONE THAT REALLY SITS FOREVER. Reclaim frees a token
// in review and a token in work when a fresh actor arrives, and it does not
// cover a draft.
func TestADraftHeldByADeadReviewerIsInvestigated(t *testing.T) {
	q := aQuietHold(t, SpecInReview, "reviewer1")
	a := pullPast(q.roots, "main")
	if a.Pull != AnswerInvestigate {
		t.Fatalf("a draft held by nobody answered %q: %s", a.Pull, a.Notice)
	}
	if !strings.Contains(a.Notice, q.held.ID) {
		t.Fatalf("it does not name the draft: %s", a.Notice)
	}
}

// AND WORK HELD BY A SUB-WALKER THAT HAS GONE QUIET, by the same rule and the
// same number.
func TestWorkHeldByAQuietSubWalkerIsInvestigated(t *testing.T) {
	q := aQuietHold(t, ImpInWork, "scribe1")
	a := pullPast(q.roots, "main")
	if a.Pull != AnswerInvestigate {
		t.Fatalf("work held by a quiet sub-walker answered %q: %s", a.Pull, a.Notice)
	}
	if !strings.Contains(a.Notice, "scribe1") {
		t.Fatalf("it does not name the holder: %s", a.Notice)
	}
}

// A HOLDER IS NOT SENT TO INVESTIGATE ITSELF. That is an instruction nobody can
// act on, and a sub-walker that has gone quiet is not going to read anything.
//
// IT IS ASKED WHERE IT CAN ANSWER. Through Pull the guard is invisible: the
// puller is stamped as having pulled before quietHold ever runs, so a token the
// puller holds is never quiet and the holder comparison can never decide. A
// test that drives Pull is asking the one door the guard cannot be seen behind,
// and it stayed green with the guard deleted.
func TestAHolderIsNotSentToInvestigateItself(t *testing.T) {
	q := aQuietHold(t, ImpInWork, "scribe1")
	// Somebody else drives the queue past the staleness, so the hold is quiet
	// whoever asks about it.
	pullPast(q.roots, "main")

	// THE FIXTURE IS PROVED TO PRODUCE THE STATE before the guard is asked
	// about it, so a green cannot mean there was nothing to find.
	if _, quiet := quietHold(q.roots, "main"); !quiet {
		t.Fatal("the fixture produced no quiet hold, so this guards nothing")
	}
	if got, quiet := quietHold(q.roots, "scribe1"); quiet {
		t.Fatalf("the holder was handed its own quiet hold to investigate: %s", got.ID)
	}
}

// A HOLDER THAT IS STILL PULLING RAISES NOTHING, so a live reviewer is never
// investigated and the fix cannot pass by sending somebody everywhere.
func TestAHolderThatIsStillPullingRaisesNothing(t *testing.T) {
	q := aQuietHold(t, ImpInReview, "reviewer1")
	for i := 0; i <= TheFloor().PullsBeforeHoldIsStale*2; i++ {
		Pull(q.roots, "reviewer1", RoleReviewer, Payload{})
		if a := Pull(q.roots, "main", RoleWorker, Payload{}); a.Pull == AnswerInvestigate {
			t.Fatalf("a holder that is pulling was investigated on turn %d: %s", i, a.Notice)
		}
	}
}

// WITH NO NAMED SESSION NOTHING IS INVESTIGATED. The engine cannot tell a live
// hold from a dead one, and sending somebody to look at a hold it cannot check
// is the same mistake as refusing on one.
func TestWithNoSessionNothingIsInvestigated(t *testing.T) {
	q := aQuietHold(t, ImpInReview, "reviewer1")
	os.Remove(q.roots.Private("log") + string(os.PathSeparator) + Current)
	a := pullPast(q.roots, "main")
	if a.Pull == AnswerInvestigate {
		t.Fatalf("it investigated a hold it cannot check: %s", a.Notice)
	}
}

// A RESTART DOES NOT MAKE EVERY HOLDER QUIET. Arrivals reset and a hold lives
// on the token, so on the first pull after a restart every holder has no entry.
func TestARestartDoesNotMakeEveryHolderQuiet(t *testing.T) {
	q := aQuietHold(t, ImpInReview, "reviewer1")
	os.Remove(arrivalPath(q.roots))
	if a := Pull(q.roots, "main", RoleWorker, Payload{}); a.Pull == AnswerInvestigate {
		t.Fatalf("the first pull after a restart investigated a hold: %s", a.Notice)
	}
	// And it goes stale once the session has run.
	if a := pullPast(q.roots, "main"); a.Pull != AnswerInvestigate {
		t.Fatalf("a hold carried across a restart never went stale: %q", a.Pull)
	}
}

// RAISING IT MOVES NOTHING. The token stays where it is until somebody rules
// on it, which is what makes this an alarm rather than a timeout.
func TestInvestigatingMovesNothing(t *testing.T) {
	q := aQuietHold(t, ImpInReview, "reviewer1")
	pullPast(q.roots, "main")
	back, err := LoadToken(q.roots, q.held.ID)
	if err != nil {
		t.Fatal(err)
	}
	if back.Status != ImpInReview || back.Holder != "reviewer1" {
		t.Fatalf("the investigation moved it to %s held by %q", back.Status, back.Holder)
	}
}

// A TOKEN AN ARRIVAL HAS ALREADY FREED RAISES NOTHING, however long the old
// hold lasted. The investigation is raised against the hold as it stands.
func TestAReclaimedTokenRaisesNoInvestigation(t *testing.T) {
	q := aQuietHold(t, ImpInReview, "reviewer1")
	freed := q.held
	freed.Status, freed.Holder = ImpSubmitted, ""
	if err := SaveToken(q.roots, freed); err != nil {
		t.Fatal(err)
	}
	if a := pullPast(q.roots, "main"); a.Pull == AnswerInvestigate {
		t.Fatalf("a token nobody holds was investigated: %s", a.Notice)
	}

	// AND A HOLD WITH NO HOLDER RAISES NOTHING EITHER, which is the guard the
	// status test above cannot reach: what saves that one is Reclaim setting
	// the status to submitted, which is refused before the holder is looked at.
	still := q.held
	still.Status, still.Holder = SpecInReview, ""
	if err := SaveToken(q.roots, still); err != nil {
		t.Fatal(err)
	}
	if got, quiet := quietHold(q.roots, "main"); quiet {
		t.Fatalf("a draft nobody holds was handed out to investigate: %s", got.ID)
	}
}

// ONE NUMBER DECIDES A QUIET HOLD, and it is the one the engine already has.
// Two answers to one question would have to be reconciled by somebody at the
// moment they disagree.
func TestOneNumberDecidesAQuietHold(t *testing.T) {
	// THE PRODUCT'S OWN DECLARATION, because the claim is about what this tree
	// declares rather than about the mechanism.
	root, err := LoadTree(filepath.Join("..", ".."))
	if err != nil {
		t.Fatal(err)
	}
	seen := 0
	Walk(root, "", func(path string, n Node) {
		if strings.Contains(path, "held_before_investigating") {
			t.Errorf("a second number decides a quiet hold: %s", path)
		}
		if strings.HasSuffix(path, "pulls_before_hold_is_stale") {
			seen++
		}
	})
	if seen != 1 {
		t.Fatalf("the tree declares the staleness %d times", seen)
	}
}

// NO NOTE CARRIES A TIME, which is what lets the queue rather than a clock
// answer how long a token has been held.
func TestNoNoteCarriesATime(t *testing.T) {
	q := aQuietHold(t, ImpInReview, "reviewer1")
	pullPast(q.roots, "main")
	read := 0
	for _, dir := range []string{filepath.Join(q.roots.Work, "doc", "work"), q.roots.Private("work")} {
		entries, err := os.ReadDir(dir)
		if err != nil {
			continue
		}
		for _, e := range entries {
			if e.IsDir() || !strings.HasSuffix(e.Name(), ".md") {
				continue
			}
			b, err := os.ReadFile(filepath.Join(dir, e.Name()))
			if err != nil {
				t.Fatalf("%s cannot be read, so this guards nothing: %v", e.Name(), err)
			}
			read++
			if found := timesIn(string(b)); len(found) > 0 {
				t.Errorf("%s carries a time: %v", e.Name(), found)
			}
		}
	}
	if read == 0 {
		t.Fatal("no note was read, so this guards nothing")
	}

	// AND NEITHER DOES THE INVESTIGATION ITSELF. The notice is where a duration
	// would be written if anybody wrote one, and this file is about notes, so
	// nothing else looks at it.
	a := pullPast(q.roots, "main")
	if a.Pull != AnswerInvestigate {
		t.Fatalf("nothing was investigated, so the notice cannot be judged: %q", a.Pull)
	}
	if found := timesIn(a.Notice); len(found) > 0 {
		t.Fatalf("the investigation carries a time: %v", found)
	}
	// A colon is ordinary punctuation, so it is not on this list.
	for _, when := range []string{"minute", "second", "hour", "o clock"} {
		if strings.Contains(a.Notice, when) {
			t.Fatalf("the investigation says how long in %q: %s", when, a.Notice)
		}
	}
}

// EVERY NOTICE THE ENGINE BUILDS NAMES COMMANDS THIS ENGINE ANSWERS.
//
// COUNT FROM THE SIDE THAT PRODUCES THEM. This drove one notice, the
// investigate, so seventeen of the eighteen places the engine builds a Notice
// were never reached. The claim was true and the check was green and nothing
// marked the boundary, so the first notice to gain a command would have joined
// the record with the guard green over it.
//
// AND THE ANTI-VACUITY GUARD WAS ON THE MEMBER. Refusing a notice that names no
// command guards THAT notice going empty and says nothing about the SET being
// short, and short is the only way this claim ever goes wrong. It is on the set
// now: no builder found at all is the failure that means this has stopped
// working.
//
// WHAT ANSWERS MEANS, said as a rule rather than as a list of messages, because
// a message is a string somebody will reword. The engine answers a command when
// it exits zero, or when it exits non-zero for a reason that is not the command
// being unread.
func TestEveryCommandANoticeNamesIsAnswered(t *testing.T) {
	exe := retroExe(t)
	r := lane(t)
	said := noticeSource(t, filepath.Join("..", ".."))
	if len(said) == 0 {
		t.Fatal("no notice builder was found in src/engine, so this guards nothing")
	}
	ran := 0
	for where, one := range said {
		for _, cmd := range namedCommands(one) {
			ran++
			out, err := exec.Command(exe, append(cmd[1:], "--work", r.Work)...).CombinedOutput()
			if err == nil {
				continue
			}
			if strings.Contains(string(out), "flag provided but not defined") ||
				strings.Contains(string(out), "is moved by a pull") ||
				strings.Contains(string(out), "which nothing read") {
				t.Errorf("the notice built in %s says to run %q and the engine answers: %s",
					where, strings.Join(cmd, " "), firstLines(strings.TrimSpace(string(out)), 2))
			}
		}
	}
	if ran == 0 {
		t.Fatalf("%d notice builders name no command at all, so this guards nothing", len(said))
	}
	t.Logf("%d notice builder(s), %d command(s) run", len(said), ran)
}

// noticeSource answers the body of every function in src/engine that builds a
// notice, keyed by where it is.
//
// THE SET IS TAKEN FROM THE SOURCE AND NOT FROM A LIST. A builder added next
// month is walked because it is a builder, not because somebody remembered.
func noticeSource(t *testing.T, root string) map[string]string {
	t.Helper()
	out := map[string]string{}
	entries, err := os.ReadDir(filepath.Join(root, "src", "engine"))
	if err != nil {
		t.Fatal(err)
	}
	for _, e := range entries {
		if e.IsDir() || !strings.HasSuffix(e.Name(), ".go") || strings.HasSuffix(e.Name(), "_test.go") {
			continue
		}
		b, err := os.ReadFile(filepath.Join(root, "src", "engine", e.Name()))
		if err != nil {
			t.Fatal(err)
		}
		text := string(b)
		for _, m := range buildsANotice.FindAllStringSubmatchIndex(text, -1) {
			name := text[m[2]:m[3]]
			out[e.Name()+" "+name] = bodyFrom(text, m[1])
		}
	}
	return out
}

// A FUNCTION BUILDS A NOTICE WHEN ITS NAME SAYS SO, or when it is the one that
// answers an investigate, which is a notice by another name.
var buildsANotice = regexp.MustCompile(`(?m)^func (\w*[Nn]otice|investigate)\(`)

// bodyFrom answers the function body that opens after at.
func bodyFrom(text string, at int) string {
	open := strings.IndexByte(text[at:], '{')
	if open < 0 {
		return ""
	}
	depth, i := 0, at+open
	for ; i < len(text); i++ {
		if text[i] == '{' {
			depth++
		} else if text[i] == '}' {
			depth--
			if depth == 0 {
				break
			}
		}
	}
	return text[at+open : i]
}

// THE NOTICE AND THE RECLAIM AGREE ABOUT WHERE A HELD TOKEN GOES.
//
// TWO TABLES SAID THE SAME THING AND DISAGREED. freeAgain answered spec_open
// for a spec in review, where the reclaim sends it to spec_submitted, so the
// notice named a place the engine would not have used.
//
// ONE OWNER PER FACT. The reclaim is what moves the token, so the reclaim
// decides, and this is what says the notice has not grown a second opinion.
func TestTheNoticeAndTheReclaimAgree(t *testing.T) {
	held := 0
	for _, s := range States() {
		to, canBeHeld := whereItGoesBack[s]
		if !canBeHeld {
			continue
		}
		held++
		if said := freeAgain(Token{Status: s}); said != to {
			t.Errorf("the notice says a token at %s goes back to %s, and the reclaim sends it to %s",
				s, said, to)
		}
	}
	if held == 0 {
		t.Fatal("no state is held by anybody, so this guards nothing")
	}
}

// A COMMAND RUNS TO THE END OF THE CLAUSE, which is how a reader takes one out
// of a sentence: everything after se up to the punctuation that ends it.
var seCall = regexp.MustCompile(`\bse ([^,.;"\n]+)`)

func namedCommands(said string) [][]string {
	var out [][]string
	for _, m := range seCall.FindAllStringSubmatch(said, -1) {
		out = append(out, append([]string{"se"}, strings.Fields(m[1])...))
	}
	return out
}
