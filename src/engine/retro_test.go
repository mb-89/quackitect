package main

import (
	"encoding/json"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"testing"
)

// THE VERB IS DRIVEN THROUGH THE BINARY AND NOT THROUGH A FUNCTION.
//
// A Go test passes against a package that registers no verb at all: the
// function is there, the dispatch is not, and nothing on a person's screen
// works. So this builds the program and runs it the way a person does.
func retroExe(t *testing.T) string {
	t.Helper()
	return theEngine(t)
}

func runRetroExe(t *testing.T, exe string, r Roots, args ...string) (Collected, string, error) {
	t.Helper()
	// The verb runs in the engine over the folder, so one lives here.
	aLiveEngine(t, r)
	out, err := exec.Command(exe, append([]string{"retro", "--work", r.Work}, args...)...).CombinedOutput()
	var got Collected
	json.Unmarshal(out, &got)
	return got, string(out), err
}

func TestRetroIsAVerbOfTheProgram(t *testing.T) {
	t.Parallel()
	exe := retroExe(t)
	out, err := exec.Command(exe, "retro", "--help").CombinedOutput()
	if err != nil {
		t.Fatalf("se retro --help: %v\n%s", err, out)
	}
	if !strings.Contains(string(out), "se retro -") {
		t.Fatalf("the program does not answer for retro:\n%s", out)
	}
	// AND IT IS IN THE ONE LIST THE DISPATCH READS, so a second list written by
	// hand cannot disagree with it.
	found := false
	for _, v := range Verbs() {
		if v == "retro" {
			found = true
		}
	}
	if !found {
		t.Fatalf("retro is not among the verbs: %v", Verbs())
	}
}

// IT COLLECTS AND IT DRAINS, and the sources hold nothing afterwards that it
// took.
func TestARetroCollectsAndDrains(t *testing.T) {
	t.Parallel()
	r := aWorkedTree(t)
	got, said, err := runRetroExe(t, retroExe(t), r)
	if err != nil {
		t.Fatalf("se retro: %v\n%s", err, said)
	}
	if got.Folder == "" {
		t.Fatalf("it did not say where it put them: %s", said)
	}
	if got.Logs != 3 {
		t.Fatalf("it took %d logs and the tree had two old ones and a running one", got.Logs)
	}
	if got.Scripts != 2 {
		t.Fatalf("it took %d things from the scratchpad and the tree had two", got.Scripts)
	}
	// AND THE FOLDER HOLDS THEM.
	if kept, _ := os.ReadDir(filepath.Join(got.Folder, "log")); len(kept) != 3 {
		t.Errorf("the retro's log folder holds %d", len(kept))
	}
	if kept, _ := os.ReadDir(filepath.Join(got.Folder, "scratchpad")); len(kept) != 2 {
		t.Errorf("the retro's scratchpad holds %d", len(kept))
	}
}

// THE LOG IS ROTATED FIRST, so the session that was running is in the retro
// rather than left behind for the next one.
func TestARetroTakesTheRunningSessionToo(t *testing.T) {
	t.Parallel()
	r := aWorkedTree(t)
	got, said, err := runRetroExe(t, retroExe(t), r)
	if err != nil {
		t.Fatalf("se retro: %v\n%s", err, said)
	}
	found := false
	entries, _ := os.ReadDir(filepath.Join(got.Folder, "log"))
	for _, e := range entries {
		b, _ := os.ReadFile(filepath.Join(got.Folder, "log", e.Name()))
		if strings.Contains(string(b), "running") {
			found = true
		}
	}
	if !found {
		t.Fatal("the session that was running was left behind")
	}
	if _, err := os.Stat(filepath.Join(r.Private("log"), Current)); err == nil {
		t.Fatal("the running log is still where it was")
	}
}

// RUNNING IT TWICE MAKES TWO FOLDERS AND THE SECOND TAKES NOTHING THE FIRST
// TOOK. That is what draining is for.
func TestASecondRetroTakesNothingTwice(t *testing.T) {
	t.Parallel()
	r := aWorkedTree(t)
	exe := retroExe(t)
	first, said, err := runRetroExe(t, exe, r)
	if err != nil {
		t.Fatalf("se retro: %v\n%s", err, said)
	}
	second, said, err := runRetroExe(t, exe, r)
	if err != nil {
		t.Fatalf("the second se retro: %v\n%s", err, said)
	}
	if first.Folder == second.Folder {
		t.Fatalf("both retros wrote to %s", first.Folder)
	}
	if second.Logs != 0 || second.Scripts != 0 {
		t.Fatalf("the second retro took %d log(s) and %d script(s) the first had taken",
			second.Logs, second.Scripts)
	}
}

