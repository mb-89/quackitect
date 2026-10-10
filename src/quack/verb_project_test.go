// The project verb, run over a copy of the sources this tree holds, writes
// every target the tree holds byte for byte, and prints the line node prints.
// A stale target goes, a file the owner keeps beside the targets stays.
// [[spec/tickets/config-verbs-port-to-go]]
package main // level0: InPackageTest - a main package admits no outside test package

import (
	"encoding/json"
	"fmt"
	"os" // level0: OutsideInDoors - the case reads the sources and the targets the tree holds, as a build check reads source
	"path/filepath"
	"strings"
	"testing"
	"time"

	"quackitect/src/modules/edits"
	projector "quackitect/src/projection"
)

// The repository root, as a test under src/quack reaches it. [[spec/tickets/config-verbs-port-to-go]]
var projectRepo = filepath.Join("..", "..")

// The tree this repository holds, read as the build check reads its source. [[spec/tickets/test-walks-move-onto-fakes]]
var hq3TreeDisk = diskDoors{read: os.ReadFile, list: os.ReadDir, stat: os.Stat}

// The sources the projections read: files, and folders read one level deep. [[spec/tickets/config-verbs-port-to-go]]
var (
	projectedSources = []string{
		projector.Projections,
		"spec/config/level0.json",
		"spec/config/level0.schema.json",
		"spec/processes/retro.yaml",
		"spec/schemas/paragraph.schema.yaml",
		"spec/schemas/paragraph.schema.schema.json",
		"spec/config/stems.yaml",
	}
	projectedSourceFolders = []string{"spec/vocabulary", "spec/guidance"}
)

// The target folders, each with the ending its projected files hold. [[spec/tickets/config-verbs-port-to-go]]
var projectedTargets = map[string]string{
	".claude/commands":                  ".md",
	"spec/config/styles/VoiceParagraph": ".yml",
	".claude/output-styles":             ".md",
}

// The root the cases project under on the fake disk. [[spec/tickets/test-walks-move-onto-fakes]]
const hq3ProjectRoot = "/tree"

// Copies one file of the repository to the same path under the root on the disk. [[spec/tickets/config-verbs-port-to-go]]
func projectCopy(t *testing.T, disk diskDoors, to, path string) {
	t.Helper()
	text, err := hq3TreeDisk.read(filepath.Join(projectRepo, filepath.FromSlash(path)))
	if err != nil {
		t.Fatal(err)
	}
	projectWrite(t, disk, to, path, string(text))
}

// Writes a text at a path under a root on the disk, its folders made. [[spec/tickets/config-verbs-port-to-go]]
func projectWrite(t *testing.T, disk diskDoors, root, path, text string) {
	t.Helper()
	hq1SeedDisk(t, disk, root, map[string]string{path: text})
}

// A fake disk whose root holds the sources the repository's projections read, and no target. [[spec/tickets/config-verbs-port-to-go]]
func projectSourcesRoot(t *testing.T) diskDoors {
	t.Helper()
	disk := newFakeDisk()
	for _, path := range projectedSources {
		projectCopy(t, disk, hq3ProjectRoot, path)
	}
	for _, folder := range projectedSourceFolders {
		listed, err := hq3TreeDisk.list(filepath.Join(projectRepo, filepath.FromSlash(folder)))
		if err != nil {
			t.Fatal(err)
		}
		for _, one := range listed {
			if !one.IsDir() {
				projectCopy(t, disk, hq3ProjectRoot, folder+"/"+one.Name())
			}
		}
	}
	return disk
}

