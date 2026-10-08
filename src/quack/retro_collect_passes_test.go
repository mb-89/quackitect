// The retro's collect past its first pass: the window the last collect opens,
// a second pass over what it took, and a move the disk refuses.
// [[spec/guidance/retro/collect]]
package main // level0: InPackageTest - a main package admits no outside test package

import (
	"io/fs"
	"path/filepath"
	"slices"
	"strings"
	"testing"
)

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

	if err := w.disk.remove(w.at(retroInputKey("manifest.jsonl"))); err != nil {
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
func retroRefusingMove(refuses func(from string) bool, code error, move func(from, to string) error) func(from, to string) error {
	return func(from, to string) error {
		if refuses(filepath.ToSlash(from)) {
			return &fs.PathError{Op: "rename", Path: from, Err: code}
		}
		return move(from, to)
	}
}

// A file the disk holds takes a line of its own, and the verb names what stays. [[spec/guidance/retro/collect]]
func TestRetroCollectMoveTheDiskRefusesTakesAManifestLineAndTheVerbNamesWhatStays(t *testing.T) {
	t.Parallel()
	w := retroNewCollectWorld(t, retroFakeTrunk())
	w.move = retroRefusingMove(func(from string) bool { return strings.Contains(from, "check.out") }, hq2Errno(t, "EBUSY"), w.disk.rename)

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
	w.move = retroRefusingMove(func(from string) bool { return strings.HasSuffix(from, ".se/tmp") }, hq2Errno(t, "EPERM"), w.disk.rename)

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
