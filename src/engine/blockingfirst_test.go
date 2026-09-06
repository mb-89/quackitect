package main

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

// BLOCKING WORK GOES FIRST, AND THE ENGINE WORKS OUT WHICH IT IS.
//
// The queue hands work out oldest first, and urgent is a flag a person sets. No
// open tracked token carries it, because the person who would set it is not
// watching. So the token saying the branch head does not build waits behind
// everything older, and that is the one thing stopping every other hand.
//
// WHAT THE ENGINE CAN ANSWER ON ITS OWN is whether a token would turn a red
// check green. Every done-when line names the check that decides it, and the
// last battery said which checks were red. Both are already written down, so
// the rank is read and nothing is run to find it.

// aBatterySaying writes a battery output of the shape battery.sh prints, so the
// ranking is read off the file the real run leaves behind.
func aBatterySaying(t *testing.T, r Roots, said string) {
	t.Helper()
	dir := r.Private("tests")
	if err := os.MkdirAll(dir, 0o755); err != nil {
		t.Fatal(err)
	}
	at := filepath.Join(dir, "battery-20260905-120000.out")
	if err := os.WriteFile(at, []byte(said), 0o644); err != nil {
		t.Fatal(err)
	}
}

// theGreenBattery and theRedBattery differ in one column, so what moves the
// queue is the answer and not the shape of the file.
const theGreenBattery = "go build         ok     7s  \n" +
	"se lint          ok     0s  0 failed.\n" +
	"0 failed, 12s wall clock\n"

const theRedBattery = "go build         ok     7s  \n" +
	"se lint          FAIL   0s  a token names an id nothing answers to\n" +
	"    and a second line of the same finding\n" +
	"1 failed, 12s wall clock\n"

// aBatteryLine is one answer printed the way battery.sh prints it. say() pads
// the name into a column sixteen wide, so a shorter name is followed by a run
// of spaces and a longer one by the single separator and nothing else.
func aBatteryLine(name, answer string) string {
	return fmt.Sprintf("%-16s %s\n", name, answer)
}

// aTokenDeciding is an ordinary token whose done-when line names one check.
func aTokenDeciding(t *testing.T, r Roots, id, check string) {
	t.Helper()
	tok, err := LoadToken(r, id)
	if err != nil {
		t.Fatal(err)
	}
	tok.Criteria = []Criterion{{Says: "the tree is clean, decided by: " + check}}
	if err := SaveToken(r, tok); err != nil {
		t.Fatal(err)
	}
}

