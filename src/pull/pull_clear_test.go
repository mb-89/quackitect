// The pull across a context clear: the read after the clear hands the next
// leaf in the same answer, a second handover with no commit hands the leaf
// back, and the clear's tickets hold no pull back as a todo.
// [[spec/tickets/the-clear-hands-back-the-leaf]]
package pull

import (
	"strings"
	"testing"
)

// The hand a cloud case pulls under, the mark a session past the key leaves, and the handover a box writes. [[spec/tickets/the-clear-hands-back-the-leaf]]
const (
	cloudHand    = "box cafecafecafe · claude-code-remote"
	dueText      = `{"tokens":5000,"at":1000}`
	handoverText = "# Handover\n\nbeta waits in the queue.\n"
	alphaFields  = `{"tests":"echo green","says":"It changes one thing."}`
)

// The cloud clone with a second child, beta, pushed beside alpha. [[spec/tickets/the-clear-hands-back-the-leaf]]
func twoChildren(t *testing.T) *It {
	t.Helper()
	it, _, _ := cloudPull(t)
	must(t, it.Disk.Write("spec/tickets/beta.md", childTicket))
	must(t, it.Git.AddAll())
	_, err := it.Git.Commit("beta", nil)
	must(t, err)
	if pushed := it.Git.Push("work/g", false); !pushed.OK {
		t.Fatal(pushed.Err)
	}
	return it
}

// The hold the door leaves where it answers the clear: the read in the clear's place. [[spec/tickets/the-clear-hands-back-the-leaf]]
func holdsTheRead(it *It) {
	it.writeHold(cloudHand, Hold{Ticket: readTicket, Step: readTicket, Ephemeral: true, Hand: cloudHand, Taken: it.Stamp()})
}

func pulled(t *testing.T, it *It, words ...string) (int, string) {
	t.Helper()
	out, errs := it.Out.(interface{ String() string }), it.Err.(interface{ String() string })
	before, beforeErr := len(out.String()), len(errs.String())
	code := it.Pulling(append([]string{"pull"}, words...))
	return code, out.String()[before:] + errs.String()[beforeErr:]
}

// [[spec/tickets/the-clear-hands-back-the-leaf]]
func TestAfterTheClearThePullHandsTheLeafInTheSameAnswer(t *testing.T) {
	t.Parallel()
	it := twoChildren(t)
	if code, said := pulled(t, it); code != 0 || !strings.Contains(said, "alpha at do") {
		t.Fatalf("the first pull answers %d:\n%s", code, said)
	}
	_ = it.Disk.Write(due, dueText)
	if code, said := pulled(t, it, "alpha", "--pass", "--fields", alphaFields); code != 0 || !strings.Contains(said, writeTicket+" stands in your hand.") {
		t.Fatalf("the pass past the key answers %d, and wants the handover:\n%s", code, said)
	}
	_ = it.Disk.Write(Handover, handoverText)
	if code, said := pulled(t, it, "--pass"); code != 0 || !strings.Contains(said, clearTicket+" stands in your hand.") {
		t.Fatalf("the handover's pass answers %d, and wants the clear:\n%s", code, said)
	}
	holdsTheRead(it)

	code, said := pulled(t, it, "--pass")

	if code != 0 || !strings.Contains(said, readTicket+" closes.") || !strings.Contains(said, "work  beta at do") {
		t.Fatalf("the read's pass answers %d, and wants beta's leaf in the same answer:\n%s", code, said)
	}
	if strings.Contains(said, writeTicket+" stands in your hand.") {
		t.Fatalf("the read's pass hands the handover again:\n%s", said)
	}
	if held := it.HoldOf(cloudHand); held == nil || held.Ephemeral || held.Ticket != "beta" {
		t.Fatalf("the hold after the read reads %+v, and wants beta", held)
	}
	if it.Disk.Exists(due) {
		t.Fatalf("the due mark stands after the read, so the next hand-out hands the handover again")
	}
}

// [[spec/tickets/the-clear-hands-back-the-leaf]]
func TestASecondHandoverWithNoCommitHandsTheLeafBack(t *testing.T) {
	t.Parallel()
	it, _, _ := cloudPull(t)
	_ = it.Disk.Write(due, dueText)
	_ = it.Disk.Write(handoverTip, `{"tip":"`+it.tipOf()+`"}`)
	_ = it.Disk.Write(Handover, handoverText)
	it.writeHold(cloudHand, Hold{Ticket: writeTicket, Step: writeTicket, Ephemeral: true, Hand: cloudHand, Taken: it.Stamp()})

	code, said := pulled(t, it, "--pass")

	if code != 0 || !strings.Contains(said, "No commit has landed since the last handover") || !strings.Contains(said, "work  alpha at do") {
		t.Fatalf("the second handover answers %d, and wants the refusal and alpha's leaf:\n%s", code, said)
	}
	if !strings.Contains(said, "Continue the leaf below in this turn") || strings.Contains(strings.ToLower(said), "end the turn") {
		t.Fatalf("the refusal sends the box to end its turn, and wants it on its leaf:\n%s", said)
	}
	if held := it.HoldOf(cloudHand); held == nil || held.Ephemeral || held.Ticket != "alpha" {
		t.Fatalf("the hold after the refusal reads %+v, and wants alpha", held)
	}
	if !it.Disk.Exists(due) {
		t.Fatalf("the due mark drops at the refusal, so the next commit hands over nowhere")
	}
	if text, _ := it.Disk.Read(handoverTip); !strings.Contains(text, it.tipOf()) {
		t.Fatalf("the handover tip after the refusal reads %q, and wants the tip it stood at", text)
	}
}

// [[spec/tickets/the-clear-hands-back-the-leaf]]
func TestTheClearsTicketsHoldNoPullBackAsATodo(t *testing.T) {
	t.Parallel()
	for _, name := range []string{writeTicket, clearTicket, readTicket} {
		it, _, _ := cloudPull(t)
		_ = it.Disk.Write(planFile, `{"working":"`+name+`"}`)

		code, said := pulled(t, it)

		if code != 0 || !strings.Contains(said, "work  alpha at do") {
			t.Fatalf("a plan working on %s answers %d, and wants alpha's leaf:\n%s", name, code, said)
		}
	}
}

// The clear's tickets hand back through the tool, off test/level0/tool-call.test.js. [[spec/tickets/verb-outputs-name-index-tools]]
func TestTheClearsTicketsHandBackThroughTheToolAndNameNoShellVerb(t *testing.T) {
	t.Parallel()
	it := twoChildren(t)
	pulled(t, it)
	_ = it.Disk.Write(due, dueText)
	code, said := pulled(t, it, "alpha", "--pass", "--fields", alphaFields)
	if code != 0 || !strings.Contains(said, writeTicket+" stands in your hand.") || !strings.Contains(said, `mcp__level0__index_ticket_pull with args ["--pass"]`) {
		t.Fatalf("the pass past the key answers %d, and wants the handover to hand back through the tool:\n%s", code, said)
	}
	if strings.Contains(said, "./RUNME.sh") {
		t.Fatalf("the handover's ask names a shell verb:\n%s", said)
	}
}
