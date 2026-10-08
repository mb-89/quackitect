// The voice verb in Go over a fake disk and fake rules: the registered words,
// the measure table, a dry run, and the tree's own rules over a seeded root.
// [[spec/design_output/projection#the-second-target]]
package main // level0: InPackageTest - a main package admits no outside test package

import (
	"encoding/json"
	"errors"
	"io"
	"path/filepath"
	"reflect"
	"runtime"
	"strings"
	"testing"
	"time"

	"quackitect/src/modules/lsp"
	"quackitect/src/prose"
	"quackitect/src/rules"
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

func TestTheRulesOverVerbAnswersValesJSON(t *testing.T) {
	t.Parallel()
	var asked []string
	lint := func(path, text string) []rules.Finding {
		asked = append(asked, path, text)
		return []rules.Finding{{Check: "VoiceVale.ShoutedLead", Line: 1, Span: [2]int{1, 4}, Match: "THIS", Message: "A paragraph opens plainly.", Severity: "warning", Link: "spec/guidance/voice.md"}}
	}
	code, out, _ := runsTwin(rulesOverVerb(strings.NewReader("THIS line\n"), lint), "rules-over", "--path=spec/a.md")
	var said map[string][]rules.Finding
	if err := json.Unmarshal([]byte(out), &said); err != nil || code != 0 {
		t.Fatalf("rules answers %d, %q, and wants JSON: %v", code, out, err)
	}
	if rows := said["spec/a.md"]; len(rows) != 1 || rows[0].Check != "VoiceVale.ShoutedLead" || rows[0].Span != [2]int{1, 4} {
		t.Fatalf("rules answers %+v, and wants the one row under spec/a.md", said)
	}
	if strings.Join(asked, "|") != "spec/a.md|THIS line\n" {
		t.Fatalf("rules asks %q, and wants the path and the text on stdin", asked)
	}
	if code, _, errs := runsTwin(rulesOverVerb(strings.NewReader(""), lint), "rules-over"); code != exitUsage || !strings.Contains(errs, "--path=") {
		t.Fatalf("rules with no path answers %d, %q, and wants the usage", code, errs)
	}
}

// A rules load that fails names its own rule, past Vale's name. [[spec/tickets/vale-leaves-the-tree]]
// level0: FixtureOutsideHome - the case needs an empty root of its own, where the load fails
func TestARulesLoadThatFailsNamesRulesLoad(t *testing.T) {
	t.Parallel()
	said := lspRules(t.TempDir())("a.md", "a line\n")
	if len(said) != 1 || said[0].Rule != "RulesLoad" {
		t.Fatalf("the rules answer %+v, and want one RulesLoad row", said)
	}
}

// level0: FixtureOutsideHome - the case seeds a vehicle and a work root of its own
func TestAVehicleLendsTheRulesTheWorkRootLacks(t *testing.T) {
	t.Parallel()
	method, work := t.TempDir(), t.TempDir()
	seedsRules(t, method)
	if _, err := rulesAt(work); err == nil {
		t.Fatal("a bare work root loads rules, and wants a failed load")
	}
	if _, err := rulesUnder(work, method); err != nil {
		t.Fatalf("the work root under its vehicle loads no rules: %v", err)
	}
}

// level0: FixtureOutsideHome - the case seeds a vehicle and a work root of its own
func TestTheWorkRootsFileStandsOverTheVehicles(t *testing.T) {
	t.Parallel()
	method, work := t.TempDir(), t.TempDir()
	seedFile(t, method, "spec/a.yml", "method")
	seedFile(t, method, "spec/b.yml", "method")
	seedFile(t, work, "spec/a.yml", "work")
	read := readUnder(work, method)
	if read("spec/a.yml") != "work" || read("spec/b.yml") != "method" || read("spec/c.yml") != "" {
		t.Fatalf("reads %q, %q and %q, and wants work, method and nothing", read("spec/a.yml"), read("spec/b.yml"), read("spec/c.yml"))
	}
}

// A root with no rules answers the seam a lint that stands nowhere, with the reason. [[spec/tickets/go-rules-replace-vale]]
// level0: FixtureOutsideHome - the case needs an empty root of its own, where no rule stands
func TestTheRulesReasonReachesTheDraftsLint(t *testing.T) {
	t.Parallel()
	said := draftsLint(t.TempDir())("a draft", "level0-answer.md")
	if said.Stands || said.Ran || said.Why != "no rule stands at spec/config/styles/VoiceParagraph/Auxiliary.yml" {
		t.Errorf("draftsLint answers %+v under a root with no rules", said)
	}
}

// Copies each file rules.Load asks for off the tree into the root. [[spec/tickets/go-rules-replace-vale]]
func seedsRules(t *testing.T, root string) {
	t.Helper()
	texts := map[string]string{}
	if _, err := rules.Load(func(path string) string {
		text, _ := realDisk().read(filepath.Join("..", "..", filepath.FromSlash(path)))
		texts[path] = string(text)
		return string(text)
	}); err != nil {
		t.Fatal(err)
	}
	for path, text := range texts {
		seedFile(t, root, path, text)
	}
}

// level0: FixtureOutsideHome - the case seeds the rules into a root of its own
func TestSeededRulesAnswerAsTheTreeDoes(t *testing.T) {
	t.Parallel()
	root := t.TempDir()
	seedsRules(t, root)
	set, err := rulesAt(root)
	if err != nil {
		t.Fatal(err)
	}
	found := set.Lint(".se/tickets/a-name.md", "# Ask\n\none; two\n")
	if len(found) == 0 || found[0].Check != "VoiceParagraph.Characters" {
		t.Errorf("the seeded rules answer %+v", found)
	}
}

func TestProseKeepsWhatTheVetoesLeave(t *testing.T) {
	t.Parallel()
	set := prose.Finding{Rule: "VoiceParagraph.PastTense", Line: 1, Column: 10, Said: "set"}
	wrote := prose.Finding{Rule: "VoiceParagraph.PastTense", Line: 2, Column: 10, Said: "wrote"}
	ask, err := json.Marshal(proseAsk{Mode: prose.Past, Docs: []proseDoc{{
		Text:  "the door set the write\nthe door wrote the file\n",
		Found: []prose.Finding{set, wrote},
	}}})
	if err != nil {
		t.Fatal(err)
	}
	body, err := proseAnswer(ask, nil, prose.Caps{Sentence: 25, ListItem: 25})
	if err != nil {
		t.Fatal(err)
	}
	var got proseAnswered
	if err := json.Unmarshal(body, &got); err != nil {
		t.Fatalf("the answer %q reads as no JSON: %v", body, err)
	}
	want := proseAnswered{Docs: []proseKept{{Kept: []prose.Finding{wrote}}}}
	if !reflect.DeepEqual(got, want) {
		t.Fatalf("the answer reads %+v, and wants %+v", got, want)
	}
}

func TestTheProseSchemaNamesTheCapsAndTheLists(t *testing.T) {
	t.Parallel()
	schema := "layers:\n  sentence:\n    words:\n      max: 25\n      listItem: 20\n  vocabulary:\n    core: spec/words/core.yml\n"
	caps, paths := proseSchema([]byte(schema))
	if caps.Sentence != 25 || caps.ListItem != 20 {
		t.Fatalf("the caps read %+v, and want 25 and 20", caps)
	}
	if want := [3]string{"spec/words/core.yml", termsList, swapsList}; paths != want {
		t.Fatalf("the lists read %v, and want %v", paths, want)
	}
}

// The verb over the root with a runner that keeps every argv. The rules load off the root on the box's disk, so the files stand there too. [[spec/tickets/config-verbs-port-to-go]]
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
	code := fixVerb(func() (string, error) { return root, nil }, run, realDisk())(append([]string{"fix"}, argv...), false, &out, &errs)
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
	root := t.TempDir() // level0: FixtureOutsideHome - the fix writes the files of a root of the case's own
	seedsRules(t, root)
	seedFile(t, root, ".se/.runtime/bin/"+binNamed("biome"), "")
	seedFile(t, root, "a.md", "# Notes\n\nNOTHING AT ALL WORKS HERE, and then calm.\n")
	return root
}