// The projected files standing under a root's target folders on the disk, by path. [[spec/tickets/config-verbs-port-to-go]]
func projectTargetsUnder(t *testing.T, disk diskDoors, root string) map[string]string {
	t.Helper()
	out := map[string]string{}
	for folder, end := range projectedTargets {
		listed, err := disk.list(filepath.Join(root, filepath.FromSlash(folder)))
		if err != nil {
			continue
		}
		for _, one := range listed {
			if one.IsDir() || !strings.HasSuffix(one.Name(), end) {
				continue
			}
			text, err := disk.read(filepath.Join(root, filepath.FromSlash(folder), one.Name()))
			if err != nil {
				t.Fatal(err)
			}
			out[folder+"/"+one.Name()] = string(text)
		}
	}
	return out
}

// The box a project case runs on: the work root the case names, and the fake disk. [[spec/tickets/quack-reaches-the-box-through-doors]]
func projectBox(disk diskDoors, work string) func() boxDoors {
	return func() boxDoors {
		return boxDoors{env: func(key string) string { return map[string]string{workRootVar: work}[key] }, disk: disk}
	}
}

// Runs the verb over the root on the disk, and answers what it prints. [[spec/tickets/config-verbs-port-to-go]]
func runProject(t *testing.T, disk diskDoors, work string, dry bool) string {
	t.Helper()
	var out, errs strings.Builder
	if code := projectVerb(func() (string, error) { return hq3ProjectRoot, nil }, projectBox(disk, work))(nil, dry, &out, &errs); code != 0 {
		t.Fatalf("project answers exit status %d: %s", code, errs.String())
	}
	return out.String()
}

// The line the JavaScript verb prints over the repository's projections and its targets. [[spec/tickets/config-verbs-port-to-go]]
func projectLine(t *testing.T, wanted int) string {
	t.Helper()
	text, err := hq3TreeDisk.read(filepath.Join(projectRepo, filepath.FromSlash(projector.Projections)))
	if err != nil {
		t.Fatal(err)
	}
	return fmt.Sprintf("%d file(s) projected from %d projection(s).\n", wanted, len(projector.EntriesIn(string(text))))
}

func TestProjectWritesTheTreeTargetsByteForByte(t *testing.T) {
	t.Parallel()
	disk := projectSourcesRoot(t)
	said := runProject(t, disk, "", false)

	want := projectTargetsUnder(t, hq3TreeDisk, projectRepo)
	got := projectTargetsUnder(t, disk, hq3ProjectRoot)
	if len(want) == 0 {
		t.Fatal("the repository holds no projected target")
	}
	for path, text := range want {
		if got[path] != text {
			t.Errorf("%s differs from the one the repository holds", path)
		}
	}
	for path := range got {
		if _, held := want[path]; !held {
			t.Errorf("%s stands nowhere in the repository", path)
		}
	}
	if line := projectLine(t, len(want)); said != line {
		t.Errorf("project prints %q, and node prints %q", said, line)
	}
}

func TestProjectRemovesAStaleTargetAndKeepsTheOwnersFile(t *testing.T) {
	t.Parallel()
	disk := projectSourcesRoot(t)
	const stale = ".claude/commands/se-config-gone-away.md"
	const kept = ".claude/commands/owners-note.md"
	projectWrite(t, disk, hq3ProjectRoot, stale, "stale\n")
	projectWrite(t, disk, hq3ProjectRoot, kept, "mine\n")
	runProject(t, disk, "", false)
	if disk.stands(filepath.Join(hq3ProjectRoot, filepath.FromSlash(stale))) {
		t.Errorf("%s stands after the projection, and nothing wants it", stale)
	}
	if !disk.stands(filepath.Join(hq3ProjectRoot, filepath.FromSlash(kept))) {
		t.Errorf("%s goes, and no projection owns it", kept)
	}
}

func TestProjectDryWritesNothing(t *testing.T) {
	t.Parallel()
	disk := projectSourcesRoot(t)
	const stale = ".claude/commands/se-config-gone-away.md"
	projectWrite(t, disk, hq3ProjectRoot, stale, "stale\n")
	said := runProject(t, disk, "", true)
	if got := projectTargetsUnder(t, disk, hq3ProjectRoot); len(got) != 1 {
		t.Errorf("a dry run leaves %d target(s), and the one stale target alone stood", len(got))
	}
	if line := projectLine(t, len(projectTargetsUnder(t, hq3TreeDisk, projectRepo))); said != line {
		t.Errorf("a dry run prints %q, and the projection prints %q", said, line)
	}
}

