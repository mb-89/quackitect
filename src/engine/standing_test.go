package main

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
)

// THE STANDING LAYER IS THE RULE. THE CASE IT CAME FROM IS SERVED.
//
// Level 0 ruled that the standing layer is small and its size is budgeted. It
// has been growing by accretion instead: every lesson that reached guidance
// added a section and nothing took one out, so AGENTS.md is paid on every turn
// by every agent whatever it is doing.
//
// WHAT SPLITS. A rule is standing, because an agent has to be holding it before
// it acts. The MEASURED narrative under a rule is the evidence for it, and it is
// read at two moments and no others: when somebody is judging work, and when
// somebody is authoring a criterion. So it rides with the review and with the
// draft, which is a door the engine already has.
//
// THE SOURCES ARE ASKED FOR, NOT LISTED. util/projections.json says which files
// the standing layer is made of, so a third one added there is held to the same
// rule without anybody remembering this test.
func standingSources(t *testing.T, r Roots) []string {
	t.Helper()
	// THE ENGINE'S OWN READER, NOT A SECOND COPY OF THE SHAPE. This declared
	// its own struct with target and sources on it, so a projection that names
	// a folder rather than a list did not parse into it and the check went
	// quiet on the tree it was written to guard.
	list, err := LoadProjections(r.Method)
	if err != nil {
		t.Fatalf("the projection map cannot be read, so this guards nothing: %v", err)
	}
	seen := map[string]bool{}
	var out []string
	for _, p := range list {
		if !strings.HasSuffix(p.Target, ".md") && !strings.HasSuffix(p.Target, "quackitect.md") {
			continue
		}
		// THE SAME ANSWER THE ENGINE USES. This read p.Sources, and a
		// projection that names a folder instead of a list left it empty, so
		// the check guarded nothing while looking like it passed.
		srcs, err := sourcesOf(r.Method, p)
		if err != nil {
			t.Fatalf("%s: %v", p.Name, err)
		}
		for _, s := range srcs {
			if strings.HasPrefix(s, "doc/guidance/") && !seen[s] {
				seen[s], out = true, append(out, s)
			}
		}
	}
	if len(out) == 0 {
		t.Fatal("no guidance file is projected into the standing layer, so this guards nothing")
	}
	return out
}

// A CASE STUDY IS NOT A RULE, so it is not paid for on every turn.
func TestTheStandingLayerCarriesNoCaseStudies(t *testing.T) {
	t.Parallel()
	r := Roots{Method: filepath.Join("..", ".."), Work: filepath.Join("..", "..")}
	for _, name := range standingSources(t, r) {
		b, err := os.ReadFile(filepath.Join(r.Method, filepath.FromSlash(name)))
		if err != nil {
			t.Fatalf("%s cannot be read: %v", name, err)
		}
		for i, line := range strings.Split(string(b), "\n") {
			if strings.HasPrefix(line, "MEASURED") {
				t.Errorf("%s:%d is a case study in the standing layer, paid for on every "+
					"turn by every agent: %s", name, i+1, firstLines(line, 1))
			}
		}
	}
}
