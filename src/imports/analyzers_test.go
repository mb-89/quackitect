// The analyzers over the planted packages main_test.go shares: each refused
// import is named, an IO module passes every analyzer, a fake with no suite is
// named, and so is the core reaching the outside.
// [[spec/design_output/model#the-build-checks-imports]]
package imports_test

import (
	"testing"

	"golang.org/x/tools/go/analysis"
	"golang.org/x/tools/go/analysis/analysistest"

	"quackitect/src/imports"
)

func TestADoorImportingAModuleIsNamed(t *testing.T) {
	t.Parallel()
	analysistest.Run(t, plantedTree(), imports.NoModule, "quackitect/src/doors/nosy")
}

func TestARendererImportingAModuleIsNamed(t *testing.T) {
	t.Parallel()
	analysistest.Run(t, plantedTree(), imports.NoModule, "quackitect/src/tui/frame")
}

// [[spec/design_output/model#the-build-checks-imports]]
func TestAModuleImportingOsIsNamed(t *testing.T) {
	t.Parallel()
	analysistest.Run(t, plantedTree(), imports.OnlyQ, "quackitect/src/modules/nosy")
}

// [[spec/design_output/model#the-build-checks-imports]]
func TestAModuleImportingAModuleIsNamed(t *testing.T) {
	t.Parallel()
	analysistest.Run(t, plantedTree(), imports.NoModule, "quackitect/src/modules/greedy")
}

func TestAnIOModuleImportingOsIsNamedByNone(t *testing.T) {
	t.Parallel()
	// Each analyzer loads the planted tree on its own, so the loads run side by side.
	for _, one := range []*analysis.Analyzer{imports.OnlyQ, imports.IOOnly, imports.FakeSuite, imports.NoModule} {
		t.Run(one.Name, func(t *testing.T) {
			t.Parallel()
			analysistest.Run(t, flaggedTree(), one, "quackitect/src/modules/disk")
		})
	}
}

func TestAFakeWithNoSuiteIsNamed(t *testing.T) {
	t.Parallel()
	analysistest.Run(t, flaggedTree(), imports.FakeSuite, "quackitect/src/modules/lonely")
}

func TestTheCoreImportingOsIsNamed(t *testing.T) {
	t.Parallel()
	analysistest.Run(t, flaggedTree(), imports.IOOnly, "quackitect/src/q/clock")
}

// A renderer reaches the outside through its door.go alone, and its tests stand apart. [[spec/design_output/model#the-build-checks-imports]]
func TestARendererReachingOutBesideItsDoorIsNamed(t *testing.T) {
	t.Parallel()
	analysistest.Run(t, flaggedTree(), imports.IOOnly, "quackitect/src/tui/paint")
}

func TestQtestWithNoSuiteIsNamed(t *testing.T) {
	t.Parallel()
	analysistest.Run(t, flaggedTree(), imports.FakeSuite, "quackitect/src/q/qtest")
}
