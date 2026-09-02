package main

import (
	"encoding/json"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

func guidanceTree(t *testing.T) Roots {
	t.Helper()
	method, work := t.TempDir(), t.TempDir()
	os.MkdirAll(filepath.Join(method, "doc", "guidance"), 0o755)
	os.WriteFile(filepath.Join(method, "doc", "guidance", "voice.md"), []byte("# Voice\n\nAnswer first.\n"), 0o644)
	os.WriteFile(filepath.Join(method, "doc", "guidance", "behaviour.md"), []byte("# Behaviour\n\nDo what was asked.\n"), 0o644)
	// The methods that ride on an answer. The fixture declares its own, so a
	// test reads the mechanism rather than the product's wording.
	os.WriteFile(filepath.Join(method, "doc", "guidance", "reviewing.md"),
		[]byte("# Reviewing\n\nVerify, do not read.\n"), 0o644)
	os.WriteFile(filepath.Join(method, "doc", "guidance", "work-token.md"),
		[]byte("# Work token\n\nA criterion that can be a command is one.\n"), 0o644)
	// What is projected where is data. The test declares its own, so it tests
	// the mechanism rather than the product's list.
	os.MkdirAll(filepath.Join(method, "util"), 0o755)
	os.WriteFile(filepath.Join(method, "util", "projections.json"), []byte(`{"projections":[
	  {"name":"protocol","target":"AGENTS.md","sources":["doc/guidance/voice.md","doc/guidance/behaviour.md"],"wrap":"markdown"},
	  {"name":"copilot","target":".github/copilot-instructions.md","sources":["doc/guidance/voice.md","doc/guidance/behaviour.md"],"wrap":"markdown"},
	  {"name":"style","target":".claude/output-styles/quackitect.md","sources":["doc/guidance/voice.md","doc/guidance/behaviour.md"],"wrap":"frontmatter","frontmatter":{"name":"quackitect"}}
	]}`), 0o644)
	// The icon table. The fixture declares its own for the same reason it
	// declares its own tree: the mechanism is the thing under test.
	os.WriteFile(filepath.Join(method, "util", "icons.json"), []byte(`{
	  "$comment": "the fixture's own",
	  "power": {"glyph": "⏻", "at": "U+23FB"},
	  "hand": {"glyph": "✋", "at": "U+270B"}
	}`), 0o644)
	// One tree. The fixture declares its own, so the tests exercise the
	// mechanism rather than the product's list.
	os.WriteFile(filepath.Join(method, "util", "parameters.json"), []byte(`{
	  "name":"quackitect","type":"group","children":[
	    {"name":"limits","type":"group","shown":true,"children":[
	      {"name":"heartbeat_seconds","type":"int","default":5,"min":1,"max":60,"narrow":"smaller"},
	      {"name":"ready_budget_ms","type":"int","default":15000,"min":1000,"max":15000,"narrow":"smaller"}]},
	    {"name":"guards","type":"group","shown":true,"children":[
	      {"name":"guard_projections","type":"bool","default":true,"narrow":"on"},
	      {"name":"stop_needs_claim","type":"bool","default":true,"narrow":"on"}]}]}`), 0o644)
	// The rules the guard checks against are data, so the fixture carries a
	// copy of the ones the product ships.
	if b, err := os.ReadFile(filepath.Join("..", "..", "util", "voice-rules.json")); err == nil {
		os.WriteFile(filepath.Join(method, "util", "voice-rules.json"), b, 0o644)
	}
	return Roots{Method: method, Work: work}
}

// UC-31. A changed original re-projects. Refreshing needs no installer.
func TestAChangedOriginalIsProjectedAgain(t *testing.T) {
	t.Parallel()
	r := guidanceTree(t)
	if _, err := Project(r); err != nil {
		t.Fatal(err)
	}
	out := filepath.Join(r.Work, "AGENTS.md")
	b, _ := os.ReadFile(out)
	if !strings.Contains(string(b), "Answer first.") {
		t.Fatal("the projection does not hold what was authored")
	}

	// Writing again with nothing changed writes nothing. A projection that is
	// rewritten for no reason wakes everything that reads it.
	written, _ := Project(r)
	if len(written) != 0 {
		t.Fatalf("nothing changed and it wrote %v", written)
	}

	os.WriteFile(filepath.Join(r.Method, "doc", "guidance", "voice.md"), []byte("# Voice\n\nAnswer last.\n"), 0o644)
	written, _ = Project(r)
	if len(written) != 3 {
		t.Fatalf("a changed original should write every projection, got %v", written)
	}
	b, _ = os.ReadFile(out)
	if !strings.Contains(string(b), "Answer last.") {
		t.Fatal("the projection did not follow the original")
	}
}

// Every projection says it is one, in the first line, in the comment syntax
// of its own format.
func TestEveryProjectionSaysItIsGenerated(t *testing.T) {
	t.Parallel()
	r := guidanceTree(t)
	if _, err := Project(r); err != nil {
		t.Fatal(err)
	}
	for _, p := range []string{
		"AGENTS.md",
		filepath.Join(".github", "copilot-instructions.md"),
		filepath.Join(".claude", "output-styles", "quackitect.md"),
	} {
		b, err := os.ReadFile(filepath.Join(r.Work, p))
		if err != nil {
			t.Fatalf("%s was not written: %v", p, err)
		}
		if !strings.Contains(string(b), generatedMark) {
			t.Fatalf("%s does not say it is generated", p)
		}
	}
}

// The guard needs to recognise one. This is the one refusal with no override,
// so it must not depend on how the path was spelled.
func TestAProjectionIsRecognised(t *testing.T) {
	t.Parallel()
	r := guidanceTree(t)
	Project(r)
	yes, instead := IsProjection(r, filepath.Join(r.Work, "AGENTS.md"))
	if !yes {
		t.Fatal("a projection was not recognised")
	}
	if !strings.HasSuffix(instead, "voice.md") {
		t.Fatalf("the refusal must name where to write instead, got %q", instead)
	}
	if no, _ := IsProjection(r, filepath.Join(r.Work, "notes.md")); no {
		t.Fatal("an ordinary file was called a projection")
	}
}

// The digest is what tells a change from a rewrite. Same content, same
// digest, whatever the modification time says.
func TestTheDigestFollowsContentNotTime(t *testing.T) {
	t.Parallel()
	r := guidanceTree(t)
	first, err := GuidanceDigest(r.Method)
	if err != nil {
		t.Fatal(err)
	}
	os.WriteFile(filepath.Join(r.Method, "doc", "guidance", "voice.md"), []byte("# Voice\n\nAnswer first.\n"), 0o644)
	same, _ := GuidanceDigest(r.Method)
	if same != first {
		t.Fatal("rewriting the same content changed the digest")
	}
	os.WriteFile(filepath.Join(r.Method, "doc", "guidance", "voice.md"), []byte("# Voice\n\nsomething else\n"), 0o644)
	other, _ := GuidanceDigest(r.Method)
	if other == first {
		t.Fatal("changed content did not change the digest")
	}
}

// A RULE THAT REACHES A WORKER REACHES EVERY FILE A WORKER READS.
//
// The evidence for this was a sentence: the section appears once in each of
// the three projections, counted. The number was right and the scope was hand
// drawn. Declare a fourth projection from the same source and the claim stays
// true of its three while the fourth goes without the rule.
//
// So the scope comes from the data. Every projection that lists the guidance
// as a source has to carry what the guidance says.
func TestEveryProjectionOfAGuidanceCarriesIt(t *testing.T) {
	t.Parallel()
	r := guidanceTree(t)
	source := filepath.Join("doc", "guidance", "behaviour.md")

	// A rule the fixture's own guidance carries, so this tests the mechanism
	// rather than the product's wording.
	const rule = "Do what was asked."
	os.WriteFile(filepath.Join(r.Method, source), []byte("# Behaviour\n\n"+rule+"\n"), 0o644)
	if _, err := Project(r); err != nil {
		t.Fatal(err)
	}

	targets := projectionsFrom(t, r, filepath.ToSlash(source))
	// A CHECK THAT FINDS NOTHING TO CHECK REFUSES.
	if len(targets) == 0 {
		t.Fatalf("nothing is projected from %s, so this guards nothing", source)
	}
	for _, target := range targets {
		b, err := os.ReadFile(filepath.Join(r.Work, target))
		if err != nil {
			t.Errorf("%s is projected from %s and cannot be read: %v", target, source, err)
			continue
		}
		if !strings.Contains(string(b), rule) {
			t.Errorf("%s is projected from %s and does not carry what it says", target, source)
		}
	}
}

// projectionsFrom answers every target whose sources include this file.
func projectionsFrom(t *testing.T, r Roots, source string) []string {
	t.Helper()
	b, err := os.ReadFile(filepath.Join(r.Method, "util", "projections.json"))
	if err != nil {
		t.Fatal(err)
	}
	var declared struct {
		Projections []struct {
			Target  string   `json:"target"`
			Sources []string `json:"sources"`
		} `json:"projections"`
	}
	if err := json.Unmarshal(b, &declared); err != nil {
		t.Fatal(err)
	}
	var out []string
	for _, p := range declared.Projections {
		for _, s := range p.Sources {
			if s == source {
				out = append(out, p.Target)
			}
		}
	}
	return out
}

// A projection that names a section carries that chapter from each source and
// nothing else, and a source without the chapter is refused by name.
func TestAProjectionWithASectionCarriesOnlyThatChapter(t *testing.T) {
	t.Parallel()
	r := guidanceTree(t)
	guidance := filepath.Join(r.Method, "doc", "guidance")
	os.WriteFile(filepath.Join(guidance, "voice.md"),
		[]byte("# Voice\n\n## Motivation\n\nWhy.\n\n## Actionables\n\n- Answer first.\n\n## Discussion\n\nAt length.\n"), 0o644)
	os.WriteFile(filepath.Join(guidance, "behaviour.md"),
		[]byte("# Behaviour\n\n## Motivation\n\nWhy.\n\n## Actionables\n\n- Do what was asked.\n\n## Discussion\n\nAt length.\n"), 0o644)
	os.WriteFile(filepath.Join(r.Method, "util", "projections.json"), []byte(`{"projections":[
	  {"name":"protocol","target":"AGENTS.md","sources":["doc/guidance/voice.md","doc/guidance/behaviour.md"],"wrap":"markdown","section":"Actionables"}
	]}`), 0o644)
	if _, err := Project(r); err != nil {
		t.Fatal(err)
	}
	b, err := os.ReadFile(filepath.Join(r.Work, "AGENTS.md"))
	if err != nil {
		t.Fatal(err)
	}
	got := string(b)
	for _, want := range []string{"## Actionables\n\n- Answer first.\n", "## Actionables\n\n- Do what was asked.\n"} {
		if !strings.Contains(got, want) {
			t.Fatalf("the projection lacks %q:\n%s", want, got)
		}
	}
	for _, stray := range []string{"Motivation", "Discussion", "Why.", "At length."} {
		if strings.Contains(got, stray) {
			t.Fatalf("the projection carries %q, which is outside the section:\n%s", stray, got)
		}
	}
	os.WriteFile(filepath.Join(guidance, "behaviour.md"), []byte("# Behaviour\n\nNo chapters here.\n"), 0o644)
	if _, err := Project(r); err == nil || !strings.Contains(err.Error(), "behaviour.md") {
		t.Fatalf("a source without the section was not refused by name: %v", err)
	}
}
