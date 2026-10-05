// The retro's collect over a tree in a temp folder. It moves the private folder
// past its dot folders into the retro's input folder, copies the transcripts,
// the memory and the scratchpads beside it, and leaves the folders behind.
// [[spec/guidance/retro/collect]]
package main

import (
	"encoding/json"
	"os"
	"path/filepath"
	"reflect"
	"regexp"
	"slices"
	"sort"
	"strings"
	"syscall"
	"testing"
	"time"
)

// The retro every case collects for, and the time the clock stands at. [[spec/guidance/retro/collect]]
const (
	retroCollectName = "retro-a1b2c3"
	retroCollectNow  = "2026-09-19T12:00:00.000Z"
	retroCollectLast = "tree:.se/.retro/retro-older/collected.json"
)

// A tree, a home and a temp folder in temp folders, with the fake trunk and the move collect runs on. [[spec/guidance/retro/collect]]
type retroCollectWorld struct {
	t                      *testing.T
	root, home, temp, slug string
	trunk                  *retroTrunk
	move                   func(from, to string) error
}

// A world seeded with the files every case starts on. [[spec/guidance/retro/collect]]
func retroNewCollectWorld(t *testing.T, trunk *retroTrunk) *retroCollectWorld {
	t.Helper()
	w := &retroCollectWorld{t: t, root: t.TempDir(), home: t.TempDir(), temp: t.TempDir(), trunk: trunk, move: os.Rename}
	w.slug = retroSlugOf(w.root)
	w.seed(retroCollectFiles(w.slug))
	return w
}

// The files every case starts on, keyed by the folder each stands under. [[spec/guidance/retro/collect]]
func retroCollectFiles(slug string) map[string]string {
	return map[string]string{
		"tree:.se/.log/one.jsonl":                                             `{"said":"a line"}` + "\n",
		"tree:.se/tickets/a-note.md":                                          "---\nkind: [[ticket]]\nstate: open\n---\n",
		"tree:.se/scripts/one.mjs":                                            "// a script a hand writes\n",
		"tree:.se/check.out":                                                  "an old output\n",
		"tree:.se/.runtime/index.db":                                          "rows",
		"tree:.se/.runtime/check.json":                                        `{"sha":"abc123","ok":true,"clean":true,"warnings":0}`,
		"tree:.se/.doc/standard.pdf":                                          "a document the owner keeps",
		"tree:scratchpad/stub/.keep":                                          "",
		"home:.claude/projects/" + slug + "/session.jsonl":                    `{"type":"user"}` + "\n",
		"home:.claude/projects/" + slug + "/session/subagents/one.jsonl":      `{"type":"assistant"}` + "\n",
		"home:.claude/projects/" + slug + "/memory/MEMORY.md":                 "- one entry\n",
		"home:.claude/projects/" + slug + "-scratchpad-stub/stub.jsonl":       `{"type":"user"}` + "\n",
		"home:.claude/projects/" + slug + "-old/theirs.jsonl":                 `{"type":"user"}` + "\n",
		"home:.claude/projects/" + slug + "--claude-worktrees-one/work.jsonl": `{"type":"user"}` + "\n",
		"home:.claude/projects/another-tree/theirs.jsonl":                     `{"type":"user"}` + "\n",
		"temp:claude/" + slug + "/session/scratchpad/probe.mjs":               "// a probe\n",
		"temp:claude/" + slug + "/session/scratchpad/stub/.git/objects/ab/cd": "an object",
	}
}

// The disk path a key names. [[spec/guidance/retro/collect]]
func (w *retroCollectWorld) at(key string) string {
	base, rest, _ := strings.Cut(key, ":")
	dirs := map[string]string{"tree": w.root, "home": w.home, "temp": w.temp}
	return filepath.Join(dirs[base], filepath.FromSlash(rest))
}

// The key of a path under the retro's input folder. [[spec/guidance/retro/collect]]
func retroInputKey(path string) string {
	return "tree:.se/.retro/" + retroCollectName + "/input/" + path
}

// Writes every file, each dated at the epoch the way the fake disk dates a seed. [[spec/guidance/retro/collect]]
func (w *retroCollectWorld) seed(files map[string]string) {
	for key, text := range files {
		w.write(key, text)
	}
}

// Writes one file dated at the epoch. [[spec/guidance/retro/collect]]
func (w *retroCollectWorld) write(key, text string) {
	w.t.Helper()
	at := w.at(key)
	if err := os.MkdirAll(filepath.Dir(at), 0o755); err != nil {
		w.t.Fatal(err)
	}
	if err := os.WriteFile(at, []byte(text), 0o644); err != nil {
		w.t.Fatal(err)
	}
	w.touch(key, "1970-01-01T00:00:00Z")
}