// IT SAYS WHICH HARNESS IT FOUND AND WHICH IT LOOKED FOR AND DID NOT.
//
// A command silent about what it missed reads as one that found everything.
func TestARetroSaysWhichTranscriptsItFound(t *testing.T) {
	t.Parallel()
	r := aWorkedTree(t)
	here := filepath.Join(t.TempDir(), "a-session.jsonl")
	if err := os.WriteFile(here, []byte(`{"said":"hello"}`+nl), 0o644); err != nil {
		t.Fatal(err)
	}
	got, err := Retro(t.Context(), r, "main", []Transcript{
		{Name: "claude", Path: here, Who: "the session the guard was last handed"},
		{Name: "copilot", Who: "this machine says nothing about where it keeps one"},
	})
	if err != nil {
		t.Fatal(err)
	}
	if len(got.Transcript) != 1 {
		t.Fatalf("it copied %d transcript(s)", len(got.Transcript))
	}
	if len(got.Missing) != 1 || !strings.Contains(got.Missing[0], "copilot") {
		t.Fatalf("it says nothing about the harness it did not find: %v", got.Missing)
	}
	// A COPY, NOT A DRAIN. The transcript is another program's file and one of
	// them is being appended to while this runs.
	if _, err := os.Stat(here); err != nil {
		t.Fatalf("the transcript was taken rather than copied: %v", err)
	}
	b, err := os.ReadFile(got.Transcript[0])
	if err != nil || !strings.Contains(string(b), "hello") {
		t.Fatalf("the copy is not the transcript: %v", err)
	}
}

// ONE MANIFEST SAYS WHAT EVERY THING BECAME: taken, kept and why, or looked
// for and missing. The counts an index carried are derivable from it, and the
// instruction that was in the index belongs to the retro method.
func TestARetroWritesAManifest(t *testing.T) {
	t.Parallel()
	r := aWorkedTree(t)
	here := filepath.Join(t.TempDir(), "a-session.jsonl")
	if err := os.WriteFile(here, []byte(`{"said":"hello"}`+nl), 0o644); err != nil {
		t.Fatal(err)
	}
	got, err := Retro(t.Context(), r, "main", []Transcript{
		{Name: "claude", Path: here, Who: "the session the guard was last handed"},
		{Name: "copilot", Who: "this machine says nothing about where it keeps one"},
	})
	if err != nil {
		t.Fatal(err)
	}
	b, err := os.ReadFile(filepath.Join(got.Folder, "manifest.jsonl"))
	if err != nil {
		t.Fatalf("the retro wrote no manifest: %v", err)
	}
	type line struct {
		Name   string `json:"name"`
		Origin string `json:"origin"`
		Fate   string `json:"fate"`
		Why    string `json:"why"`
	}
	var lines []line
	for _, raw := range strings.Split(strings.TrimSpace(string(b)), "\n") {
		var l line
		if err := json.Unmarshal([]byte(raw), &l); err != nil {
			t.Fatalf("a manifest line will not read: %v: %q", err, raw)
		}
		if l.Name == "" || l.Origin == "" || l.Fate == "" {
			t.Fatalf("a line misses name, origin or fate: %q", raw)
		}
		lines = append(lines, l)
	}
	// THE COUNTS ARE DERIVABLE, which is what lets them go from the page.
	logs, pad, missing := 0, 0, 0
	for _, l := range lines {
		if l.Origin == ".se/log" && l.Fate == "taken" {
			logs++
		}
		if l.Origin == ".se/scratchpad" && l.Fate == "taken" {
			pad++
		}
		if l.Name == "copilot" && l.Fate == "looked for and missing" {
			missing++
		}
	}
	if logs != 3 || pad != 2 || missing != 1 {
		t.Fatalf("the manifest derives %d log(s), %d scratchpad thing(s) and %d missing, "+
			"want 3, 2 and 1:\n%s", logs, pad, missing, b)
	}
	// THE INDEX IS REPLACED, NOT ACCOMPANIED.
	if _, err := os.Stat(filepath.Join(got.Folder, "index.md")); err == nil {
		t.Fatal("index.md is still written beside the manifest")
	}
}

