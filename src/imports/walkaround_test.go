// The walkaround analyzer over a planted tree: a use outside its door is named,
// the door's own use is not, and neither is a marked line or a door at report.
// [[spec/design_output/doors#nothing-walks-around-a-door]]
package imports

import (
	"os"
	"path/filepath"
	"testing"

	"golang.org/x/tools/go/analysis/analysistest"
)

var walked = map[string]string{
	"modules/clock/owns.yaml": "clock:\n  go: [time.Sleep]\n",
	"modules/clock/clock.go":  "package clock\n\nimport \"time\"\n\nfunc Wait() { time.Sleep(1) }\n",
	"modules/disk/owns.yaml":  "disk:\n  go: [os]\n  report: true\n",
	"engine/wait/wait.go":     "package wait\n\nimport \"time\"\n\nfunc For() { time.Sleep(1) } // want `time.Sleep walks around clock`\n",
	"engine/wait/marked.go":   "package wait\n\nimport \"time\"\n\n// level0: OutsideInDoors - a hung child needs a deadline\nfunc Hung() { time.Sleep(1) }\n",
	"engine/wait/disk.go":     "package wait\n\nimport \"os\"\n\nvar Args = os.Args\n",
}

// Writes the files under a planted tree's source root, the way plant does. [[spec/design_output/model#the-build-checks-imports]]
func plantOf(t *testing.T, files map[string]string) string {
	t.Helper()
	dir := t.TempDir()
	for rel, text := range files {
		at := filepath.Join(dir, "src", "quackitect", "src", filepath.FromSlash(rel))
		if err := os.MkdirAll(filepath.Dir(at), 0o755); err != nil {
			t.Fatal(err)
		}
		if err := os.WriteFile(at, []byte(text), 0o644); err != nil {
			t.Fatal(err)
		}
	}
	return dir
}

func TestAWalkAroundTheClockIsNamed(t *testing.T) {
	t.Parallel()
	analysistest.Run(t, plantOf(t, walked), Walkaround, "quackitect/src/engine/wait")
}

func TestTheClocksOwnSleepIsNamedByNone(t *testing.T) {
	t.Parallel()
	analysistest.Run(t, plantOf(t, walked), Walkaround, "quackitect/src/modules/clock")
}

// The core and a module reach a package no hand-kept list names, because a declaration names it. [[spec/design_output/model#the-build-checks-imports]]
var mailed = map[string]string{
	"q/q.go":                   "package q\n\nfunc IO() int { return 0 }\n",
	"modules/mail/owns.yaml":   "mail:\n  go: [expvar]\n",
	"q/post/post.go":           "package post\n\nimport \"expvar\" // want `quackitect/src/q/post imports expvar`\n\nvar _ = expvar.NewInt\n",
	"modules/letters/notes.go": "package letters\n\nimport \"expvar\" // want `quackitect/src/modules/letters imports expvar`\n\nvar _ = expvar.NewInt\n",
}

func TestTheCoresListComesOffTheDeclarations(t *testing.T) {
	t.Parallel()
	analysistest.Run(t, plantOf(t, mailed), IOOnly, "quackitect/src/q/post")
}

func TestAModulesListComesOffTheDeclarations(t *testing.T) {
	t.Parallel()
	analysistest.Run(t, plantOf(t, mailed), OnlyQ, "quackitect/src/modules/letters")
}

var timed = map[string]string{
	"q/q.go":                 "package q\n\nfunc IO() int { return 0 }\n",
	"doors/clock/owns.yaml":  "clock:\n  go: [time.Sleep, time.Now]\n",
	"q/wait/wait.go":         "package wait\n\nimport \"time\"\n\nvar _ time.Duration\n",
	"modules/later/later.go": "package later\n\nimport \"time\"\n\nvar _ time.Duration\n",
	"modules/raw/raw.go":     "package raw\n\nimport \"syscall\" // want `quackitect/src/modules/raw imports syscall`\n\nvar _ = syscall.Getpid\n",
}

func TestTheCoreImportingAPackageADoorOwnsByMemberIsNamedByNone(t *testing.T) {
	t.Parallel()
	analysistest.Run(t, plantOf(t, timed), IOOnly, "quackitect/src/q/wait")
}

func TestAModuleImportingAPackageADoorOwnsByMemberIsNamedByNone(t *testing.T) {
	t.Parallel()
	analysistest.Run(t, plantOf(t, timed), OnlyQ, "quackitect/src/modules/later")
}

func TestAModuleImportingTheFloorIsNamedWithNoDeclaration(t *testing.T) {
	t.Parallel()
	analysistest.Run(t, plantOf(t, timed), OnlyQ, "quackitect/src/modules/raw")
}