// Dates a file at a time. [[spec/guidance/retro/collect]]
func (w *retroCollectWorld) touch(key, when string) {
	w.t.Helper()
	if err := os.Chtimes(w.at(key), retroWhen(when), retroWhen(when)); err != nil {
		w.t.Fatal(err)
	}
}

// The text a file holds, or nothing. [[spec/guidance/retro/collect]]
func (w *retroCollectWorld) read(key string) string {
	text, _ := os.ReadFile(w.at(key))
	return string(text)
}

// Whether a file or a folder stands. [[spec/guidance/retro/collect]]
func (w *retroCollectWorld) exists(key string) bool {
	_, err := os.Stat(w.at(key))
	return err == nil
}

// When a file last changed. [[spec/guidance/retro/collect]]
func (w *retroCollectWorld) modified(key string) time.Time {
	said, err := os.Stat(w.at(key))
	if err != nil {
		return time.Time{}
	}
	return said.ModTime()
}

// Runs the verb over the world, and answers its code and everything it says, out and error interleaved. [[spec/guidance/retro/collect]]
func (w *retroCollectWorld) run(argv ...string) (int, string) {
	doors := retroCollectDoors{
		root: w.root,
		home: w.home,
		temp: w.temp,
		now:  func() time.Time { return retroWhen(retroCollectNow) },
		git:  w.trunk.run,
		move: w.move,
	}
	var said strings.Builder
	code := retroCollectVerb(func() retroCollectDoors { return doors })(argv, false, &said, &said)
	return code, said.String()
}

// Runs collect for the retro, with any more words. [[spec/guidance/retro/collect]]
func (w *retroCollectWorld) collect(more ...string) (int, string) {
	return w.run(append([]string{"retro", "collect", retroCollectName}, more...)...)
}

// The names standing under the private folder, sorted. [[spec/guidance/retro/collect]]
func (w *retroCollectWorld) standing() []string {
	entries, _ := os.ReadDir(w.at("tree:.se"))
	out := []string{}
	for _, one := range entries {
		out = append(out, one.Name())
	}
	sort.Strings(out)
	return out
}

// The rows of the manifest. [[spec/guidance/retro/collect]]
func (w *retroCollectWorld) manifest() []map[string]any {
	out := []map[string]any{}
	for _, row := range strings.Split(w.read(retroInputKey("manifest.jsonl")), "\n") {
		if row == "" {
			continue
		}
		var one map[string]any
		if json.Unmarshal([]byte(row), &one) == nil {
			out = append(out, one)
		}
	}
	return out
}

// A JSON text read as plain values, so two compare whatever their key order. [[spec/guidance/retro/collect]]
func retroJSON(text string) any {
	var said any
	if json.Unmarshal([]byte(text), &said) != nil {
		return nil
	}
	return said
}

// A retro opens on a battery green at this commit, with no warning standing. [[spec/guidance/retro/collect]]
func TestRetroCollectRefusesABatteryHoldingAWarningAndOneRanAgainstAnotherCommit(t *testing.T) {
	t.Parallel()
	for _, stamp := range []string{
		`{"sha":"abc123","ok":true,"clean":true,"warnings":3}`,
		`{"sha":"old999","ok":true,"clean":true,"warnings":0}`,
		`{"sha":"abc123","ok":true,"clean":true}`,
	} {
		w := retroNewCollectWorld(t, retroFakeTrunk())
		w.write("tree:.se/.runtime/check.json", stamp)

		code, said := w.collect()

		if code != 1 {
			t.Fatalf("%s: collect answers %d, want 1", stamp, code)
		}
		if !strings.Contains(said, "A retro opens on a green battery with no warning") {
			t.Fatalf("%s: collect says %q", stamp, said)
		}
		if !w.exists("tree:.se/.log/one.jsonl") {
			t.Fatalf("%s: nothing moves", stamp)
		}
	}
}

// A move while a hand works takes the file it reads. [[spec/guidance/retro/collect]]
func TestRetroCollectRefusesWhileAnotherHandHoldsATicketAndMovesNothing(t *testing.T) {
	t.Parallel()
	w := retroNewCollectWorld(t, retroFakeTrunk())
	w.write("tree:.se/.runtime/hold/box-one.json", `{"ticket":"a-child"}`+"\n")

	code, said := w.collect()

	if code != 1 {
		t.Fatalf("collect answers %d, want 1", code)
	}
	if !strings.Contains(said, "a hand holds a ticket") {
		t.Fatalf("collect says %q", said)
	}
	if !w.exists("tree:.se/.log/one.jsonl") {
		t.Fatal("the log stays where it stands")
	}
}