// IT WRITES NOTHING OUTSIDE THE FOLDER BEING WORKED ON, AND DELETES NOTHING
// OUTSIDE IT EITHER.
func TestARetroStaysInsideTheWorkFolder(t *testing.T) {
	t.Parallel()
	r := aWorkedTree(t)
	outside := t.TempDir()
	witness := filepath.Join(outside, "not-yours.txt")
	if err := os.WriteFile(witness, []byte("mine"+nl), 0o644); err != nil {
		t.Fatal(err)
	}
	before := treeOf(t, outside)
	if _, err := Retro(t.Context(), r, "main", []Transcript{{Name: "claude", Path: witness}}); err != nil {
		t.Fatal(err)
	}
	if after := treeOf(t, outside); after != before {
		t.Fatalf("something outside the work folder changed:\nbefore %s\nafter  %s", before, after)
	}
}

// treeOf answers every path below a folder with its size, so a file taken, a
// file added or a file truncated all show as a difference.
func treeOf(t *testing.T, dir string) string {
	t.Helper()
	var out []string
	filepath.WalkDir(dir, func(p string, d os.DirEntry, err error) error {
		if err != nil {
			return nil
		}
		info, err := d.Info()
		if err != nil {
			return nil
		}
		out = append(out, fmt.Sprintf("%s:%d", p, info.Size()))
		return nil
	})
	return strings.Join(out, "|")
}

// THE CHECKS ARE NOT IN THE FOLDER THE RETRO DRAINS.
//
// A retro cannot take the thing that judges the next one. That is settled by
// where they live rather than by a keep list, because a keep list goes stale
// the first time somebody adds a check without reading this token.
//
// AND A KEEP LIST IS WORSE THAN IT LOOKS HERE. battery.sh once skipped a check
// it could not find and went on answering all ok, so a drained check turned a
// red run into a shorter green one. It fails on absence now, and this keeps
// absence from happening at all.
func TestARetroLeavesTheChecksAlone(t *testing.T) {
	t.Parallel()
	root := filepath.Join("..", "..")
	checks := filepath.Join(root, "util", "checks")
	entries, err := os.ReadDir(checks)
	if err != nil {
		t.Fatalf("util/checks cannot be read, so this guards nothing: %v", err)
	}
	if len(entries) == 0 {
		t.Fatal("util/checks is empty, so this guards nothing")
	}
	// IT IS OUTSIDE WHAT THE RETRO TOUCHES, and the retro's own idea of what it
	// touches is what this asks rather than a path written out here.
	r := Roots{Method: root, Work: root}
	for _, swept := range []string{r.Private("scratchpad"), r.Private("log")} {
		rel, err := filepath.Rel(swept, checks)
		if err != nil {
			continue
		}
		if !strings.HasPrefix(rel, "..") {
			t.Errorf("util/checks is inside %s, which a retro drains", swept)
		}
	}
	// AND A RETRO OVER A TREE THAT HAS BOTH LEAVES THE CHECKS WHERE THEY ARE.
	lab := aWorkedTree(t)
	mine := filepath.Join(lab.Work, "util", "checks")
	if err := os.MkdirAll(mine, 0o755); err != nil {
		t.Fatal(err)
	}
	kept := filepath.Join(mine, "battery.sh")
	if err := os.WriteFile(kept, []byte("go test"+nl), 0o644); err != nil {
		t.Fatal(err)
	}
	if _, err := Retro(t.Context(), lab, "main", nil); err != nil {
		t.Fatal(err)
	}
	b, err := os.ReadFile(kept)
	if err != nil {
		t.Fatalf("the retro took the checks: %v", err)
	}
	if !strings.Contains(string(b), "go test") {
		t.Fatalf("the checks folder holds %q afterwards", b)
	}
}

