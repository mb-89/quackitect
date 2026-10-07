// The commit verb lands a message whose trailer links the session, since a
// link names no model. [[spec/tickets/model-trailer-refuses-in-place]]
package main // level0: InPackageTest - reaches the unexported commitVerb and the in-package helpers landingRepo, lays, fakeLanding and runsTwin, and a main package admits no outside test package

import "testing"

// A Claude-Session trailer passes the commit verb, and the commit lands. [[spec/tickets/model-trailer-refuses-in-place]]
// level0: FixtureOutsideHome - the case commits into its own landing repository, which landingRepo builds per case.
func TestCommitVerbLandsASessionTrailer(t *testing.T) {
	t.Parallel()
	at := landingRepo(t)
	lays(t, at.root, "src/a.go", "package a\n")
	d, _, _ := fakeLanding(at)
	code, _, errs := runsTwin(commitVerb(d), "commit", opens+"\n\nClaude-Session: https://claude.ai/code/session_x")
	if code != 0 || at.subject() != opens {
		t.Fatalf("commit answers %d, %q, HEAD %q", code, errs, at.subject())
	}
}
