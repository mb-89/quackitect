// A hand-back carries a next line for a stranger, the record keeps it on the
// hand's entry, and the next hand-out of the ticket shows it.
// [[spec/tickets/crash-leaves-a-handover]]
package pull // level0: InPackageTest - reaches the in-package helpers cloudPull, landedOn and pulled

import (
	"strings"
	"testing"
)

// The line a hand leaves the next one. [[spec/tickets/crash-leaves-a-handover]]
const nextLine = "the lexer waits, and the parser half stands green"

// A box holding alpha at its red leaf. [[spec/tickets/crash-leaves-a-handover]]
func nextBox(t *testing.T) *It {
	t.Helper()
	it, _, _ := cloudPull(t)
	landedOn(t, it, map[string]string{"spec/tickets/alpha.md": frozenTicket, frozenFile: frozenText})
	pulled(t, it)
	return it
}

// The record of alpha as the disk holds it. [[spec/tickets/crash-leaves-a-handover]]
func alphaText(it *It) string {
	text, _ := it.Disk.Read("spec/tickets/alpha.md")
	return text
}

// A pass with --next writes the line on the entry the pass writes. [[spec/tickets/crash-leaves-a-handover]]
func TestAHandBackWritesItsNextLine(t *testing.T) {
	t.Parallel()
	it := nextBox(t)
	if code, said := pulled(t, it, "alpha", "--pass", "--fields", `{"tests":"echo assertion","red":"- `+frozenFile+`"}`, "--next", nextLine); code != 0 {
		t.Fatalf("the pass answers %d:\n%s", code, said)
	}
	if text := alphaText(it); !strings.Contains(text, "next: "+nextLine) {
		t.Fatalf("the pass entry carries no next line:\n%s", text)
	}
}

// A fail with --next writes the line on the entry the fail writes. [[spec/tickets/crash-leaves-a-handover]]
func TestAFailHandBackWritesItsNextLine(t *testing.T) {
	t.Parallel()
	it := nextBox(t)
	if code, said := pulled(t, it, "alpha", "--fail", "the fixture names no door", "--fields", `{"tests":"echo assertion","red":"- `+frozenFile+`"}`, "--next", nextLine); code != 0 {
		t.Fatalf("the fail answers %d:\n%s", code, said)
	}
	if text := alphaText(it); !strings.Contains(text, "next: "+nextLine) {
		t.Fatalf("the fail entry carries no next line:\n%s", text)
	}
}

// The hand-out the pass with --next prints, of the ticket's next leaf, shows the line under the leaf. [[spec/tickets/crash-leaves-a-handover]]
func TestTheNextHandOutShowsTheNextLine(t *testing.T) {
	t.Parallel()
	it := nextBox(t)
	code, said := pulled(t, it, "alpha", "--pass", "--fields", `{"tests":"echo assertion","red":"- `+frozenFile+`"}`, "--next", nextLine)
	if code != 0 || !strings.Contains(said, "alpha at implement/tests-green") {
		t.Fatalf("the pass answers %d with no next hand-out:\n%s", code, said)
	}
	if !strings.Contains(said, "The hand before left: "+nextLine) {
		t.Fatalf("the hand-out shows no next line:\n%s", said)
	}
}

// A gate reject with --next writes the line on the entry the gate writes. [[spec/tickets/gate-next-line-test]]
func TestAGateHandBackWritesItsNextLine(t *testing.T) {
	t.Parallel()
	it := greenBox(t)
	pulled(t, it)
	if code, said := pulled(t, it, "alpha", "--fields", `{"verdict":"reject\n- the work stands short"}`, "--next", nextLine); code != 0 {
		t.Fatalf("the reject answers %d:\n%s", code, said)
	}
	if text := alphaText(it); !strings.Contains(text, "next: "+nextLine) {
		t.Fatalf("the gate entry carries no next line:\n%s", text)
	}
}