// [[spec/guidance/retro/collect]]
func TestRetroCollectPassesTheHoldOfTheRetroItCollectsFor(t *testing.T) {
	t.Parallel()
	w := retroNewCollectWorld(t, retroFakeTrunk())
	w.write("tree:.se/.runtime/hold/box-one.json", `{"ticket":"`+retroCollectName+`"}`+"\n")

	code, said := w.collect()

	if code != 0 {
		t.Fatalf("collect answers %d, want 0: %s", code, said)
	}
	if !w.exists(retroInputKey("manifest.jsonl")) {
		t.Fatal("collect writes its manifest")
	}
}

// A write the disk refuses fails the verb, as the old script threw. [[spec/guidance/retro/collect]]
func TestRetroCollectFailsAndNamesTheManifestWhereItsWriteFails(t *testing.T) {
	t.Parallel()
	w := retroNewCollectWorld(t, retroFakeTrunk())
	if err := os.MkdirAll(w.at(retroInputKey("manifest.jsonl")), 0o755); err != nil {
		t.Fatal(err)
	}

	code, said := w.collect("--again")

	if code != 1 {
		t.Fatalf("collect answers %d, want 1: %s", code, said)
	}
	if !strings.Contains(said, "retro collect fails to write "+w.at(retroInputKey("manifest.jsonl"))+": ") {
		t.Fatalf("collect says %q", said)
	}
}

// The owner rules two folders left behind, and everything else in one place. [[spec/guidance/retro/collect]]
func TestRetroCollectMovesEverythingPastTheDotFoldersAndLeavesTheRuntimeAndRetroFolders(t *testing.T) {
	t.Parallel()
	w := retroNewCollectWorld(t, retroFakeTrunk())

	code, said := w.collect()

	if code != 0 {
		t.Fatalf("collect answers %d, want 0: %s", code, said)
	}
	if got, want := w.standing(), []string{".doc", ".retro", ".runtime", "scripts"}; !reflect.DeepEqual(got, want) {
		t.Fatalf(".se holds %v, want %v", got, want)
	}
	if got := w.read(retroInputKey("log/one.jsonl")); got != `{"said":"a line"}`+"\n" {
		t.Fatalf("the log reads %q", got)
	}
	for _, path := range []string{"tickets/a-note.md", "scripts/one.mjs", "check.out"} {
		if !w.exists(retroInputKey(path)) {
			t.Fatalf("%s lands in the input", path)
		}
	}
	if w.exists("tree:.se/.log") {
		t.Fatal("a move leaves nothing where it stood")
	}
	if !w.exists("tree:.se/.runtime/index.db") {
		t.Fatal("the runtime folder stays whole")
	}
	if !w.exists("tree:.se/.doc/standard.pdf") {
		t.Fatal("a dot folder stays whole")
	}
}

// A session run from a folder inside the tree names a folder of its own. [[spec/guidance/retro/collect]]
func TestRetroCollectCopiesTheTranscriptsMemoryAndScratchpadsOfThisTreeAndNoOther(t *testing.T) {
	t.Parallel()
	w := retroNewCollectWorld(t, retroFakeTrunk())

	w.collect()

	for key, stands := range map[string]bool{
		retroInputKey("transcripts/" + w.slug + "/session.jsonl"):                    true,
		retroInputKey("transcripts/" + w.slug + "/session/subagents/one.jsonl"):      true,
		retroInputKey("transcripts/" + w.slug + "-scratchpad-stub/stub.jsonl"):       true,
		retroInputKey("memory/" + w.slug + "/MEMORY.md"):                             true,
		retroInputKey("transcripts/" + w.slug + "/memory/MEMORY.md"):                 false,
		retroInputKey("scratch/" + w.slug + "/session/scratchpad/probe.mjs"):         true,
		retroInputKey("transcripts/another-tree/theirs.jsonl"):                       false,
		retroInputKey("transcripts/" + w.slug + "-old/theirs.jsonl"):                 false,
		retroInputKey("transcripts/" + w.slug + "--claude-worktrees-one/work.jsonl"): true,
		retroInputKey("scratch/" + w.slug + "/session/scratchpad/stub/.git"):         false,
		"home:.claude/projects/" + w.slug + "/session.jsonl":                         true,
	} {
		if w.exists(key) != stands {
			t.Fatalf("%s stands %v, want %v", key, !stands, stands)
		}
	}
}

