// The fix verb in Go: the flags it refuses, the rounds of Vale's fixes over
// the paths with the shouted leads calmed first, and biome after them.
// [[spec/tickets/config-verbs-port-to-go]]
package main

import (
	"errors"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"runtime"
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

// The file name toolHere looks for in the runtime folder on this box. [[spec/tickets/the-verbs-run-in-go]]
func binNamed(name string) string {
	if runtime.GOOS == "windows" {
		return name + ".exe"
	}
	return name
}

// A root with both tools standing in the runtime folder, and a.md shouting. [[spec/tickets/config-verbs-port-to-go]]
func fixRoot(t *testing.T) string {
	root := t.TempDir()
	seedFile(t, root, ".se/.runtime/bin/"+binNamed("vale"), "")
	seedFile(t, root, ".se/.runtime/bin/"+binNamed("biome"), "")
	seedFile(t, root, "a.md", "# Notes\n\nNOTHING AT ALL WORKS HERE, and then calm.\n")
	return root
}

// The fix verb's Vale walk parks the types the engine lays inside the plugin, as the lint's walk does. [[spec/tickets/level0-hooks-move-to-typescript]]
func TestFixParksTheLaidTypes(t *testing.T) {
	if !strings.Contains(valeParked, ".claude/skills/level0/.claude-plugin/types,") {
		t.Fatalf("the fix verb's walk reads %s, and parks no laid types", valeParked)
	}
}

func TestFixRefusesAnUnknownFlag(t *testing.T) {
	t.Parallel()
	code, _, errs, ran := fixRan(fixRoot(t), "--apply-everything", "src")
	if code != exitUsage || errs != "fix knows no flag --apply-everything. Usage: ./RUNME.sh fix [path ...], over the paths or the tree.\n" || len(ran) != 0 {
		t.Fatalf("fix answers %d and %q and ran %v, and wants the refusal with nothing run", code, errs, ran)
	}
}

func TestFixPrintsItsUsage(t *testing.T) {
	t.Parallel()
	if code, out, _, ran := fixRan(fixRoot(t), "--help"); code != 0 || out != "Usage: ./RUNME.sh fix [path ...], over the paths or the tree.\n" || len(ran) != 0 {
		t.Fatalf("fix --help answers %d and %q and ran %v", code, out, ran)
	}
}

func TestFixRefusesWhereNoValeStands(t *testing.T) {
	t.Parallel()
	root := t.TempDir()
	if code, _, errs, _ := fixRan(root); code != exitUsage || errs != "Vale is missing. Run ./RUNME.sh once and it installs.\n" {
		t.Fatalf("fix answers %d and %q, and wants the refusal", code, errs)
	}
}

func TestTheCalmNamesAFileItCannotWrite(t *testing.T) {
	t.Parallel()
	root := fixRoot(t)
	run := func(_ string, said, _ io.Writer, _ ...string) int {
		fmt.Fprint(said, shoutedRow)
		return 0
	}
	refuse := func(string, []byte) error { return errors.New("the disk refuses") }
	err := calm(root, "vale", []string{"a.md"}, run, refuse)
	if err == nil || !strings.Contains(err.Error(), "a.md") || !strings.Contains(err.Error(), "the disk refuses") {
		t.Fatalf("the calm answers %v, and wants the file and the cause", err)
	}
}

func TestFixCalmsAShoutedLead(t *testing.T) {
	t.Parallel()
	root := fixRoot(t)
	code, out, _, ran := fixRan(root, "a.md")
	if code != 0 || out != "Run ./RUNME.sh lint to see what is left for a person.\n" {
		t.Fatalf("fix answers %d and %q", code, out)
	}
	said, _ := os.ReadFile(filepath.Join(root, "a.md"))
	if string(said) != "# Notes\n\nNothing at all works here, and then calm.\n" {
		t.Fatalf("a.md reads %q, and wants the lead calmed", said)
	}
	vale, biome := filepath.Join(root, ".se", ".runtime", "bin", binNamed("vale")), filepath.Join(root, ".se", ".runtime", "bin", binNamed("biome"))
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

func TestSentenceCaseKeepsWhatStandsBeforeTheFirstLetter(t *testing.T) {
	t.Parallel()
	for said, want := range map[string]string{
		"NOTHING AT ALL, yes": "Nothing at all, yes",
		"  SHOUTING HERE":     "  Shouting here",
		"1984 WAS LOUD":       "1984 Was loud",
		"....":                "....",
		"":                    "",
	} {
		if got := sentenceCase(said); got != want {
			t.Fatalf("sentenceCase(%q) answers %q, and wants %q", said, got, want)
		}
	}
}

func TestTheCalmLeavesAStaleSpanAlone(t *testing.T) {
	t.Parallel()
	was := "# Notes\n\nSomething else entirely.\n"
	if got := calmed(was, []valeRow{{Line: 3, Span: []int{1, 15}, Match: "NOTHING AT ALL,"}}); got != was {
		t.Fatalf("the calm writes %q over a stale span", got)
	}
}

func TestTheCalmCalmsTwoShoutsOnOneLine(t *testing.T) {
	t.Parallel()
	got := calmed("AAAA BBBB CCCC, and DDDD EEEE FFFF, done\n", []valeRow{
		{Line: 1, Span: []int{1, 15}, Match: "AAAA BBBB CCCC,"},
		{Line: 1, Span: []int{21, 35}, Match: "DDDD EEEE FFFF,"},
	})
	if got != "Aaaa bbbb cccc, and Dddd eeee ffff, done\n" {
		t.Fatalf("the calm writes %q", got)
	}
}

func TestACarriageReturnSurvivesTheCalm(t *testing.T) {
	t.Parallel()
	got := calmed("# Notes\r\n\r\nNOTHING AT ALL WORKS, yes\r\n", []valeRow{{Line: 3, Span: []int{1, 21}, Match: "NOTHING AT ALL WORKS,"}})
	if got != "# Notes\r\n\r\nNothing at all works, yes\r\n" {
		t.Fatalf("the calm writes %q", got)
	}
}

// Real Vale names the shout, and the calm writes it in sentence case; a box with no Vale skips it. [[spec/design_output/doors#one-contract-test-per-door]]
func TestTheCalmCalmsTheShoutRealValeNames(t *testing.T) {
	t.Parallel()
	root, _ := filepath.Abs(filepath.Join("..", ".."))
	vale := toolHere(root, "vale")
	if vale == "" {
		t.Skip("no vale stands on this box")
	}
	for shouted, want := range map[string]string{
		"NOTHING AT ALL WORKS HERE, and then calm.": "Nothing at all works here, and then calm.",
		"DON'T STOP AT ALL HERE, and then calm.":    "Don't stop at all here, and then calm.",
	} {
		at := filepath.Join(t.TempDir(), "it.md")
		if err := os.WriteFile(at, []byte("# Notes\n\n"+shouted+"\n"), 0o644); err != nil {
			t.Fatal(err)
		}
		if err := calm(root, vale, []string{at}, toolRuns, writeCalmed); err != nil {
			t.Fatal(err)
		}
		if got, _ := os.ReadFile(at); string(got) != "# Notes\n\n"+want+"\n" {
			t.Fatalf("the calm over real Vale writes %q, and wants %q", got, want)
		}
	}
}

func TestFixReadsTheTreeWhereNoPathStands(t *testing.T) {
	t.Parallel()
	_, _, _, ran := fixRan(fixRoot(t))
	if len(ran) == 0 || !strings.HasSuffix(ran[0], valeParked+" .") {
		t.Fatalf("fix ran %v, and wants the tree", ran)
	}
}
