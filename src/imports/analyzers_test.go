// The analyzers reading the IO flag over planted packages: an IO module passes
// every analyzer, a fake with no suite is named, and so is the core reaching
// the outside. [[spec/design_output/model#the-build-checks-imports]]
package imports

import (
	"os"
	"path/filepath"
	"testing"

	"golang.org/x/tools/go/analysis"
	"golang.org/x/tools/go/analysis/analysistest"
)

var flagged = map[string]string{
	"q/q.go":                             "package q\n\nfunc IO() int { return 0 }\n",
	"q/clock/clock.go":                   "package clock\n\nimport \"os\" // want `quackitect/src/q/clock imports os`\n\nfunc Name() string { return os.Getenv(\"NAME\") }\n",
	"modules/disk/disk.go":               "package disk\n\nimport (\n\t\"os\"\n\n\t\"quackitect/src/q\"\n)\n\nvar flag = q.IO()\n\nfunc Read() ([]byte, error) { return os.ReadFile(\"a\") }\n\ntype FakeDisk struct{}\n",
	"modules/disk/disk_contract_test.go": "package disk\n",
	"q/qtest/qtest.go":                  "package qtest // want `quackitect/src/q/qtest keeps no suite.go beside its fake`\n\ntype Index struct{}\n",
	"modules/lonely/lonely.go":           "package lonely\n\ntype FakeThing struct{} // want `quackitect/src/modules/lonely declares FakeThing with no contract suite beside it`\n",
}

func plantFlagged(t *testing.T) string {
	t.Helper()
	dir := plant(t)
	for rel, text := range flagged {
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

func TestAnIOModuleImportingOsIsNamedByNone(t *testing.T) {
	for _, one := range []*analysis.Analyzer{OnlyQ, IOOnly, FakeSuite, NoModule} {
		analysistest.Run(t, plantFlagged(t), one, "quackitect/src/modules/disk")
	}
}

func TestAFakeWithNoSuiteIsNamed(t *testing.T) {
	analysistest.Run(t, plantFlagged(t), FakeSuite, "quackitect/src/modules/lonely")
}

func TestTheCoreImportingOsIsNamed(t *testing.T) {
	analysistest.Run(t, plantFlagged(t), IOOnly, "quackitect/src/q/clock")
}

func TestQtestWithNoSuiteIsNamed(t *testing.T) {
	analysistest.Run(t, plantFlagged(t), FakeSuite, "quackitect/src/q/qtest")
}
