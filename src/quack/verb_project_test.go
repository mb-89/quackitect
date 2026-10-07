// The project verb, run over a copy of the sources this tree holds, writes
// every target the tree holds byte for byte, and prints the line node prints.
// A stale target goes, a file the owner keeps beside the targets stays.
// [[spec/tickets/config-verbs-port-to-go]]
package main // level0: InPackageTest - a main package admits no outside test package

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"testing"

	projector "quackitect/src/projection"
)

// The repository root, as a test under src/quack reaches it. [[spec/tickets/config-verbs-port-to-go]]
var projectRepo = filepath.Join("..", "..")

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

// Copies one file from one root to the same path under another. [[spec/tickets/config-verbs-port-to-go]]
func projectCopy(t *testing.T, from, to, path string) {
	t.Helper()
	text, err := os.ReadFile(filepath.Join(from, filepath.FromSlash(path)))
	if err != nil {
		t.Fatal(err)
	}
	projectWrite(t, to, path, string(text))
}

// Writes a text at a path under a root, its folders made. [[spec/tickets/config-verbs-port-to-go]]
func projectWrite(t *testing.T, root, path, text string) {
	t.Helper()
	at := filepath.Join(root, filepath.FromSlash(path))
	if err := os.MkdirAll(filepath.Dir(at), 0o755); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(at, []byte(text), 0o644); err != nil {
		t.Fatal(err)
	}
}

// A temp root holding the sources the repository's projections read, and no target. [[spec/tickets/config-verbs-port-to-go]]
func projectSourcesRoot(t *testing.T) string {
	t.Helper()
	root := t.TempDir()
	for _, path := range projectedSources {
		projectCopy(t, projectRepo, root, path)
	}
	for _, folder := range projectedSourceFolders {
		listed, err := os.ReadDir(filepath.Join(projectRepo, filepath.FromSlash(folder)))
		if err != nil {
			t.Fatal(err)
		}
		for _, one := range listed {
			if !one.IsDir() {
				projectCopy(t, projectRepo, root, folder+"/"+one.Name())
			}
		}
	}
	return root
}

// The projected files standing under a root's target folders, by path. [[spec/tickets/config-verbs-port-to-go]]
func projectTargetsUnder(t *testing.T, root string) map[string]string {
	t.Helper()
	out := map[string]string{}
	for folder, end := range projectedTargets {
		listed, err := os.ReadDir(filepath.Join(root, filepath.FromSlash(folder)))
		if err != nil {
			continue
		}
		for _, one := range listed {
			if one.IsDir() || !strings.HasSuffix(one.Name(), end) {
				continue
			}
			text, err := os.ReadFile(filepath.Join(root, filepath.FromSlash(folder), one.Name()))
			if err != nil {
				t.Fatal(err)
			}
			out[folder+"/"+one.Name()] = string(text)
		}
	}
	return out
}

// Runs the verb over a root, and answers what it prints. [[spec/tickets/config-verbs-port-to-go]]
func runProject(t *testing.T, root string, dry bool) string {
	t.Helper()
	var out, errs strings.Builder
	if code := projectVerb(func() (string, error) { return root, nil })(nil, dry, &out, &errs); code != 0 {
		t.Fatalf("project answers exit status %d: %s", code, errs.String())
	}
	return out.String()
}

// The line the JavaScript verb prints over the repository's projections and its targets. [[spec/tickets/config-verbs-port-to-go]]
func projectLine(t *testing.T, wanted int) string {
	t.Helper()
	text, err := os.ReadFile(filepath.Join(projectRepo, filepath.FromSlash(projector.Projections)))
	if err != nil {
		t.Fatal(err)
	}
	return fmt.Sprintf("%d file(s) projected from %d projection(s).\n", wanted, len(projector.EntriesIn(string(text))))
}

func TestProjectWritesTheTreeTargetsByteForByte(t *testing.T) {
	t.Setenv(workRootVar, "")
	root := projectSourcesRoot(t)
	said := runProject(t, root, false)

	want := projectTargetsUnder(t, projectRepo)
	got := projectTargetsUnder(t, root)
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
	t.Setenv(workRootVar, "")
	root := projectSourcesRoot(t)
	const stale = ".claude/commands/se-config-gone-away.md"
	const kept = ".claude/commands/owners-note.md"
	projectWrite(t, root, stale, "stale\n")
	projectWrite(t, root, kept, "mine\n")
	runProject(t, root, false)
	if _, err := os.Stat(filepath.Join(root, filepath.FromSlash(stale))); !os.IsNotExist(err) {
		t.Errorf("%s stands after the projection, and nothing wants it", stale)
	}
	if _, err := os.Stat(filepath.Join(root, filepath.FromSlash(kept))); err != nil {
		t.Errorf("%s goes, and no projection owns it: %v", kept, err)
	}
}

