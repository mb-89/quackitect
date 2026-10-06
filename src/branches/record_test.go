// The final record a box leaves: the session its take names, and the model,
// cost and final line its hand-back writes on the same entry.
// [[spec/tickets/boxes-write-their-final-record]]
package branches

import "testing"

// The session the harness names on a cloud box. [[spec/tickets/boxes-write-their-final-record]]
const recordSession = "cse_0fleet"

// The last record entry of a group on the disk, failing where none stands. [[spec/tickets/boxes-write-their-final-record]]
func lastEntry(one *tree, name string) func(string) string {
	one.t.Helper()
	rows := recordIn(one.read(ticketAt(name)))
	if len(rows) == 0 {
		one.t.Fatalf("%s carries no record", name)
	}
	last := rows[len(rows)-1]
	return func(key string) string { return entryField(last, key) }
}

func TestTakeWritesTheSessionOnTheClaim(t *testing.T) {
	t.Parallel()
	one := newTree(t, nil)
	one.d.Env[sessionVar] = recordSession
	one.branch("g", map[string]string{ticketAt("g"): groupNote, ticketAt("kid"): childNote})
	if code := one.branchSays("take"); code != codeOK {
		t.Fatalf("the take answers %d: %s %s", code, one.out.String(), one.errs.String())
	}
	if said := lastEntry(one, "g")("session"); said != recordSession {
		t.Fatalf("the claim names session %q", said)
	}
}

func TestDoneWritesTheModelCostAndFinalLineToTheRecord(t *testing.T) {
	t.Parallel()
	one := pcDone(t, map[string]string{
		ticketAt(pcGroup):   pcAtChildren(),
		ticketAt("a-child"): pcChild(pcGroup, "closed"),
	})
	head := one.git("rev-parse", "HEAD")
	if code := one.branchSays("done", "--model", "claude-test", "--cost", "1.25", "--final", "The group lands: every child closed."); code != codeOK {
		t.Fatalf("done answers %d: %s", code, one.pcSaid())
	}
	last := lastEntry(one, pcGroup)
	for key, want := range map[string]string{"hash_after": head, "model": "claude-test", "cost": "1.25", "final": "The group lands: every child closed."} {
		if said := last(key); said != want {
			t.Fatalf("the hand-back writes %s %q, not %q", key, said, want)
		}
	}
}

func TestReleaseWritesTheFinalLineToTheRecord(t *testing.T) {
	t.Parallel()
	one := newTree(t, nil)
	role := one.pcHand()
	one.branch(pcGroup, map[string]string{ticketAt(pcGroup): pcTake(paGroupNote, role, "a1b2c3")})
	paOn(one, pcGroup)
	if code := one.branchSays("release", "--final", "The box stops short: the check stays red."); code != codeOK {
		t.Fatalf("release answers %d: %s", code, one.pcSaid())
	}
	last := lastEntry(one, pcGroup)
	if last("hash_after") == "" || last("final") != "The box stops short: the check stays red." {
		t.Fatalf("the release writes hash_after %q and final %q", last("hash_after"), last("final"))
	}
}