// The output style the guidance folder projects into. [[spec/tickets/config-verbs-port-to-go]]
const styleTarget = ".claude/output-styles/level0.md"

// The first numbered rule a note's text holds. [[spec/tickets/config-verbs-port-to-go]]
func firstRule(text string) string {
	for _, line := range strings.Split(text, "\n") {
		if rest, held := strings.CutPrefix(line, "1. "); held {
			return rest
		}
	}
	return ""
}

// The sources stand in the method root and the work root lays its own over them: a method source still projects, a work source wins, and the targets land in the work root. [[spec/design_output/vehicle#the-work-root-inherits]]
func TestProjectWritesTheWorkRootOffTheMethodSources(t *testing.T) {
	t.Parallel()
	disk := projectSourcesRoot(t)
	const work = "/work"
	const note = "spec/guidance/arguing.md"
	const rule = "1. The work root's rule wins over the method's."
	projectWrite(t, disk, work, note, "# Actionables\n\n"+rule+"\n")
	runProject(t, disk, work, false)
	if got := projectTargetsUnder(t, disk, hq3ProjectRoot); len(got) != 0 {
		t.Errorf("the method root takes %d target(s), and the work root alone takes them", len(got))
	}
	got := projectTargetsUnder(t, disk, work)
	style := got[styleTarget]
	if !strings.Contains(style, "## arguing\n\n"+rule+"\n\n") {
		t.Errorf("the style carries no rule of the work root's %s:\n%s", note, style)
	}
	methodNote := disk.text(filepath.Join(hq3ProjectRoot, filepath.FromSlash(note)))
	if first := firstRule(methodNote); first == "" || strings.Contains(style, first) {
		t.Errorf("the style carries the method's rule %q, and the work root's note replaces it", first)
	}
	for path, text := range projectTargetsUnder(t, hq3TreeDisk, projectRepo) {
		if path == styleTarget {
			continue
		}
		if got[path] != text {
			t.Errorf("%s in the work root differs from the one the repository holds", path)
		}
	}
}

// Runs the verb under --check over the root on the disk, and answers its status and both streams. [[spec/design_output/projection#check-refuses-a-stale-one]]
func checkProject(disk diskDoors) (int, string, string) {
	var out, errs strings.Builder
	code := projectVerb(func() (string, error) { return hq3ProjectRoot, nil }, projectBox(disk, ""))([]string{"project", projectCheck}, false, &out, &errs)
	return code, out.String(), errs.String()
}

func TestProjectCheckReadsEveryTargetAndWritesNone(t *testing.T) {
	t.Parallel()
	t.Run("a projected tree holds", func(t *testing.T) {
		disk := projectSourcesRoot(t)
		runProject(t, disk, "", false)
		if code, out, errs := checkProject(disk); code != 0 || !strings.Contains(out, "every target reads as projected") {
			t.Fatalf("check answers %d, %q, %q", code, out, errs)
		}
	})
	t.Run("a missing, a changed and an extra target each name themselves, and nothing is written", func(t *testing.T) {
		disk := projectSourcesRoot(t)
		runProject(t, disk, "", false)
		const extra = ".claude/commands/se-config-gone-away.md"
		projectWrite(t, disk, hq3ProjectRoot, extra, "stale\n")
		projectWrite(t, disk, hq3ProjectRoot, styleTarget, "by hand\n")
		code, _, errs := checkProject(disk)
		if code != exitFailed || !strings.Contains(errs, extra+" extra") || !strings.Contains(errs, styleTarget+" differs") {
			t.Fatalf("check answers %d, %q", code, errs)
		}
		at := filepath.Join(hq3ProjectRoot, filepath.FromSlash(styleTarget))
		if disk.text(at) != "by hand\n" {
			t.Errorf("check writes %s", styleTarget)
		}
		if err := disk.remove(at); err != nil {
			t.Fatal(err)
		}
		if _, _, errs := checkProject(disk); !strings.Contains(errs, styleTarget+" missing") {
			t.Fatalf("check names no missing target: %q", errs)
		}
	})
	t.Run("a tree naming no projection holds", func(t *testing.T) {
		if code, out, _ := checkProject(newFakeDisk()); code != 0 || !strings.Contains(out, "names no projection") {
			t.Fatalf("check answers %d, %q", code, out)
		}
	})
}

