// The fix verb in Go: the flags it refuses, the rounds of the Go rules' swaps
// and calms over the paths, and biome after them.
// [[spec/tickets/config-verbs-port-to-go]] [[spec/tickets/vale-leaves-the-tree]]
package main

import (
	"errors"
	"io"
	"os"
	"path/filepath"
	"runtime"
	"strings"
	"testing"

	"quackitect/src/rules"
)

// The verb over the root with a runner that keeps every argv. [[spec/tickets/config-verbs-port-to-go]]
func fixRan(root string, argv ...string) (int, string, string, []string) {
	var out, errs strings.Builder
	var ran []string
	run := func(dir string, _, _ io.Writer, words ...string) int {
		ran = append(ran, strings.Join(words, " "))
		if dir != root {
			panic("the runner runs outside the root")
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

// A root holding the tree's rules and biome in the runtime folder, and a.md shouting. [[spec/tickets/config-verbs-port-to-go]]
func fixRoot(t *testing.T) string {
	root := t.TempDir()
	seedsRules(t, root)
	seedFile(t, root, ".se/.runtime/bin/"+binNamed("biome"), "")
	seedFile(t, root, "a.md", "# Notes\n\nNOTHING AT ALL WORKS HERE, and then calm.\n")
	return root
}

// The fix swaps and calms through the Go rules, so a box with no Vale fixes. [[spec/tickets/vale-leaves-the-tree]]
func TestFixSwapsAndCalmsThroughTheRulesWithNoVale(t *testing.T) {
	t.Parallel()
	root := t.TempDir()
	seedsRules(t, root)
	seedFile(t, root, "a.md", "# Notes\n\nNOTHING AT ALL WORKS HERE, and we can't go.\n")
	code, out, errs, ran := fixRan(root, "a.md")
	text, _ := os.ReadFile(filepath.Join(root, "a.md"))
	if code != 0 || string(text) != "# Notes\n\nNothing at all works here, and we cannot go.\n" {
		t.Fatalf("fix answers %d, %q, %q, and leaves %q", code, out, errs, text)
	}
	for _, one := range ran {
		if strings.Contains(one, "vale") {
			t.Fatalf("fix runs %q", one)
		}
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

func TestTheFixNamesAFileItCannotWrite(t *testing.T) {
	t.Parallel()
	root := fixRoot(t)
	set, err := rulesAt(root)
	if err != nil {
		t.Fatal(err)
	}
	refuse := func(string, []byte) error { return errors.New("the disk refuses") }
	_, err = fixRound(root, set, []string{"a.md"}, refuse)
	if err == nil || !strings.Contains(err.Error(), "a.md") || !strings.Contains(err.Error(), "the disk refuses") {
		t.Fatalf("the fix answers %v, and wants the file and the cause", err)
	}
}

func TestFixCalmsAShoutedLeadThenRunsBiome(t *testing.T) {
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
	biome := filepath.Join(root, ".se", ".runtime", "bin", binNamed("biome"))
	if want := biome + " check --write --config-path=spec/config a.md"; strings.Join(ran, "\n") != want {
		t.Fatalf("fix ran %q, and wants biome alone: %q", ran, want)
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

// A shouted lead row as the rules answer it. [[spec/tickets/vale-leaves-the-tree]]
func shout(line, from int, match string) rules.Finding {
	return rules.Finding{Check: "VoiceVale." + shoutedLead, Line: line, Span: [2]int{from, from + len([]rune(match)) - 1}, Match: match}
}

func TestTheCalmLeavesAStaleSpanAlone(t *testing.T) {
	t.Parallel()
	was := "# Notes\n\nSomething else entirely.\n"
	if got := rules.Apply(was, calm([]rules.Finding{shout(3, 1, "NOTHING AT ALL,")})); got != was {
		t.Fatalf("the calm writes %q over a stale span", got)
	}
}

func TestTheCalmCalmsTwoShoutsOnOneLine(t *testing.T) {
	t.Parallel()
	got := rules.Apply("AAAA BBBB CCCC, and DDDD EEEE FFFF, done\n", calm([]rules.Finding{shout(1, 1, "AAAA BBBB CCCC,"), shout(1, 21, "DDDD EEEE FFFF,")}))
	if got != "Aaaa bbbb cccc, and Dddd eeee ffff, done\n" {
		t.Fatalf("the calm writes %q", got)
	}
}

func TestACarriageReturnSurvivesTheCalm(t *testing.T) {
	t.Parallel()
	got := rules.Apply("# Notes\r\n\r\nNOTHING AT ALL WORKS, yes\r\n", calm([]rules.Finding{shout(3, 1, "NOTHING AT ALL WORKS,")}))
	if got != "# Notes\r\n\r\nNothing at all works, yes\r\n" {
		t.Fatalf("the calm writes %q", got)
	}
}

func TestTheCalmReadsShoutedLeadRowsAlone(t *testing.T) {
	t.Parallel()
	other := rules.Finding{Check: "VoiceParagraph.Passive", Line: 1, Span: [2]int{1, 4}, Match: "WENT"}
	if got := calm([]rules.Finding{other, shout(1, 1, "")}); len(got) != 0 {
		t.Fatalf("the calm swaps %+v", got)
	}
}

func TestFixReadsTheTreeWhereNoPathStands(t *testing.T) {
	t.Parallel()
	root := fixRoot(t)
	_, _, _, ran := fixRan(root)
	said, _ := os.ReadFile(filepath.Join(root, "a.md"))
	if len(ran) == 0 || !strings.HasSuffix(ran[0], " .") || !strings.HasPrefix(string(said), "# Notes\n\nNothing at all") {
		t.Fatalf("fix ran %v and leaves %q, and wants the tree", ran, said)
	}
}