// The count by source, because a short answer reads like a whole one. [[spec/guidance/retro/collect]]
func TestRetroCollectManifestNamesEveryFileWithItsSizeAndSourceAndTheVerbPrintsTheCount(t *testing.T) {
	t.Parallel()
	w := retroNewCollectWorld(t, retroFakeTrunk())

	_, said := w.collect()

	from := map[string]any{}
	sized := map[string]bool{}
	for _, one := range w.manifest() {
		path, _ := one["path"].(string)
		from[path] = one["from"]
		_, sized[path] = one["size"].(float64)
	}
	if from["log/one.jsonl"] != ".se" || !sized["log/one.jsonl"] {
		t.Fatalf("the log row reads from %v, sized %v", from["log/one.jsonl"], sized["log/one.jsonl"])
	}
	if got := from["memory/"+w.slug+"/MEMORY.md"]; got != "memory" {
		t.Fatalf("the memory row reads from %v", got)
	}
	if !strings.Contains(said, "with no retro before it, so everything") {
		t.Fatalf("collect says %q", said)
	}
	if !regexp.MustCompile(`transcripts\s+4 file\(s\)`).MatchString(said) {
		t.Fatalf("collect counts %q", said)
	}
	record, _ := retroJSON(w.read("tree:.se/.retro/" + retroCollectName + "/collected.json")).(map[string]any)
	if record["at"] != retroCollectNow {
		t.Fatalf("the record reads %v", record)
	}
	if _, counts := record["counts"]; counts {
		t.Fatal("a count derives off the manifest")
	}
}

// [[spec/guidance/retro/effect]]
func TestRetroCollectKeepsTheBatteryReportBesideTheRecordOneARetro(t *testing.T) {
	t.Parallel()
	battery := `{"parts":{"tests":12},"total":12,"slowest":[{"name":"a case","ms":9}]}`
	w := retroNewCollectWorld(t, retroFakeTrunk())
	w.write("tree:.se/.runtime/check.json", `{"sha":"abc123","ok":true,"clean":true,"warnings":0,"battery":`+battery+`}`)

	w.collect()

	want := retroJSON(`{"parts":{"tests":12},"total":12,"slowest":[{"name":"a case","ms":9}],"runs":1}`)
	if got := retroJSON(w.read("tree:.se/.retro/" + retroCollectName + "/battery.json")); !reflect.DeepEqual(got, want) {
		t.Fatalf("a stamp from before the runs reads as one run: %v", got)
	}

	bare := retroNewCollectWorld(t, retroFakeTrunk())
	bare.collect()
	if bare.exists("tree:.se/.retro/" + retroCollectName + "/battery.json") {
		t.Fatal("a stamp carrying no report leaves none behind")
	}
}

// The last retro's collect opens the window, and the memory is standing state. [[spec/guidance/retro/collect]]
func TestRetroCollectLeavesATranscriptOlderThanTheLastCollectOutAndTakesTheMemoryWhole(t *testing.T) {
	t.Parallel()
	w := retroNewCollectWorld(t, retroFakeTrunk())
	w.write(retroCollectLast, `{"at":"2026-09-12T00:00:00.000Z"}`+"\n")
	w.write("home:.claude/projects/"+w.slug+"/old.jsonl", `{"type":"user"}`+"\n")
	w.touch("home:.claude/projects/"+w.slug+"/old.jsonl", "2026-09-10T00:00:00Z")
	w.touch("home:.claude/projects/"+w.slug+"/session.jsonl", "2026-09-15T00:00:00Z")
	w.touch("home:.claude/projects/"+w.slug+"/memory/MEMORY.md", "2026-09-10T00:00:00Z")

	_, said := w.collect()

	if !strings.Contains(said, "since 2026-09-12T00:00:00.000Z") {
		t.Fatalf("collect says %q", said)
	}
	if w.exists(retroInputKey("transcripts/" + w.slug + "/old.jsonl")) {
		t.Fatal("a transcript older than the last collect stays out")
	}
	if !w.exists(retroInputKey("transcripts/" + w.slug + "/session.jsonl")) {
		t.Fatal("a transcript past the last collect lands")
	}
	if !w.exists(retroInputKey("memory/" + w.slug + "/MEMORY.md")) {
		t.Fatal("the memory comes whole")
	}
	if !w.exists(retroCollectLast) {
		t.Fatal("an earlier retro stays")
	}
}