func TestBlockingWorkGoesFirst(t *testing.T) {
	t.Parallel()

	t.Run("a token naming a red check goes before an older one", func(t *testing.T) {
		r := aTreeWithTheProcesses(t)
		older, newer := twoOrdinaryTokens(t, r)
		aTokenDeciding(t, r, newer.ID, "se lint")
		aBatterySaying(t, r, theRedBattery)
		got := Pull(r, "worker-1", RoleWorker, Payload{})
		if whatWasHanded(got) != newer.ID {
			t.Fatalf("the queue handed %s, wanted %s, which names the red check, before the older %s",
				whatWasHanded(got), newer.ID, older.ID)
		}
	})

	// AND IT READS WHAT WAS RECORDED. A rank that ran the check to find out
	// would run the whole battery on every pull, and the battery replaces the
	// engine that would be waiting for it.
	t.Run("the rank runs no check", func(t *testing.T) {
		r := aTreeWithTheProcesses(t)
		_, newer := twoOrdinaryTokens(t, r)
		aTokenDeciding(t, r, newer.ID, "se lint")
		aBatterySaying(t, r, theRedBattery)
		was, err := os.ReadDir(r.Private("tests"))
		if err != nil {
			t.Fatal(err)
		}
		if got := Pull(r, "worker-1", RoleWorker, Payload{}); whatWasHanded(got) != newer.ID {
			t.Fatalf("the queue handed %s, wanted %s", whatWasHanded(got), newer.ID)
		}
		now, err := os.ReadDir(r.Private("tests"))
		if err != nil {
			t.Fatal(err)
		}
		if len(now) != len(was) {
			t.Errorf("the pull left %d files where there were %d, so it ran something", len(now), len(was))
		}
		if _, err := os.Stat(batteryMarker(r)); err == nil {
			t.Error("the pull started a battery, and a rank is read rather than run")
		}
	})

	// URGENT STAYS ABOVE IT. A person says what comes first for a reason no
	// check can see, and the derived rank must not take that away.
	t.Run("urgent goes out ahead of the derived rank", func(t *testing.T) {
		r := aTreeWithTheProcesses(t)
		older, newer := twoOrdinaryTokens(t, r)
		aTokenDeciding(t, r, older.ID, "se lint")
		markUrgent(t, r, newer.ID)
		aBatterySaying(t, r, theRedBattery)
		got := Pull(r, "worker-1", RoleWorker, Payload{})
		if whatWasHanded(got) != newer.ID {
			t.Fatalf("the queue handed %s, wanted the urgent %s before %s, which names the red check",
				whatWasHanded(got), newer.ID, older.ID)
		}
	})

	// AND A GREEN TREE IS THE QUEUE IT ALWAYS WAS.
	t.Run("a tree with no red check pulls oldest first", func(t *testing.T) {
		r := aTreeWithTheProcesses(t)
		older, newer := twoOrdinaryTokens(t, r)
		aTokenDeciding(t, r, newer.ID, "se lint")
		aBatterySaying(t, r, theGreenBattery)
		got := Pull(r, "worker-1", RoleWorker, Payload{})
		if whatWasHanded(got) != older.ID {
			t.Fatalf("the queue handed %s with every check green, wanted the older %s",
				whatWasHanded(got), older.ID)
		}
	})

	// AND A CHECK WHOSE NAME FILLS THE COLUMN IS STILL SEEN.
	//
	// The name is padded into a column sixteen wide, so a longer one is followed
	// by the separator alone. Every check written as a file is longer than that,
	// the-branch-head-builds among them, which is the one this token was minted
	// for. A pattern wanting two spaces read none of them.
	t.Run("a check whose name fills the column is still seen", func(t *testing.T) {
		r := aTreeWithTheProcesses(t)
		older, newer := twoOrdinaryTokens(t, r)
		const long = "the-branch-head-builds"
		aTokenDeciding(t, r, newer.ID, long)
		aBatterySaying(t, r, aBatteryLine("go build", "ok     7s  ")+
			aBatteryLine(long, "FAIL   4s  the head does not build"))
		if red := TheRedChecks(r); len(red) != 1 || red[0] != long {
			t.Fatalf("the red checks read as %v, and %s is the one that failed", red, long)
		}
		got := Pull(r, "worker-1", RoleWorker, Payload{})
		if whatWasHanded(got) != newer.ID {
			t.Fatalf("the queue handed %s, wanted %s, which names the red %s, before the older %s",
				whatWasHanded(got), newer.ID, long, older.ID)
		}
	})
}

// AND THE COLUMN THE FIXTURE PADS TO IS THE ONE BATTERY.SH PADS TO.
//
// The cases above write their own battery output. A fixture is only worth the
// format it copies, so the width is read back out of the printer rather than
// trusted, and a battery that starts printing another shape reddens here.
func TestTheFixtureIsPaddedTheWayTheBatteryPrints(t *testing.T) {
	t.Parallel()
	at := filepath.Join("..", "..", "util", "checks", "battery.sh")
	said, err := os.ReadFile(at)
	if err != nil {
		t.Fatalf("%s cannot be read, so this guards nothing: %v", at, err)
	}
	if !strings.Contains(string(said), `printf '%-16s %s\n'`) {
		t.Fatalf("%s no longer pads a check's name into a column sixteen wide, so "+
			"aBatteryLine writes a shape no run of the battery leaves behind", at)
	}
}