const (
	splitText   = "one\ntwo\nthree\nfour\nfive\n"
	splitSource = "src/long.js"
)

// Runs a verb of the group through the registry over the root, and answers its exit code and everything it said. [[spec/tickets/ticket-verbs-port-to-go]]
func runsVerb(t *testing.T, root string, words ...string) (int, string) {
	t.Helper()
	t.Setenv("QUACKITECT_ROOT", root)
	_, one := twinOf(words, registry)
	if one == nil {
		t.Fatalf("the registry holds no Go answer for %s", strings.Join(words, " "))
	}
	var said strings.Builder
	code := one(words, false, &said, &said)
	return code, said.String()
}

// A fake disk holding the source the cases cut under /tree. [[spec/design_output/level0#a-verb-cuts-the-file]]
func splitTree(t *testing.T) diskDoors {
	t.Helper()
	disk := newFakeDisk()
	hq1SeedDisk(t, disk, "/tree", map[string]string{splitSource: splitText})
	return disk
}

// Runs the split verb over the fake disk under /tree, and answers its exit code and everything it said. [[spec/tickets/test-walks-move-onto-fakes]]
func hq3Splits(disk diskDoors, words ...string) (int, string) {
	var said strings.Builder
	split := splitVerb(func() (string, error) { return "/tree", nil }, func() time.Time { return time.Unix(0, 0) }, disk)
	code := split(words, false, &said, &said)
	return code, said.String()
}

// The text a file under /tree holds on the fake disk, and whether it stands. [[spec/tickets/test-walks-move-onto-fakes]]
func hq3ReadsBack(disk diskDoors, path string) (string, bool) {
	text, err := disk.read(filepath.Join("/tree", filepath.FromSlash(path)))
	return string(text), err == nil
}

