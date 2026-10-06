// The score verb counts the improvements a retro mints, and names each with
// its state and the retro it comes off.
// [[spec/design_input/the-agent-pulls-tickets]]
package main

import "testing"

// retro score counts every ticket a retro's group names, skips the retros themselves, and says how many stay open. [[spec/design_input/the-agent-pulls-tickets]]
func TestRetroScoreCountsOpenImprovements(t *testing.T) {
	t.Parallel()
	root := t.TempDir()
	retroMintWrite(t, root, "spec/tickets/retro-abc.md", "---\nkind: [[ticket]]\nstate: open\ngroup: retro-old\n---\n")
	retroMintWrite(t, root, "spec/tickets/fix-b.md", "---\nkind: [[ticket]]\ngroup: retro-abc\n---\n")
	retroMintWrite(t, root, "spec/tickets/fix-a.md", "---\nkind: [[ticket]]\nstate: closed\ngroup: retro-abc\n---\n")
	retroMintWrite(t, root, "spec/tickets/plain.md", "---\nkind: [[ticket]]\nstate: open\ngroup: other\n---\n")
	code, out, errs := retroMintHeard(retroScoreVerb(func() string { return root }), "retro", "score")
	want := "2 improvement(s) stand in the tree, and 1 stay open.\n  fix-a closed, off retro-abc\n  fix-b open, off retro-abc\n"
	if code != 0 || out != want {
		t.Fatalf("retro score answers %d and prints %q, %q", code, out, errs)
	}
}

// retro score scores nothing where no retro mints an improvement. [[spec/design_input/the-agent-pulls-tickets]]
func TestRetroScoreScoresNothingWhereNoRetroMints(t *testing.T) {
	t.Parallel()
	root := t.TempDir()
	code, out, _ := retroMintHeard(retroScoreVerb(func() string { return root }), "retro", "score")
	if code != 0 || out != "No retro mints an improvement yet, so this one scores nothing.\n" {
		t.Fatalf("retro score answers %d and prints %q", code, out)
	}
}
