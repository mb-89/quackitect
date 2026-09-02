package main

import (
	"encoding/json"
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
	b, err := os.ReadFile(filepath.Join(r.Method, "util", "projections.json"))
	if err != nil {
		t.Fatalf("the projection map cannot be read, so this guards nothing: %v", err)
	}
	var m struct {
		Projections []struct {
			Target  string   `json:"target"`
			Sources []string `json:"sources"`
		} `json:"projections"`
	}
	if err := json.Unmarshal(b, &m); err != nil {
		t.Fatal(err)
	}
	seen := map[string]bool{}
	var out []string
	for _, p := range m.Projections {
		if !strings.HasSuffix(p.Target, ".md") && !strings.HasSuffix(p.Target, "quackitect.md") {
			continue
		}
		for _, s := range p.Sources {
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