func TestSplitVerb(t *testing.T) {
	t.Parallel()
	t.Run("the verb writes every target, the rest and one journal entry", func(t *testing.T) {
		disk := splitTree(t)
		code, said := hq3Splits(disk, "split", splitSource, "--to", "src/a.js", "--lines", "1-2", "--to", "src/b.js", "--lines", "4-5")
		if code != 0 {
			t.Fatalf("the split answers %d: %s", code, said)
		}
		for path, want := range map[string]string{"src/a.js": "one\ntwo\n", "src/b.js": "four\nfive\n", splitSource: "three\n"} {
			if got, _ := hq3ReadsBack(disk, path); got != want {
				t.Errorf("%s holds %q, and wants %q", path, got, want)
			}
		}
		for _, line := range []string{"src/a.js takes 2 line(s).", "src/b.js takes 2 line(s).", "src/long.js keeps 1 line(s).", "The cut stands, and mcp__level0__undo takes it back under split:"} {
			if !strings.Contains(said, line) {
				t.Errorf("the split says %q, and wants %q", said, line)
			}
		}
		journal := filepath.Join("/tree", filepath.FromSlash(edits.Journal))
		entries := disk.listed(journal)
		if len(entries) != 1 || !strings.HasSuffix(entries[0].Name(), ".json") {
			t.Fatalf("the journal holds %v, and wants one entry for the whole cut", entries)
		}
		text, _ := disk.read(filepath.Join(journal, entries[0].Name()))
		var entry struct {
			On    string `json:"on"`
			By    string `json:"by"`
			Files []struct {
				File        string `json:"file"`
				Was         string `json:"was"`
				Made        string `json:"made"`
				DidNotExist bool   `json:"did_not_exist"`
			} `json:"files"`
		}
		if err := json.Unmarshal(text, &entry); err != nil {
			t.Fatal(err)
		}
		if entry.By != "split" || !strings.HasPrefix(entry.On, "split:") || len(entry.Files) != 3 {
			t.Fatalf("the entry reads %+v, and wants the split's three files", entry)
		}
		if entry.Files[0].File != "src/a.js" || !entry.Files[0].DidNotExist || entry.Files[2].File != splitSource || entry.Files[2].Was != splitText || entry.Files[2].Made != "three\n" {
			t.Fatalf("the entry reads %+v, and wants each target born and the source's both halves", entry.Files)
		}
	})
	t.Run("the dry flag, before or past the source, names the cuts and writes nothing, and a target under a folder nothing holds makes that folder", func(t *testing.T) {
		for _, argv := range [][]string{{splitSource, "--to", "src/a.js", "--lines", "1-2", "--dry"}, {"--dry", splitSource, "--to", "src/a.js", "--lines", "1-2"}} {
			disk := splitTree(t)
			code, said := hq3Splits(disk, append([]string{"split"}, argv...)...)
			if code != 0 || !strings.Contains(said, "src/a.js takes 2 line(s).") || !strings.Contains(said, "src/long.js keeps 3 line(s).") {
				t.Fatalf("the dry split answers %d, %q", code, said)
			}
			if _, stands := hq3ReadsBack(disk, "src/a.js"); stands {
				t.Fatal("the dry split writes a target")
			}
			if got, _ := hq3ReadsBack(disk, splitSource); got != splitText {
				t.Fatalf("the dry split writes the source: %q", got)
			}
		}
		disk := splitTree(t)
		if code, said := hq3Splits(disk, "split", splitSource, "--to", "src/fresh/a.js", "--lines", "1-2"); code != 0 {
			t.Fatalf("the split answers %d: %s", code, said)
		}
		if got, _ := hq3ReadsBack(disk, "src/fresh/a.js"); got != "one\ntwo\n" {
			t.Fatalf("the target holds %q", got)
		}
	})
	t.Run("two splits at one clock reading leave two journal entries", func(t *testing.T) {
		disk := splitTree(t)
		for _, target := range []string{"src/a.js", "src/b.js"} {
			if code, said := hq3Splits(disk, "split", splitSource, "--to", target, "--lines", "1-1"); code != 0 {
				t.Fatalf("the split answers %d: %s", code, said)
			}
		}
		if entries := disk.listed(filepath.Join("/tree", filepath.FromSlash(edits.Journal))); len(entries) != 2 {
			t.Fatalf("the journal holds %v, and wants one entry a split", entries)
		}
	})
	t.Run("a journal the disk refuses answers a line, and no target lands", func(t *testing.T) {
		disk := splitTree(t)
		hq1SeedDisk(t, disk, "/tree", map[string]string{".se": "a file where the folder stands"})
		code, said := hq3Splits(disk, "split", splitSource, "--to", "src/a.js", "--lines", "1-2")
		if code != exitFailed || !strings.Contains(said, "The journal would not write, so nothing did:") || strings.Contains(said, "goroutine") {
			t.Fatalf("the split answers %d, %q", code, said)
		}
		if _, stands := hq3ReadsBack(disk, "src/a.js"); stands {
			t.Fatal("a refused journal lets a target land")
		}
		if got, _ := hq3ReadsBack(disk, splitSource); got != splitText {
			t.Fatalf("a refused journal writes the source: %q", got)
		}
	})
	t.Run("a target the disk refuses answers a line, and names the way back", func(t *testing.T) {
		disk := splitTree(t)
		code, said := hq3Splits(disk, "split", splitSource, "--to", splitSource+"/a.js", "--lines", "1-2")
		if code != exitFailed || !strings.Contains(said, "src/long.js/a.js would not write, and ") || !strings.Contains(said, "holds the way back.") {
			t.Fatalf("the split answers %d, %q", code, said)
		}
		if got, _ := hq3ReadsBack(disk, splitSource); got != splitText {
			t.Fatalf("a refused target writes the source: %q", got)
		}
	})
	t.Run("the help flag prints the usage", func(t *testing.T) {
		code, said := hq3Splits(splitTree(t), "split", "--help")
		if code != 0 || !strings.Contains(said, "Usage: ./RUNME.sh split <file> --to <path> --lines <from>-<to> [...] [--dry]") {
			t.Fatalf("the help answers %d, %q", code, said)
		}
	})
	refusals := []struct {
		name, says string
		code       int
		argv       []string
	}{
		{"a call naming no source", "A split names the file it cuts first, and this call names none.", 2, []string{"--to", "src/a.js", "--lines", "1-2", "--dry"}},
		{"a source standing nowhere", "src/gone.js stands nowhere, so there is nothing to cut.", 2, []string{"src/gone.js", "--to", "src/a.js", "--lines", "1-2"}},
		{"a target with no range", "src/a.js names no range. Add --lines from-to.", 2, []string{splitSource, "--to", "src/a.js"}},
		{"a range with no target", "A range names no target. Add --to path.", 2, []string{splitSource, "--lines", "1-2"}},
		{"no cut at all", "A split names a target: --to path --lines from-to.", 2, []string{splitSource}},
		{"a range reading backwards", "4-2 reads backwards. Write the smaller first.", 2, []string{splitSource, "--to", "src/a.js", "--lines", "4-2"}},
		{"a range from line zero", "A file's first line is 1, so a range starts there.", 2, []string{splitSource, "--to", "src/a.js", "--lines", "0-2"}},
		{"a range in words", "two reads as no range. Write from-to.", 2, []string{splitSource, "--to", "src/a.js", "--lines", "two"}},
		{"the source as a target", "src/long.js is the source and a target, so the cut writes over what it reads.", 2, []string{splitSource, "--to", "src/a.js", "--lines", "1-2", "--to", splitSource, "--lines", "4-5"}},
		{"two cuts into one target", "./src/a.js takes two cuts, and the second writes over the first. Name one --to a target.", 2, []string{splitSource, "--to", "src/a.js", "--lines", "1-2", "--to", "./src/a.js", "--lines", "4-5"}},
		{"two ranges reaching one line", "src/b.js and src/a.js both reach line 3.", 1, []string{splitSource, "--to", "src/a.js", "--lines", "1-3", "--to", "src/b.js", "--lines", "3-5"}},
		{"a range past the last line", "src/a.js reaches line 9, and the file holds 5 line(s).", 1, []string{splitSource, "--to", "src/a.js", "--lines", "4-9"}},
	}
	for _, one := range refusals {
		t.Run(one.name+" comes back refused, and nothing writes", func(t *testing.T) {
			disk := splitTree(t)
			code, said := hq3Splits(disk, append([]string{"split"}, one.argv...)...)
			if code != one.code || !strings.Contains(said, one.says) {
				t.Fatalf("the split answers %d, %q, and wants %d, %q", code, said, one.code, one.says)
			}
			if _, stands := hq3ReadsBack(disk, "src/a.js"); stands {
				t.Fatal("a refused split writes a target")
			}
			if got, _ := hq3ReadsBack(disk, splitSource); got != splitText {
				t.Fatalf("a refused split writes the source: %q", got)
			}
		})
	}
}
