// The Go push verb, the roads push-verb.test.js covered: a green stamp on the
// commit pushes the branch, and no stamp or a stamp on another commit pushes
// nothing.
// [[spec/tickets/landing-verbs-port-to-go]]
package main

import (
	"strings"
	"testing"
)

// A check stamp naming the sha, green and clean. [[spec/tickets/landing-verbs-port-to-go]]
func stampsGreen(t *testing.T, root, sha string) {
	t.Helper()
	lays(t, root, ".se/.runtime/check.json", `{"sha":"`+sha+`","ok":true,"clean":true,"at":"2026-01-02T03:04:05.000Z","warnings":0,"files":[]}`)
}

func TestPushVerb(t *testing.T) {
	t.Parallel()
	t.Run("a green stamp on the commit pushes the branch", func(t *testing.T) {
		at := landingRepo(t)
		lays(t, at.root, "src/a.go", "package a\n")
		at.commits("a-ticket: one more")
		stampsGreen(t, at.root, at.head())
		d, _, _ := fakeLanding(at)
		code, out, errs := runsTwin(pushVerb(d), "push")
		if code != 0 || out != "main stands pushed.\n" || at.originSubject("main") != "a-ticket: one more" {
			t.Fatalf("push answers %d, %q, %q", code, out, errs)
		}
	})
	t.Run("no stamp, or a stamp on another commit, pushes nothing", func(t *testing.T) {
		for _, stale := range []bool{false, true} {
			at := landingRepo(t)
			if stale {
				stampsGreen(t, at.root, at.head())
			}
			lays(t, at.root, "src/a.go", "package a\n")
			at.commits("a-ticket: one more")
			d, _, _ := fakeLanding(at)
			code, _, errs := runsTwin(pushVerb(d), "push")
			if code != exitFailed || at.originSubject("main") == "a-ticket: one more" {
				t.Fatalf("push answers %d, %q", code, errs)
			}
			if !strings.HasPrefix(errs, "The push takes a green check, and ") || !strings.Contains(errs, "Run `./RUNME.sh check` on the commit you stand on, then push again.") {
				t.Fatalf("push says %q", errs)
			}
		}
	})
	t.Run("a push from a repository with no origin names what git says", func(t *testing.T) {
		at := landingAlone(t)
		stampsGreen(t, at.root, at.head())
		d, _, _ := fakeLanding(at)
		code, _, errs := runsTwin(pushVerb(d), "push")
		if code != exitFailed || !strings.HasPrefix(errs, "The push of main comes back refused:\n") || len(strings.Split(strings.TrimSpace(errs), "\n")) < 2 {
			t.Fatalf("push answers %d, %q", code, errs)
		}
	})
}
