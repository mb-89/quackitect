// The analyzers reading the IO flag over planted packages: an IO module passes
// every analyzer, a fake with no suite is named, and so is the core reaching
// the outside. [[spec/design_output/model#the-build-checks-imports]]
package imports

import (
	"sync"
	"testing"

	"golang.org/x/tools/go/analysis"
	"golang.org/x/tools/go/analysis/analysistest"
)

var flagged = map[string]string{
	"q/q.go":                             "package q\n\nfunc IO() int { return 0 }\n",
	"q/clock/clock.go":                   "package clock\n\nimport \"os\" // want `quackitect/src/q/clock imports os`\n\nfunc Name() string { return os.Getenv(\"NAME\") }\n",
	"modules/disk/disk.go":               "package disk\n\nimport (\n\t\"os\"\n\n\t\"quackitect/src/q\"\n)\n\nvar flag = q.IO()\n\nfunc Read() ([]byte, error) { return os.ReadFile(\"a\") }\n\ntype FakeDisk struct{}\n",
	"modules/disk/disk_contract_test.go": "package disk\n",
	"q/qtest/qtest.go":                   "package qtest // want `quackitect/src/q/qtest keeps no suite.go beside its fake`\n\ntype Index struct{}\n",
	"tui/paint/paint.go":                 "package paint\n\nimport \"os\" // want `quackitect/src/tui/paint imports os`\n\nfunc Name() string { return os.Getenv(\"NAME\") }\n",
	"tui/paint/door.go":                  "package paint\n\nimport \"os\"\n\nfunc Read() ([]byte, error) { return os.ReadFile(\"a\") }\n",
	"tui/paint/paint_test.go":            "package paint\n\nimport \"os\"\n\nvar _ = os.Args\n",
	"modules/lonely/lonely.go":           "package lonely\n\ntype FakeThing struct{} // want `quackitect/src/modules/lonely declares FakeThing with no contract suite beside it`\n",
}

// The clean tree with the flagged packages beside it, built once a run in a folder of its own, so none leaks into the clean cases. [[spec/tickets/shared-plant-outlives-each-case]]
var flaggedTree = sync.OnceValues(func() (string, error) { return plantedTree(planted, flagged) })

func plantFlagged(t *testing.T) string {
	t.Helper()
	dir, err := flaggedTree()
	if err != nil {
		t.Fatal(err)
	}
	return dir
}

// Each analyzer loads the planted tree on its own, so the loads run side by side. [[spec/design_output/model#the-build-checks-imports]]
func TestAnIOModuleImportingOsIsNamedByNone(t *testing.T) {
	t.Parallel()
	for _, one := range []*analysis.Analyzer{OnlyQ, IOOnly, FakeSuite, NoModule} {
		t.Run(one.Name, func(t *testing.T) {
			t.Parallel()
			analysistest.Run(t, plantFlagged(t), one, "quackitect/src/modules/disk")
		})
	}
}

func TestAFakeWithNoSuiteIsNamed(t *testing.T) {
	t.Parallel()
	analysistest.Run(t, plantFlagged(t), FakeSuite, "quackitect/src/modules/lonely")
}

func TestTheCoreImportingOsIsNamed(t *testing.T) {
	t.Parallel()
	analysistest.Run(t, plantFlagged(t), IOOnly, "quackitect/src/q/clock")
}

// A renderer reaches the outside through its door.go alone, and its tests stand apart. [[spec/design_output/model#the-build-checks-imports]]
func TestARendererReachingOutBesideItsDoorIsNamed(t *testing.T) {
	t.Parallel()
	analysistest.Run(t, plantFlagged(t), IOOnly, "quackitect/src/tui/paint")
}

func TestQtestWithNoSuiteIsNamed(t *testing.T) {
	t.Parallel()
	analysistest.Run(t, plantFlagged(t), FakeSuite, "quackitect/src/q/qtest")
}
