// The voice verb in Go over a real temp tree and fake rules: the registered
// words, the measure table, a dry run, and the tree's own rules over a file.
// [[spec/design_output/projection#the-second-target]]
package main

import (
	"os"
	"path/filepath"
	"reflect"
	"strings"
	"testing"
	"time"

	"quackitect/src/modules/lsp"
)

const voiceTen = "one two three four five six seven eight nine ten"

// A temp tree holding files at slash paths under it. [[spec/design_output/projection#the-second-target]]
func voiceTree(t *testing.T, files map[string]string) string {
	t.Helper()
	root := t.TempDir()
	for path, text := range files {
		at := filepath.Join(root, filepath.FromSlash(path))
		if err := os.MkdirAll(filepath.Dir(at), 0o755); err != nil {
			t.Fatal(err)
		}
		if err := os.WriteFile(at, []byte(text), 0o644); err != nil {
			t.Fatal(err)
		}
	}
	return root
}

// The outside over a temp root, rules answering each path its rows and keeping every path they read, and a fixed clock. [[spec/tickets/vale-leaves-the-tree]]
func voiceFake(root string, rows map[string][]lsp.Finding, read *[]string) voiceOutside {
	return voiceOutside{
		root: func() (string, error) { return root, nil },
		rules: func(string) func(path, text string) []lsp.Finding {
			return func(path, _ string) []lsp.Finding {
				*read = append(*read, path)
				return rows[path]
			}
		},
		now: func() time.Time { return time.Date(2026, 9, 12, 0, 0, 0, 0, time.UTC) },
	}
}

// [[spec/tickets/the-coordinator-runs-under-level0]]
func TestVoiceDoorsReadTheAnswerCeiling(t *testing.T) {
	t.Parallel()
	root := voiceTree(t, map[string]string{".se/.runtime/config.json": `{"answer": {"ceiling": 42}}`})
	var read []string
	if got := voiceDoorsAt(root, voiceFake(root, nil, &read)).Ceiling; got != 42 {
		t.Fatalf("the voice doors hold a ceiling of %d, want 42 off answer.ceiling", got)
	}
}

func voiceRuns(one twin, dry bool, argv ...string) (int, string, string) {
	var out, errs strings.Builder
	code := one(argv, dry, &out, &errs)
	return code, out.String(), errs.String()
}

func TestVoiceRegistersUnderItsWord(t *testing.T) {
	t.Parallel()
	if registry["voice"] == nil {
		t.Fatal("voice registers no Go twin")
	}
	if key, _ := twinOf([]string{"voice", "measure", "spec"}, registry); key != "voice" {
		t.Fatalf("voice measure spec reaches %q", key)
	}
}

func TestVoiceVerbMeasuresARealFolder(t *testing.T) {
	t.Parallel()
	root := voiceTree(t, map[string]string{
		"docs/a.md":     voiceTen + "\n",
		"docs/sub/b.md": voiceTen + " " + voiceTen,
		"docs/_skip.md": voiceTen,
		"docs/c.json":   voiceTen,
	})
	rows := map[string][]lsp.Finding{"docs/a.md": {{Rule: "LongSentence", Line: 1, Column: 1}}, "docs/sub/b.md": {{Rule: "Passive", Line: 1, Column: 1}}}
	var read []string
	code, out, errs := voiceRuns(voiceVerb(voiceFake(root, rows, &read)), false, "voice", "measure", "docs")

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
	root := voiceTree(t, map[string]string{"logs/sess.jsonl": row})
	answer := filepath.Join(root, ".se", ".runtime", "measure", "sess", "001-answer.md")
	var read []string
	one := voiceVerb(voiceFake(root, nil, &read))

	if code, out, _ := voiceRuns(one, true, "voice", "measure", "--transcripts", "logs"); code != 1 || out != "1 answer(s) under .se/.runtime/measure.\n\n" {
		t.Fatalf("a dry run with no answer standing answers %d %q", code, out)
	}
	if _, err := os.Stat(answer); err == nil {
		t.Fatal("a dry run writes no answer file")
	}
	code, out, _ := voiceRuns(one, false, "voice", "measure", "--transcripts", "logs")
	if code != 0 || !strings.Contains(out, ".se/.runtime/measure/sess/001-answer.md     30         0             0.0\n") {
		t.Fatalf("a wet run answers %d %q", code, out)
	}
	if text, err := os.ReadFile(answer); err != nil || string(text) != voiceTen+" "+voiceTen+" "+voiceTen+"\n" {
		t.Fatalf("the answer lands as %q %v", text, err)
	}
}

// The registered verb reads the tree's own rules over a seeded root, so a box with no Vale measures. [[spec/tickets/vale-leaves-the-tree]]
func TestVoiceVerbMeasuresThroughTheTreeRules(t *testing.T) {
	t.Parallel()
	root := voiceTree(t, map[string]string{"docs/a.md": "# Notes\n\nWe can't go there today.\n"})
	seedsRules(t, root)
	code, out, errs := voiceRuns(voiceVerb(voiceOutside{root: func() (string, error) { return root, nil }, rules: lspRules, now: time.Now}), false, "voice", "measure", "docs")
	if code != 0 || errs != "" || !strings.Contains(out, "Contraction") {
		t.Fatalf("measure over the tree's rules answers %d %q %q", code, out, errs)
	}
}

func TestVoiceVerbHelpAndRefused(t *testing.T) {
	t.Parallel()
	root := voiceTree(t, map[string]string{".se/.log/session.jsonl": `{"at":"2026-09-11T00:00:00.000Z","level":"warn","rule":"VoiceVale.PastTense","phrase":"bold"}`})
	var read []string
	one := voiceVerb(voiceFake(root, nil, &read))
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
