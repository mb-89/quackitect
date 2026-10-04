// The fix verb in Go: the flags it refuses, the rounds of Vale's fixes over
// the paths with the shouted leads calmed first, and biome after them.
// [[spec/tickets/config-verbs-port-to-go]]
package main

import (
	"fmt"
	"io"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

// A shouted lead Vale names at line three of a.md. [[spec/tickets/config-verbs-port-to-go]]
const shoutedRow = `{"a.md": [{"Check": "VoiceVale.ShoutedLead", "Line": 3, "Span": [1, 25], "Match": "NOTHING AT ALL WORKS HERE"}]}`

// The verb over the root with a runner that keeps every argv and answers Vale's JSON with the row. [[spec/tickets/config-verbs-port-to-go]]
func fixRan(root string, argv ...string) (int, string, string, []string) {
	var out, errs strings.Builder
	var ran []string
	run := func(dir string, said, _ io.Writer, words ...string) int {
		ran = append(ran, strings.Join(words, " "))
		if dir != root {
			panic("the runner runs outside the root")
		}
		if strings.Contains(strings.Join(words, " "), "--output=JSON") {
			fmt.Fprint(said, shoutedRow)
		}
		return 0
	}
	code := fixVerb(func() (string, error) { return root, nil }, run)(append([]string{"fix"}, argv...), false, &out, &errs)
	return code, out.String(), errs.String(), ran
}

// A root with both tools standing in the runtime folder, and a.md shouting. [[spec/tickets/config-verbs-port-to-go]]
func fixRoot(t *testing.T) string {
	root := t.TempDir()
	seedFile(t, root, ".se/.runtime/bin/vale", "")
	seedFile(t, root, ".se/.runtime/bin/biome", "")
	seedFile(t, root, "a.md", "# Notes\n\nNOTHING AT ALL WORKS HERE, and then calm.\n")
	return root
}

func TestFixRefusesAnUnknownFlag(t *testing.T) {
	code, _, errs, ran := fixRan(fixRoot(t), "--apply-everything", "src")
	if code != exitUsage || errs != "fix knows no flag --apply-everything. Usage: ./RUNME.sh fix [path ...], over the paths or the tree.\n" || len(ran) != 0 {
		t.Fatalf("fix answers %d and %q and ran %v, and wants the refusal with nothing run", code, errs, ran)
	}
}

func TestFixPrintsItsUsage(t *testing.T) {
	if code, out, _, ran := fixRan(fixRoot(t), "--help"); code != 0 || out != "Usage: ./RUNME.sh fix [path ...], over the paths or the tree.\n" || len(ran) != 0 {
		t.Fatalf("fix --help answers %d and %q and ran %v", code, out, ran)
	}
}

func TestFixRefusesWhereNoValeStands(t *testing.T) {
	root := t.TempDir()
	if code, _, errs, _ := fixRan(root); code != exitUsage || errs != "Vale is missing. Run ./RUNME.sh once and it installs.\n" {
		t.Fatalf("fix answers %d and %q, and wants the refusal", code, errs)
	}
}

func TestFixCalmsAShoutedLead(t *testing.T) {
	root := fixRoot(t)
	code, out, _, ran := fixRan(root, "a.md")
	if code != 0 || out != "Run ./RUNME.sh lint to see what is left for a person.\n" {
		t.Fatalf("fix answers %d and %q", code, out)
	}
	said, _ := os.ReadFile(filepath.Join(root, "a.md"))
	if string(said) != "# Notes\n\nNothing at all works here, and then calm.\n" {
		t.Fatalf("a.md reads %q, and wants the lead calmed", said)
	}
	vale, biome := filepath.Join(root, ".se", ".runtime", "bin", "vale"), filepath.Join(root, ".se", ".runtime", "bin", "biome")
	want := []string{
		vale + " --config=.vale.ini --output=JSON --no-exit " + valeParked + " a.md",
		vale + " fix --apply --config=.vale.ini " + valeParked + " a.md",
		vale + " --config=.vale.ini --output=JSON --no-exit " + valeParked + " a.md",
		vale + " fix --apply --config=.vale.ini " + valeParked + " a.md",
		biome + " check --write --config-path=spec/config a.md",
	}
	if strings.Join(ran, "\n") != strings.Join(want, "\n") {
		t.Fatalf("fix ran\n%s\nand wants two rounds, then biome:\n%s", strings.Join(ran, "\n"), strings.Join(want, "\n"))
	}
}

func TestFixReadsTheTreeWhereNoPathStands(t *testing.T) {
	_, _, _, ran := fixRan(fixRoot(t))
	if len(ran) == 0 || !strings.HasSuffix(ran[0], valeParked+" .") {
		t.Fatalf("fix ran %v, and wants the tree", ran)
	}
}