// The fix swaps and calms through the Go rules, so a box with no Vale fixes. [[spec/tickets/vale-leaves-the-tree]]
func TestFixSwapsAndCalmsThroughTheRulesWithNoVale(t *testing.T) {
	t.Parallel()
	root := t.TempDir() // level0: FixtureOutsideHome - the fix writes the files of a root of the case's own
	seedsRules(t, root)
	seedFile(t, root, "a.md", "# Notes\n\nNOTHING AT ALL WORKS HERE, and we can't go.\n")
	code, out, errs, ran := fixRan(root, "a.md")
	text, _ := realDisk().read(filepath.Join(root, "a.md"))
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
	_, err = fixRound(realDisk(), root, set, []string{"a.md"}, refuse)
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
	said, _ := realDisk().read(filepath.Join(root, "a.md"))
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

// The calm calms two shouts on one line, and a carriage return survives it. [[spec/tickets/vale-leaves-the-tree]]
func TestTheCalmCalmsEachShoutAndKeepsTheLineEnds(t *testing.T) {
	t.Parallel()
	for was, want := range map[string]string{
		"AAAA BBBB CCCC, and DDDD EEEE FFFF, done\n":   "Aaaa bbbb cccc, and Dddd eeee ffff, done\n",
		"# Notes\r\n\r\nNOTHING AT ALL WORKS, yes\r\n": "# Notes\r\n\r\nNothing at all works, yes\r\n",
	} {
		shouts := []rules.Finding{shout(1, 1, "AAAA BBBB CCCC,"), shout(1, 21, "DDDD EEEE FFFF,")}
		if strings.HasPrefix(was, "#") {
			shouts = []rules.Finding{shout(3, 1, "NOTHING AT ALL WORKS,")}
		}
		if got := rules.Apply(was, calm(shouts)); got != want {
			t.Fatalf("the calm writes %q", got)
		}
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
	said, _ := realDisk().read(filepath.Join(root, "a.md"))
	if len(ran) == 0 || !strings.HasSuffix(ran[0], " .") || !strings.HasPrefix(string(said), "# Notes\n\nNothing at all") {
		t.Fatalf("fix ran %v and leaves %q, and wants the tree", ran, said)
	}
}
