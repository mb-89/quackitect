// The fix verb in Go: the flags it refuses, the rounds of Vale's fixes over
// the paths with the shouted leads calmed first, and biome after them.
// [[spec/tickets/config-verbs-port-to-go]]
package main

import (
	"errors"
	"fmt"
	"io"
	"io/fs"
	"path/filepath"
	"runtime"
	"strings"
	"testing"
)

// A shouted lead Vale names at line three of a.md. [[spec/tickets/config-verbs-port-to-go]]
const shoutedRow = `{"a.md": [{"Check": "VoiceVale.ShoutedLead", "Line": 3, "Span": [1, 25], "Match": "NOTHING AT ALL WORKS HERE"}]}`

// The root the fix cases run under on the fake disk. [[spec/tickets/test-walks-move-onto-fakes]]
const fixAt = "/tree"

// The verb over the root on the disk with a runner that keeps every argv and answers Vale's JSON with the row. [[spec/tickets/config-verbs-port-to-go]]
func fixRan(disk diskDoors, argv ...string) (int, string, string, []string) {
	root := fixAt
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
	code := fixVerb(func() (string, error) { return root, nil }, run, disk)(append([]string{"fix"}, argv...), false, &out, &errs)
	return code, out.String(), errs.String(), ran
}

// The file name toolHere looks for in the runtime folder on this box. [[spec/tickets/the-verbs-run-in-go]]
func binNamed(name string) string {
	if runtime.GOOS == "windows" {
		return name + ".exe"
	}
	return name
}

// A fake disk whose root holds both tools in the runtime folder, and a.md shouting. [[spec/tickets/config-verbs-port-to-go]]
func fixRoot(t *testing.T) diskDoors {
	disk := newFakeDisk()
	hq1SeedDisk(t, disk, fixAt, map[string]string{
		".se/.runtime/bin/" + binNamed("vale"):  "",
		".se/.runtime/bin/" + binNamed("biome"): "",
		"a.md":                                  "# Notes\n\nNOTHING AT ALL WORKS HERE, and then calm.\n",
	})
	return disk
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
	if code, _, errs, _ := fixRan(newFakeDisk()); code != exitUsage || errs != "Vale is missing. Run ./RUNME.sh once and it installs.\n" {
		t.Fatalf("fix answers %d and %q, and wants the refusal", code, errs)
	}
}

func TestTheCalmNamesAFileItCannotWrite(t *testing.T) {
	t.Parallel()
	refuse := fixRoot(t)
	run := func(_ string, said, _ io.Writer, _ ...string) int {
		fmt.Fprint(said, shoutedRow)
		return 0
	}
	refuse.write = func(string, []byte, fs.FileMode) error { return errors.New("the disk refuses") }
	err := calm(fixAt, "vale", []string{"a.md"}, run, refuse)
	if err == nil || !strings.Contains(err.Error(), "a.md") || !strings.Contains(err.Error(), "the disk refuses") {
		t.Fatalf("the calm answers %v, and wants the file and the cause", err)
	}
}

func TestFixCalmsAShoutedLead(t *testing.T) {
	t.Parallel()
	disk := fixRoot(t)
	root := fixAt
	code, out, _, ran := fixRan(disk, "a.md")
	if code != 0 || out != "Run ./RUNME.sh lint to see what is left for a person.\n" {
		t.Fatalf("fix answers %d and %q", code, out)
	}
	if said := disk.text(filepath.Join(root, "a.md")); said != "# Notes\n\nNothing at all works here, and then calm.\n" {
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

func TestFixReadsTheTreeWhereNoPathStands(t *testing.T) {
	t.Parallel()
	_, _, _, ran := fixRan(fixRoot(t))
	if len(ran) == 0 || !strings.HasSuffix(ran[0], valeParked+" .") {
		t.Fatalf("fix ran %v, and wants the tree", ran)
	}
}
