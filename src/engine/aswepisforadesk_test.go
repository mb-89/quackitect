package main

import (
	"strings"
	"testing"
)

// A CLOUD BOX DOES NOT SWEEP.
//
// The sweep collects what has closed and puts it in the archive, for the retro.
// That belongs where a person sits and the disk outlives the session.
//
// MEASURED, September 2026, on a cloud box. A sweep took 153 notes off the disk
// and wrote their rows. The rows were then reverted by a hand that judged the
// rewrite too broad, and nothing said there were deletions to revert as well.
// The tokens were left named by nothing: off the disk, on the branch, in no row.
// The branch kept them only because nobody landed the deletions.
//
// THE OWNER RULED: refuse it here. The environment already says which box this
// is, and the engine reads it as TheHost.
func TestASweepIsRefusedOnACloudBox(t *testing.T) {
	r := aTreeWithTheProcesses(t)
	aHostTable(t, r)
	t.Setenv("CLAUDE_CODE_REMOTE", "true")

	why, refused := theSweepIsNotForACloudBox(r.Method)
	if !refused {
		t.Fatal("a cloud box was allowed to sweep")
	}

	// A REFUSAL NAMES A LEGAL MOVE, so the hand reads what to do instead.
	if !strings.Contains(why, "desk") {
		t.Errorf("the refusal does not say where to run it: %q", why)
	}
}

// AND A DESK SWEEPS AS IT ALWAYS DID. Refusing everywhere would take the retro
// away to fix one box.
func TestASweepRunsOnADesk(t *testing.T) {
	r := aTreeWithTheProcesses(t)
	aHostTable(t, r)
	for _, v := range []string{"CLAUDE_CODE_REMOTE", "GITHUB_ACTIONS", "SE_CLOUD"} {
		t.Setenv(v, "")
	}

	if why, refused := theSweepIsNotForACloudBox(r.Method); refused {
		t.Fatalf("a desk was refused the sweep: %s", why)
	}
}