// A gate runs the evidence again, and a torn run deletes nothing it moved. [[spec/guidance/retro/collect]]
func TestRetroCollectSecondRunAnswersTheFirstAndATornRunCarriesOn(t *testing.T) {
	t.Parallel()
	w := retroNewCollectWorld(t, retroFakeTrunk())
	w.collect()

	code, said := w.collect()
	if code != 0 || !strings.Contains(said, "holds a whole run already") {
		t.Fatalf("a second run answers %d: %q", code, said)
	}

	if err := os.Remove(w.at(retroInputKey("manifest.jsonl"))); err != nil {
		t.Fatal(err)
	}
	w.write("tree:.se/late.md", "written after the first run\n")
	code, said = w.collect()
	if code != 0 {
		t.Fatalf("a torn run answers %d: %s", code, said)
	}
	if !w.exists(retroInputKey("log/one.jsonl")) {
		t.Fatal("what the first run moves survives")
	}
	if !w.exists(retroInputKey("late.md")) {
		t.Fatal("what stands since moves too")
	}
}

// A second pass merges what arrives since, and overwrites nothing. [[spec/guidance/retro/collect]]
func TestRetroCollectSecondPassMergesWhatArrivesSinceAndKeepsBothLogs(t *testing.T) {
	t.Parallel()
	w := retroNewCollectWorld(t, retroFakeTrunk())
	w.collect()

	w.write("tree:.se/.log/one.jsonl", `{"said":"a later line"}`+"\n")
	w.write("tree:.se/tickets/a-later-note.md", "---\nkind: [[ticket]]\n---\n")
	w.write("tree:.se/config.json", "{}\n")
	code, said := w.collect("--again")

	if code != 0 {
		t.Fatalf("a second pass answers %d: %s", code, said)
	}
	if got := w.read(retroInputKey("log/one.jsonl")); got != `{"said":"a line"}`+"\n" {
		t.Fatalf("the first log reads %q", got)
	}
	if got := w.read(retroInputKey("log/one.2.jsonl")); got != `{"said":"a later line"}`+"\n" {
		t.Fatalf("the later log reads %q", got)
	}
	for _, path := range []string{"tickets/a-note.md", "tickets/a-later-note.md", "config.json"} {
		if !w.exists(retroInputKey(path)) {
			t.Fatalf("%s lands in the input", path)
		}
	}
	if w.exists("tree:.se/config.json") {
		t.Fatal("a loose file moves")
	}
}

// A move failing on the error a disk names, the way a busy or a watched path refuses its rename. [[spec/guidance/retro/collect]]
func retroRefusingMove(refuses func(from string) bool, code syscall.Errno) func(from, to string) error {
	return func(from, to string) error {
		if refuses(filepath.ToSlash(from)) {
			return &os.LinkError{Op: "rename", Old: from, New: to, Err: code}
		}
		return os.Rename(from, to)
	}
}

// A file the disk holds takes a line of its own, and the verb names what stays. [[spec/guidance/retro/collect]]
func TestRetroCollectMoveTheDiskRefusesTakesAManifestLineAndTheVerbNamesWhatStays(t *testing.T) {
	t.Parallel()
	w := retroNewCollectWorld(t, retroFakeTrunk())
	w.move = retroRefusingMove(func(from string) bool { return strings.Contains(from, "check.out") }, syscall.EBUSY)

	code, said := w.collect()

	if code != 1 {
		t.Fatalf("collect answers %d, want 1", code)
	}
	if !strings.Contains(said, "refused .se/check.out: EBUSY") {
		t.Fatalf("collect says %q", said)
	}
	if !strings.Contains(said, ".se/check.out still stands beside the dot folders") {
		t.Fatalf("collect names no file that stays: %q", said)
	}
	if !slices.ContainsFunc(w.manifest(), func(one map[string]any) bool { return one["refused"] == "EBUSY" }) {
		t.Fatal("the manifest carries the refusal")
	}
}

