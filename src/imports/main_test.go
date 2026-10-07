// The fixture home of the imports tests: the planted trees the analyzer tests
// read, each built once on first read and removed when the run ends. A test
// reads a tree and writes nothing into it.
// [[spec/design_output/model#the-build-checks-imports]]
package imports_test

import (
	"os"
	"path/filepath"
	"sync"
	"testing"

	"quackitect/src/q/qtest"
)

// The packages of the import rules: each refused import carries a want comment, and a clean one carries none. [[spec/design_output/model#the-build-checks-imports]]
var planted = map[string]string{
	"doors/disk/disk.go":       "package disk\n\nfunc Read() string { return \"\" }\n",
	"doors/nosy/nosy.go":       "package nosy\n\nimport \"quackitect/src/modules/work\" // want `quackitect/src/doors/nosy imports quackitect/src/modules/work`\n\nfunc Name() string { return work.Name() }\n",
	"modules/nosy/nosy.go":     "package nosy\n\nimport \"os\" // want `quackitect/src/modules/nosy imports os`\n\nfunc Name() string { return os.Getenv(\"NAME\") }\n",
	"modules/work/work.go":     "package work\n\nfunc Name() string { return \"work\" }\n",
	"modules/names/names.go":   "package names\n\nfunc Of() string { return \"work\" }\n",
	"modules/greedy/greedy.go": "package greedy\n\nimport \"quackitect/src/modules/names\" // want `quackitect/src/modules/greedy imports quackitect/src/modules/names`\n\nfunc Name() string { return names.Of() }\n",
	"tui/frame/frame.go":       "package frame\n\nimport \"quackitect/src/modules/work\" // want `quackitect/src/tui/frame imports quackitect/src/modules/work`\n\nfunc Title() string { return work.Name() }\n",
}

// The packages the analyzers reading the IO flag run over, planted beside the import rules' packages. [[spec/design_output/model#the-build-checks-imports]]
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

// The planted trees built so far, which TestMain removes. [[spec/design_output/model#the-build-checks-imports]]
var (
	builtMu sync.Mutex
	built   []string
)

// A GOPATH holding each set's files under quackitect/src. [[spec/design_output/model#the-build-checks-imports]]
func plantTree(sets ...map[string]string) string {
	dir, err := os.MkdirTemp("", "imports-planted-")
	if err != nil {
		panic(err)
	}
	builtMu.Lock()
	built = append(built, dir)
	builtMu.Unlock()
	for _, set := range sets {
		for rel, text := range set {
			at := filepath.Join(dir, "src", "quackitect", "src", filepath.FromSlash(rel))
			if err := os.MkdirAll(filepath.Dir(at), 0o755); err != nil {
				panic(err)
			}
			if err := os.WriteFile(at, []byte(text), 0o644); err != nil {
				panic(err)
			}
		}
	}
	return dir
}

// The import rules' tree, shared read-only. [[spec/design_output/model#the-build-checks-imports]]
var plantedTree = qtest.Shared(func() string { return plantTree(planted) })

// The import rules' tree with the IO flag's packages beside it, shared read-only. [[spec/design_output/model#the-build-checks-imports]]
var flaggedTree = qtest.Shared(func() string { return plantTree(planted, flagged) })

func TestMain(m *testing.M) {
	code := m.Run()
	for _, dir := range built {
		_ = os.RemoveAll(dir)
	}
	os.Exit(code)
}
