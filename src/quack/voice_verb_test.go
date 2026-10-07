// The voice verb in Go over a fake disk and fake rules: the registered words,
// the measure table, a dry run, and the tree's own rules over a seeded root.
// [[spec/design_output/projection#the-second-target]]
package main // level0: InPackageTest - a main package admits no outside test package

import (
	"path/filepath"
	"reflect"
	"strings"
	"testing"
	"time"

	"quackitect/src/modules/lsp"
)

const voiceTen = "one two three four five six seven eight nine ten"

// A tree on a fake disk holding files at slash paths under its root. [[spec/design_output/projection#the-second-target]]
func voiceTree(t *testing.T, files map[string]string) (string, diskDoors) {
	t.Helper()
	root, disk := "/tree", newFakeDisk()
	hq1SeedDisk(t, disk, root, files)
	return root, disk
}

// The outside over a root on the disk, rules answering each path its rows and keeping every path they read, and a fixed clock. [[spec/tickets/vale-leaves-the-tree]]
func voiceFake(root string, disk diskDoors, rows map[string][]lsp.Finding, read *[]string) voiceOutside {
	return voiceOutside{
		root: func() (string, error) { return root, nil },
		rules: func(string) func(path, text string) []lsp.Finding {
			return func(path, _ string) []lsp.Finding {
				*read = append(*read, path)
				return rows[path]
			}
		},
		now:   func() time.Time { return time.Date(2026, 9, 12, 0, 0, 0, 0, time.UTC) },
		disk:  disk,
		count: func(string, string) int { return 0 },
	}
}

// [[spec/tickets/the-coordinator-runs-under-level0]]
func TestVoiceDoorsReadTheAnswerCeiling(t *testing.T) {
	t.Parallel()
	root, disk := voiceTree(t, nil)
	var read []string
	outside := voiceFake(root, disk, nil, &read)
	outside.count = func(at, key string) int { return map[bool]int{true: 42}[at == root && key == answerCeilingKey] }
	if got := voiceDoorsAt(root, outside).Ceiling; got != 42 {
		t.Fatalf("the voice doors hold a ceiling of %d, want 42 off answer.ceiling", got)
	}
}

func voiceRuns(one twin, dry bool, argv ...string) (int, string, string) {
	var out, errs strings.Builder
	code := one(argv, dry, &out, &errs)
	return code, out.String(), errs.String()
}

func TestVoiceVerbMeasuresARealFolder(t *testing.T) {
	t.Parallel()
	root, disk := voiceTree(t, map[string]string{
		"docs/a.md":     voiceTen + "\n",
		"docs/sub/b.md": voiceTen + " " + voiceTen,
		"docs/_skip.md": voiceTen,
		"docs/c.json":   voiceTen,
	})
	rows := map[string][]lsp.Finding{"docs/a.md": {{Rule: "LongSentence", Line: 1, Column: 1}}, "docs/sub/b.md": {{Rule: "Passive", Line: 1, Column: 1}}}
	var read []string
	code, out, errs := voiceRuns(voiceVerb(voiceFake(root, disk, rows, &read)), false, "voice", "measure", "docs")

	want := "file           words  findings  per 1000 words  top rules\n" +
		"docs/a.md         10         1           100.0  LongSentence 1\n" +
		"docs/sub/b.md     20         1            50.0  Passive 1\n" +
		"TOTAL             30         2            66.7\n" +
		"\n" +
		"rule          fires\n" +
		"LongSentence      1\n" +
		"Passive           1\n"
	if code != 0 || out != want || errs != "" {
		t.Fatalf("measure answers %d %q %q, want %q", code, out, errs, want)
	}
	if want := []string{"docs/a.md", "docs/sub/b.md"}; !reflect.DeepEqual(read, want) {
		t.Fatalf("the rules read %q, want %q", read, want)
	}
}

func TestVoiceVerbDryWritesNoAnswer(t *testing.T) {
	t.Parallel()
	row := `{"type":"assistant","message":{"content":[{"type":"text","text":"` + voiceTen + " " + voiceTen + " " + voiceTen + `"}]}}`
	root, disk := voiceTree(t, map[string]string{"logs/sess.jsonl": row})
	answer := filepath.Join(root, ".se", ".runtime", "measure", "sess", "001-answer.md")
	var read []string
	one := voiceVerb(voiceFake(root, disk, nil, &read))

	if code, out, _ := voiceRuns(one, true, "voice", "measure", "--transcripts", "logs"); code != 1 || out != "1 answer(s) under .se/.runtime/measure.\n\n" {
		t.Fatalf("a dry run with no answer standing answers %d %q", code, out)
	}
	if disk.stands(answer) {
		t.Fatal("a dry run writes no answer file")
	}
	code, out, _ := voiceRuns(one, false, "voice", "measure", "--transcripts", "logs")
	if code != 0 || !strings.Contains(out, ".se/.runtime/measure/sess/001-answer.md     30         0             0.0\n") {
		t.Fatalf("a wet run answers %d %q", code, out)
	}
	if text, err := disk.read(answer); err != nil || string(text) != voiceTen+" "+voiceTen+" "+voiceTen+"\n" {
		t.Fatalf("the answer lands as %q %v", text, err)
	}
}

// The registered verb reads the tree's own rules over a seeded root, so a box with no Vale measures. The rules load off the box's disk, so the root stands there. [[spec/tickets/vale-leaves-the-tree]]
// level0: FixtureOutsideHome - the rules load off a root of the case's own on the box's disk
func TestVoiceVerbMeasuresThroughTheTreeRules(t *testing.T) {
	t.Parallel()
	root := t.TempDir()
	seedsRules(t, root)
	seedFile(t, root, "docs/a.md", "# Notes\n\nWe can't go there today.\n")
	outside := voiceOutside{root: func() (string, error) { return root, nil }, rules: lspRules, now: wall.Now, disk: realDisk(), count: func(string, string) int { return 0 }}
	code, out, errs := voiceRuns(voiceVerb(outside), false, "voice", "measure", "docs")
	if code != 0 || errs != "" || !strings.Contains(out, "Contraction") {
		t.Fatalf("measure over the tree's rules answers %d %q %q", code, out, errs)
	}
}

func TestVoiceVerbHelpAndRefused(t *testing.T) {
	t.Parallel()
	root, disk := voiceTree(t, map[string]string{".se/.log/session.jsonl": `{"at":"2026-09-11T00:00:00.000Z","level":"warn","rule":"VoiceVale.PastTense","phrase":"bold"}`})
	var read []string
	one := voiceVerb(voiceFake(root, disk, nil, &read))
	if code, out, _ := voiceRuns(one, false, "voice"); code != 0 || !strings.HasPrefix(out, "Usage: ./RUNME.sh voice <verb>\n\n") {
		t.Fatalf("help answers %d %q", code, out)
	}
	if code, _, _ := voiceRuns(one, false, "voice", "nobody"); code != exitUsage {
		t.Fatalf("a verb nobody holds answers %d", code)
	}
	if code, out, _ := voiceRuns(one, false, "voice", "refused"); code != 0 || out != "rule       fires  phrase\nPastTense      1  bold\n" {
		t.Fatalf("refused answers %d %q", code, out)
	}
}