func TestProjectDryWritesNothing(t *testing.T) {
	t.Setenv(workRootVar, "")
	root := projectSourcesRoot(t)
	const stale = ".claude/commands/se-config-gone-away.md"
	projectWrite(t, root, stale, "stale\n")
	said := runProject(t, root, true)
	if got := projectTargetsUnder(t, root); len(got) != 1 {
		t.Errorf("a dry run leaves %d target(s), and the one stale target alone stood", len(got))
	}
	if line := projectLine(t, len(projectTargetsUnder(t, projectRepo))); said != line {
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
	method := projectSourcesRoot(t)
	work := t.TempDir()
	const note = "spec/guidance/arguing.md"
	const rule = "1. The work root's rule wins over the method's."
	projectWrite(t, work, note, "# Actionables\n\n"+rule+"\n")
	t.Setenv(workRootVar, work)
	runProject(t, method, false)
	if got := projectTargetsUnder(t, method); len(got) != 0 {
		t.Errorf("the method root takes %d target(s), and the work root alone takes them", len(got))
	}
	got := projectTargetsUnder(t, work)
	style := got[styleTarget]
	if !strings.Contains(style, "## arguing\n\n"+rule+"\n\n") {
		t.Errorf("the style carries no rule of the work root's %s:\n%s", note, style)
	}
	methodNote, err := os.ReadFile(filepath.Join(method, filepath.FromSlash(note)))
	if err != nil {
		t.Fatal(err)
	}
	if first := firstRule(string(methodNote)); first == "" || strings.Contains(style, first) {
		t.Errorf("the style carries the method's rule %q, and the work root's note replaces it", first)
	}
	for path, text := range projectTargetsUnder(t, projectRepo) {
		if path == styleTarget {
			continue
		}
		if got[path] != text {
			t.Errorf("%s in the work root differs from the one the repository holds", path)
		}
	}
}

// Runs the verb under --check over a root, and answers its status and both streams. [[spec/design_output/projection#check-refuses-a-stale-one]]
func checkProject(root string) (int, string, string) {
	var out, errs strings.Builder
	code := projectVerb(func() (string, error) { return root, nil })([]string{"project", projectCheck}, false, &out, &errs)
	return code, out.String(), errs.String()
}

func TestProjectCheckReadsEveryTargetAndWritesNone(t *testing.T) {
	t.Setenv(workRootVar, "")
	t.Run("a projected tree holds", func(t *testing.T) {
		root := projectSourcesRoot(t)
		runProject(t, root, false)
		if code, out, errs := checkProject(root); code != 0 || !strings.Contains(out, "every target reads as projected") {
			t.Fatalf("check answers %d, %q, %q", code, out, errs)
		}
	})
	t.Run("a missing, a changed and an extra target each name themselves, and nothing is written", func(t *testing.T) {
		root := projectSourcesRoot(t)
		runProject(t, root, false)
		const extra = ".claude/commands/se-config-gone-away.md"
		projectWrite(t, root, extra, "stale\n")
		projectWrite(t, root, styleTarget, "by hand\n")
		code, _, errs := checkProject(root)
		if code != exitFailed || !strings.Contains(errs, extra+" extra") || !strings.Contains(errs, styleTarget+" differs") {
			t.Fatalf("check answers %d, %q", code, errs)
		}
		if text, _ := os.ReadFile(filepath.Join(root, filepath.FromSlash(styleTarget))); string(text) != "by hand\n" {
			t.Errorf("check writes %s", styleTarget)
		}
		if err := os.Remove(filepath.Join(root, filepath.FromSlash(styleTarget))); err != nil {
			t.Fatal(err)
		}
		if _, _, errs := checkProject(root); !strings.Contains(errs, styleTarget+" missing") {
			t.Fatalf("check names no missing target: %q", errs)
		}
	})
	t.Run("a tree naming no projection holds", func(t *testing.T) {
		if code, out, _ := checkProject(t.TempDir()); code != 0 || !strings.Contains(out, "names no projection") {
			t.Fatalf("check answers %d, %q", code, out)
		}
	})
}