// AFTER A RETRO THE BATTERY IS STILL WHOLE, STATED AS A NUMBER.
//
// THE SURVIVING DIRECTION, and it is the one every other criterion pushes
// against. A criterion phrased as the source is empty is satisfied best by
// deleting more, so one of them has to say what must still be there.
//
// A NUMBER RATHER THAN A FILE BEING PRESENT, because the failure this guards
// against is a battery that shrinks rather than one that disappears.
func TestTheBatteryIsWholeAfterARetro(t *testing.T) {
	t.Parallel()
	root := filepath.Join("..", "..")
	checks := filepath.Join(root, "util", "checks")
	before, err := os.ReadDir(checks)
	if err != nil || len(before) == 0 {
		t.Fatalf("util/checks holds nothing to count, so this guards nothing: %v", err)
	}
	// The battery names what it runs, so the count is read from it rather than
	// from the folder, which would count a file nothing runs.
	b, err := os.ReadFile(filepath.Join(checks, "battery.sh"))
	if err != nil {
		t.Fatalf("the battery cannot be read: %v", err)
	}
	ran := strings.Count(string(b), "run \"")
	if ran == 0 {
		t.Fatal("the battery names nothing it runs, so this guards nothing")
	}
	// A RETRO IN A TREE OF ITS OWN, so this counts rather than sweeping the
	// project it is checking.
	lab := aWorkedTree(t)
	mine := filepath.Join(lab.Work, "util", "checks")
	if err := os.MkdirAll(mine, 0o755); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(filepath.Join(mine, "battery.sh"), b, 0o644); err != nil {
		t.Fatal(err)
	}
	if _, err := Retro(t.Context(), lab, "main", nil); err != nil {
		t.Fatal(err)
	}
	after, err := os.ReadFile(filepath.Join(mine, "battery.sh"))
	if err != nil {
		t.Fatalf("the battery is gone after a retro: %v", err)
	}
	if got := strings.Count(string(after), "run \""); got != ran {
		t.Fatalf("the battery ran %d checks before the retro and names %d after", ran, got)
	}
}

// IT DRAINS WHAT IS INSIDE THE FOLDER BEING WORKED ON. The sources hold nothing
// afterwards that the retro took, so the next retro starts empty and nothing is
// counted twice.
//
// THAT IS THE OWNER'S WORD FOR IT and it is the half a check about collecting
// cannot make: a copy collects everything and drains nothing.
func TestARetroLeavesTheSourcesEmpty(t *testing.T) {
	t.Parallel()
	r := aWorkedTree(t)
	got, said, err := runRetroExe(t, retroExe(t), r)
	if err != nil {
		t.Fatalf("se retro: %v: %s", err, said)
	}
	if got.Logs == 0 || got.Scripts == 0 {
		t.Fatalf("it took %d log(s) and %d script(s), so there is nothing to have drained",
			got.Logs, got.Scripts)
	}
	for _, e := range readDirOr(t, r.Private("log")) {
		if strings.HasPrefix(e, "session-") {
			t.Errorf("%s is still in the log folder", e)
		}
	}
	if rest := readDirOr(t, r.Private("scratchpad")); len(rest) != 0 {
		t.Errorf("the scratchpad still holds %d thing(s): %v", len(rest), rest)
	}
}

// IT COPIES THE HARNESS TRANSCRIPTS RATHER THAN DRAINING THEM.
//
// They are another program's files, one of them is being appended to while this
// runs, and a retro that truncates a running transcript takes the session down
// with it.
func TestARetroCopiesTheTranscriptsAndLeavesThem(t *testing.T) {
	t.Parallel()
	r := aWorkedTree(t)
	here := filepath.Join(t.TempDir(), "a-session.jsonl")
	if err := os.WriteFile(here, []byte(`{"said":"hello"}`+nl), 0o644); err != nil {
		t.Fatal(err)
	}
	got, err := Retro(t.Context(), r, "main", []Transcript{{Name: "claude", Path: here}})
	if err != nil {
		t.Fatal(err)
	}
	if len(got.Transcript) != 1 {
		t.Fatalf("it copied %d transcript(s)", len(got.Transcript))
	}
	// THE ORIGINAL IS WHERE IT WAS, whole.
	b, err := os.ReadFile(here)
	if err != nil {
		t.Fatalf("the transcript was taken rather than copied: %v", err)
	}
	if !strings.Contains(string(b), "hello") {
		t.Fatalf("the transcript was truncated: %q", b)
	}
	// AND THE COPY IS THE TRANSCRIPT.
	c, err := os.ReadFile(got.Transcript[0])
	if err != nil || !strings.Contains(string(c), "hello") {
		t.Fatalf("the copy is not the transcript: %v", err)
	}
}

// readDirOr answers the names in a folder, and nothing for one that is gone.
func readDirOr(t *testing.T, dir string) []string {
	t.Helper()
	entries, err := os.ReadDir(dir)
	if err != nil {
		return nil
	}
	var out []string
	for _, e := range entries {
		out = append(out, e.Name())
	}
	return out
}

