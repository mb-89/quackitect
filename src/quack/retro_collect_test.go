// The retro's collect over a tree in a temp folder. It moves the private folder
// past its dot folders into the retro's input folder, copies the transcripts,
// the memory and the scratchpads beside it, and leaves the folders behind.
// [[spec/guidance/retro/collect]]
package main // level0: InPackageTest - a main package admits no outside test package

import (
	"encoding/json"
	"path/filepath"
	"reflect"
	"regexp"
	"sort"
	"strings"
	"testing"
	"testing/fstest"
	"time"
)

// A fake disk as the hand a verb takes, and the disk itself, whose files a case dates. [[spec/tickets/test-walks-move-onto-fakes]]
func hq2FakeDisk() (diskDoors, *fakeDisk) {
	f := &fakeDisk{files: fstest.MapFS{}}
	return diskDoors{read: f.read, write: f.write, stat: f.stat, list: f.list, makeAll: f.makeAll, remove: f.remove, removeAll: f.removeAll, rename: f.rename, appendTo: f.appendTo, readlink: f.readlink, symlink: f.symlink, makeTemp: f.makeTemp}, f
}

// The error code a disk names, as diskCodes reads it. [[spec/tickets/test-walks-move-onto-fakes]]
func hq2Errno(t *testing.T, name string) error {
	t.Helper()
	for code, said := range diskCodes {
		if said == name {
			return code
		}
	}
	t.Fatalf("diskCodes names no %s", name)
	return nil
}

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
	disk                   diskDoors
	fake                   *fakeDisk
}

// A world seeded with the files every case starts on. [[spec/guidance/retro/collect]]
func retroNewCollectWorld(t *testing.T, trunk *retroTrunk) *retroCollectWorld {
	t.Helper()
	disk, fake := hq2FakeDisk()
	w := &retroCollectWorld{t: t, root: "/work/tree", home: "/work/home", temp: "/work/temp", trunk: trunk, move: disk.rename, disk: disk, fake: fake}
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
	hq2Seed(w.t, w.disk, w.at(key), text)
	w.touch(key, "1970-01-01T00:00:00Z")
}

// Dates a file at a time. [[spec/guidance/retro/collect]]
func (w *retroCollectWorld) touch(key, when string) {
	w.t.Helper()
	w.fake.mu.Lock()
	defer w.fake.mu.Unlock()
	held, ok := w.fake.files[fakeKey(w.at(key))]
	if !ok {
		w.t.Fatalf("%s stands nowhere to date", key)
	}
	held.ModTime = retroWhen(when)
}

// The text a file holds, or nothing. [[spec/guidance/retro/collect]]
func (w *retroCollectWorld) read(key string) string {
	text, _ := w.disk.read(w.at(key))
	return string(text)
}

// Whether a file or a folder stands. [[spec/guidance/retro/collect]]
func (w *retroCollectWorld) exists(key string) bool {
	_, err := w.disk.stat(w.at(key))
	return err == nil
}

// When a file last changed. [[spec/guidance/retro/collect]]
func (w *retroCollectWorld) modified(key string) time.Time {
	said, err := w.disk.stat(w.at(key))
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
		disk: w.disk,
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
	entries, _ := w.disk.list(w.at("tree:.se"))
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
	if err := w.disk.makeAll(w.at(retroInputKey("manifest.jsonl")), 0o755); err != nil {
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
