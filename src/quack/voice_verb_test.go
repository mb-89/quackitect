// The voice verb in Go over a real temp tree and a fake Vale: the registered
// words, the measure table, a dry run, and the lines the JavaScript prints
// where Vale or the run falls.
// [[spec/design_output/projection#the-second-target]]
package main

import (
	"errors"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"

	"quackitect/src/proc"
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

// The outside over a temp root, a Vale path, and a run answering one text or one fault. [[spec/design_output/projection#the-second-target]]
func voiceFake(root, vale, said string, fault error, ran *[][]string) voiceOutside {
	return voiceOutside{
		root: func() (string, error) { return root, nil },
		vale: func(string) string { return vale },
		run: func(argv []string, cwd string) (string, error) {
			*ran = append(*ran, append([]string{cwd}, argv...))
			return said, fault
		},
		now: func() time.Time { return time.Date(2026, 9, 12, 0, 0, 0, 0, time.UTC) },
	}
}

// [[spec/tickets/the-coordinator-runs-under-level0]]
func TestVoiceDoorsReadTheAnswerCeiling(t *testing.T) {
	t.Parallel()
	root := voiceTree(t, map[string]string{".se/.runtime/config.json": `{"answer": {"ceiling": 42}}`})
	var ran [][]string
	if got := voiceDoorsAt(root, voiceFake(root, "", "", nil, &ran)).Ceiling; got != 42 {
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
		"docs/a.md":             voiceTen + "\n",
		"docs/sub/b.md":         voiceTen + " " + voiceTen,
		"docs/_skip.md":         voiceTen,
		"docs/c.json":           voiceTen,
		".se/.runtime/bin/vale": "",
	})
	vale := filepath.Join(root, ".se", ".runtime", "bin", "vale")
	said := `{"docs/a.md":[{"Check":"VoiceVale.LongSentence","Line":1,"Span":[1,4]}],"` + filepath.ToSlash(root) + `/docs/sub/b.md":[{"Check":"VoiceVale.Passive","Line":1}]}`
	var ran [][]string
	code, out, errs := voiceRuns(voiceVerb(voiceFake(root, vale, said, nil, &ran)), false, "voice", "measure", "docs")

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
	call := strings.Join([]string{root, vale, "--config=.vale.ini", "--output=JSON", "--no-exit", "docs"}, " ")
	if len(ran) != 1 || strings.Join(ran[0], " ") != call {
		t.Fatalf("Vale runs %q, want %q", ran, call)
	}
}

func TestVoiceVerbDryWritesNoAnswer(t *testing.T) {
	t.Parallel()
	row := `{"type":"assistant","message":{"content":[{"type":"text","text":"` + voiceTen + " " + voiceTen + " " + voiceTen + `"}]}}`
	root := voiceTree(t, map[string]string{"logs/sess.jsonl": row, ".se/.runtime/bin/vale": ""})
	vale := filepath.Join(root, ".se", ".runtime", "bin", "vale")
	answer := filepath.Join(root, ".se", ".runtime", "measure", "sess", "001-answer.md")
	var ran [][]string
	one := voiceVerb(voiceFake(root, vale, "{}", nil, &ran))

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

func TestVoiceVerbSaysSoWhereValeIsAbsentOrFalls(t *testing.T) {
	t.Parallel()
	root := voiceTree(t, map[string]string{"docs/a.md": voiceTen})
	var ran [][]string
	code, out, errs := voiceRuns(voiceVerb(voiceFake(root, "", "", nil, &ran)), false, "voice", "measure", "docs")
	if code != exitUsage || out != "" || errs != "Vale is missing. Run ./RUNME.sh once and it installs.\n" {
		t.Fatalf("no Vale answers %d %q %q", code, out, errs)
	}

	vale := filepath.Join(root, "docs", "a.md")
	code, _, errs = voiceRuns(voiceVerb(voiceFake(root, vale, "", errors.New("spawn vale EACCES"), &ran)), false, "voice", "measure", "docs")
	if code != exitFailed || errs != "Error: spawn vale EACCES\n" {
		t.Fatalf("a Vale that cannot start answers %d %q", code, errs)
	}
}

func TestVoiceVerbHelpAndRefused(t *testing.T) {
	t.Parallel()
	root := voiceTree(t, map[string]string{".se/.log/session.jsonl": `{"at":"2026-09-11T00:00:00.000Z","level":"warn","rule":"VoiceVale.PastTense","phrase":"bold"}`})
	var ran [][]string
	one := voiceVerb(voiceFake(root, "", "", nil, &ran))
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

// The Vale a case teaches the fake runner, a path standing on no box. [[spec/tickets/quack-spawns-meet-fake-process]]
const taughtVale = "/fake/vale"

func TestVoiceRunsValeKeepsTheOutputOfAFailedExit(t *testing.T) {
	t.Parallel()
	var ran []proc.Command
	fake := &proc.FakeRunner{Programs: map[string]proc.Program{taughtVale: func(one proc.Command) proc.Said {
		ran = append(ran, one)
		return proc.Said{Out: "{}\n", Err: "vale warns", Code: 3}
	}}}
	cwd := t.TempDir()
	said, err := voiceRunsValeOver(fake.Run)([]string{taughtVale, "--output=JSON"}, cwd)
	if err != nil || said != "{}\n" {
		t.Fatalf("a nonzero exit answers %q %v, and wants Vale's output", said, err)
	}
	if len(ran) != 1 || strings.Join(ran[0].Argv, " ") != taughtVale+" --output=JSON" || ran[0].Dir != cwd || ran[0].Stdin != "" {
		t.Fatalf("Vale runs %+v, and wants one run of the argv in %s", ran, cwd)
	}
}

func TestVoiceRunsValeAnswersTheFaultOfAValeThatNeverStarts(t *testing.T) {
	t.Parallel()
	fake := &proc.FakeRunner{}
	want := fake.Run(proc.Command{Argv: []string{taughtVale}}).Err
	said, err := voiceRunsValeOver(fake.Run)([]string{taughtVale}, t.TempDir())
	if err == nil || !strings.Contains(err.Error(), want) || said != "" {
		t.Fatalf("a Vale that never starts answers %q %v, and wants the fault %q", said, err, want)
	}
}

// A Vale a signal ends answers its fault, as one that never starts does. [[spec/tickets/signalled-meets-notstarted-readers]]
func TestVoiceRunsValeAnswersTheFaultOfAValeASignalEnds(t *testing.T) {
	t.Parallel()
	fake := &proc.FakeRunner{Programs: map[string]proc.Program{taughtVale: func(proc.Command) proc.Said {
		return proc.Said{Out: "{", Err: "killed", Code: proc.Signalled}
	}}}
	said, err := voiceRunsValeOver(fake.Run)([]string{taughtVale}, t.TempDir())
	if err == nil || err.Error() != "killed" || said != "" {
		t.Fatalf("a Vale a signal ends answers %q %v, and wants the fault killed", said, err)
	}
}