// AND IT LEAVES ANOTHER ACTOR'S FOLDER.
//
// THE GUARD ASKS WHO HOLDS A TOKEN AND THE FOLDER ASKS WHO HAS FILES. An agent
// is holderless for ordinary reasons: a reviewer whose queue answered wait, a
// worker between submitting and being reviewed, an agent reading before it
// pulls. Each of those is told to keep its working files here.
func TestARetroLeavesAnotherActorsFolder(t *testing.T) {
	t.Parallel()
	exe := retroExe(t)
	r := aWorkedTree(t)
	pad := r.Private("scratchpad")
	if err := os.MkdirAll(filepath.Join(pad, "reviewer9"), 0o755); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(filepath.Join(pad, "reviewer9", "probe.sh"),
		[]byte("echo"+nl), 0o644); err != nil {
		t.Fatal(err)
	}

	got, out, err := runRetroExe(t, exe, r, "--by", "main")
	if err != nil {
		t.Fatalf("se retro: %v\n%s", err, out)
	}
	if _, err := os.Stat(filepath.Join(pad, "reviewer9", "probe.sh")); err != nil {
		t.Errorf("reviewer9 holds no token and the retro took its folder: %v", err)
	}
	if _, err := os.Stat(filepath.Join(pad, "one-off.py")); err == nil {
		t.Errorf("a loose file nobody cites was left behind")
	}
	if len(got.Kept) == 0 {
		t.Errorf("the retro says nothing about the folder it left")
	}

	// AND THE MANIFEST SAYS IT, WHICH IS THE HALF THE STRUCT CANNOT PROVE.
	//
	// got.Kept is what the producer decided. manifest.jsonl is what a person
	// opens, and a retro that leaves a thing and does not say so reads exactly
	// like one that took it.
	manifest, err := os.ReadFile(filepath.Join(got.Folder, "manifest.jsonl"))
	if err != nil {
		t.Fatalf("the retro wrote no manifest, so this guards nothing: %v", err)
	}
	for _, want := range []string{"reviewer9", "kept", "whoever owns it may be writing to it"} {
		if !strings.Contains(string(manifest), want) {
			t.Errorf("the manifest never says %q, so a retro that left a "+
				"folder reads exactly like one that took it", want)
		}
	}
}

// A CITATION IS RECOGNISED HOWEVER THE PATH WAS SPELLED.
//
// THE KEEP READ ONE SEPARATOR AND THE SWEEP IT GUARDS HAS NO UNDO. This machine
// is Windows: a path pasted out of a shell, an error message or an editor is
// written with backslashes, and a citation in that form was invisible, so the
// file went out from under an open token.
//
// COUNTED BEFORE CLAIMING AN EXTENT: 140 citations in the record use the
// forward slash and none uses the backslash, so nothing is at risk today. That
// is what makes it worth doing now. The claim is true, the check is green, and
// nothing marks the boundary, so the first note written the other way joins the
// record with the keep silent over it.
//
// THE COST OF EVERY OTHER FINDING ON THIS TOKEN IS A ROUND. The cost of this
// one is a file nobody can get back.
// THE POSITIVE CONTROL, AND IT COMES BEFORE THE SWEEP RATHER THAN AFTER IT.
//
// A sweep that has never found anything has never been tested, which is the rule
// in doc/guidance/behaviour.md. So this drives the keep's own rule over the one
// citation the record already holds in the spelling that defeated it, taken out
// of this token's own note rather than invented: observed-red-criteria.txt, at
// the end of a sentence.
//
// IT IS A FIXTURE THIS TEST OWNS, not a read of the tree. The note it came from
// is a note the system edits, so a check standing on it goes quiet the first
// time somebody rewrites that sentence.
func TestTheKeepReadsTheSpellingThatDefeatedIt(t *testing.T) {
	t.Parallel()
	said := "derives a count in its evidence with a sed over .se/scratchpad/observed-red-criteria.txt."
	got := scratchpadNames(said)
	if len(got) != 1 || got[0] != "observed-red-criteria.txt" {
		t.Fatalf("the keep read %q out of the sentence the record actually holds, so a "+
			"retro takes the artefact behind an observation on the token that "+
			"promises not to", got)
	}
}
