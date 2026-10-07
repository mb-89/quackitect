// The project verb, run over a copy of the sources this tree holds, writes
// every target the tree holds byte for byte, and prints the line node prints.
// A stale target goes, a file the owner keeps beside the targets stays.
// [[spec/tickets/config-verbs-port-to-go]]
package main

import (
	"fmt"
	"os" // level0: OutsideInDoors - the case reads the sources and the targets the tree holds, as a build check reads source
	"path/filepath"
	"strings"
	"testing"

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