// An editor watching a folder refuses its rename, and its files still move. [[spec/guidance/retro/collect]]
func TestRetroCollectFolderTheDiskRefusesToMoveWholeMovesFileByFile(t *testing.T) {
	t.Parallel()
	w := retroNewCollectWorld(t, retroFakeTrunk())
	w.write("tree:.se/tmp/ste/words.txt", "one\n")
	w.move = retroRefusingMove(func(from string) bool { return strings.HasSuffix(from, ".se/tmp") }, syscall.EPERM)

	code, said := w.collect()

	if code != 0 {
		t.Fatalf("collect answers %d, want 0: %s", code, said)
	}
	if got := w.read(retroInputKey("tmp/ste/words.txt")); got != "one\n" {
		t.Fatalf("the file moves, and reads %q", got)
	}
	if w.exists("tree:.se/tmp") {
		t.Fatal("the folder leaves nothing")
	}
	if slices.ContainsFunc(w.manifest(), func(one map[string]any) bool { return one["refused"] != nil }) {
		t.Fatal("the manifest holds no refusal")
	}
}

// A transcript line carrying a stamp. [[spec/tickets/the-retro-finishes-its-asks]]
func retroStamped(when, more string) string {
	return `{"timestamp":"` + when + `"` + more + `}`
}

// [[spec/tickets/the-retro-finishes-its-asks]]
func TestRetroCollectLeavesATranscriptLineStampedBeforeTheLastCollectOut(t *testing.T) {
	t.Parallel()
	w := retroNewCollectWorld(t, retroFakeTrunk())
	session := "home:.claude/projects/" + w.slug + "/session.jsonl"
	w.write(retroCollectLast, `{"at":"2026-09-12T00:00:00.000Z"}`+"\n")
	w.write(session, strings.Join([]string{
		retroStamped("2026-09-11T08:00:00.000Z", `,"said":"old"`),
		`{"said":"old, no stamp"}`,
		retroStamped("2026-09-13T08:00:00.000Z", `,"said":"new"`),
		`{"said":"new, no stamp"}`,
	}, "\n"))
	w.touch(session, "2026-09-13T08:00:00Z")

	w.collect()

	copied := w.read(retroInputKey("transcripts/" + w.slug + "/session.jsonl"))
	if strings.Contains(copied, `"old`) {
		t.Fatalf("an old line lands: %q", copied)
	}
	if !strings.Contains(copied, `"said":"new"`) || !strings.Contains(copied, "new, no stamp") {
		t.Fatalf("the new lines land: %q", copied)
	}
}

// [[spec/tickets/the-second-collect-keeps-lines]]
func TestRetroCollectSecondPassKeepsTheLinesTheFirstTakesAndAddsTheLinesPastIt(t *testing.T) {
	t.Parallel()
	w := retroNewCollectWorld(t, retroFakeTrunk())
	session := "home:.claude/projects/" + w.slug + "/session.jsonl"
	first := retroStamped("2026-09-19T11:00:00.000Z", `,"said":"first"`)
	w.write(session, first)
	w.collect()

	w.write(session, strings.Join([]string{first, retroStamped("2026-09-19T13:00:00.000Z", `,"said":"later"`)}, "\n"))
	w.touch(session, "2026-09-19T13:00:00Z")
	w.collect("--again")

	copied := w.read(retroInputKey("transcripts/" + w.slug + "/session.jsonl"))
	if !strings.Contains(copied, `"said":"first"`) || !strings.Contains(copied, `"said":"later"`) {
		t.Fatalf("the transcript reads %q", copied)
	}
}

// [[spec/tickets/the-retro-finishes-its-asks]]
func TestRetroCollectCopiesTheScriptsAndLeavesThemAndASecondPassCopiesWhatChanges(t *testing.T) {
	t.Parallel()
	w := retroNewCollectWorld(t, retroFakeTrunk())
	code, said := w.collect()
	if code != 0 {
		t.Fatalf("collect answers %d: %s", code, said)
	}
	if !w.exists("tree:.se/scripts/one.mjs") {
		t.Fatal("the scripts stay in place")
	}
	if !w.exists(retroInputKey("scripts/one.mjs")) {
		t.Fatal("the scripts copy into the input")
	}

	w.write("tree:.se/scripts/two.mjs", "// a later script\n")
	w.touch("tree:.se/scripts/two.mjs", "2026-09-19T13:00:00Z")
	code, said = w.collect("--again")

	if code != 0 {
		t.Fatalf("a second pass answers %d: %s", code, said)
	}
	if !w.exists("tree:.se/scripts/one.mjs") || !w.exists("tree:.se/scripts/two.mjs") {
		t.Fatal("the scripts stay in place")
	}
	if got := w.read(retroInputKey("scripts/two.mjs")); got != "// a later script\n" {
		t.Fatalf("the later script reads %q", got)
	}
	if w.exists(retroInputKey("scripts/one.2.mjs")) {
		t.Fatal("an unchanged script copies once")
	}
}
