// The guards verb over a planted guard and its baseline.
// [[spec/design_output/model#the-guards-hold-a-baseline]]
package main // level0: InPackageTest - a main package admits no outside test package

import (
	"slices"
	"strings"
	"testing"

	"quackitect/src/imports"
)

func plantedGuard(refuses bool) []imports.Guard {
	return []imports.Guard{{Name: "planted", Refuses: refuses, Names: func([]string, func(string) string) []string { return []string{"a", "b"} }}}
}

func baselineReads(path string) string {
	if path == imports.BaselineOf("planted") {
		return "b\nc\n"
	}
	return ""
}

func TestTheGuardsReportAnswersZeroAndNamesEachOffender(t *testing.T) {
	t.Parallel()
	lines, code := guardsSaid(plantedGuard(false), nil, baselineReads)
	joined := strings.Join(lines, "\n")
	if code != 0 || !strings.Contains(joined, "a") || !strings.Contains(joined, "c") || slices.Contains(lines, "planted: new b") || !slices.Contains(lines, "planted: new a") || !slices.Contains(lines, "planted: stale c") {
		t.Fatalf("the report answers %d over %q, not 0 naming a as new and c as stale", code, lines)
	}
}

func TestTheGuardsReportCountsTheOffendersPerPackage(t *testing.T) {
	t.Parallel()
	guards := []imports.Guard{{Name: "planted", PackageOf: func(one string) string { return strings.Split(one, "/")[0] }, Names: func([]string, func(string) string) []string {
		return []string{"x/a_test.go", "x/b_test.go", "y/c_test.go"}
	}}}
	lines, _ := guardsSaid(guards, nil, func(string) string { return "" })
	if !slices.Contains(lines, "planted: x holds 2") || !slices.Contains(lines, "planted: y holds 1") {
		t.Fatalf("the report reads %q, not x holding 2 and y holding 1", lines)
	}
}

func TestTheGuardsReportPrintsEachOffenderWholeWhereNoPackageGroups(t *testing.T) {
	t.Parallel()
	guards := []imports.Guard{{Name: "ratio", Names: func([]string, func(string) string) []string {
		return []string{"go a\t3 test lines, 2 code lines"}
	}}}
	lines, _ := guardsSaid(guards, nil, func(string) string { return "" })
	if !slices.Contains(lines, "ratio: go a\t3 test lines, 2 code lines") {
		t.Fatalf("the report reads %q, not the module with both counts", lines)
	}
}

func TestTheGuardsRefuseAnswersOneOverANewOffender(t *testing.T) {
	t.Parallel()
	if _, code := guardsSaid(plantedGuard(true), nil, baselineReads); code != 1 {
		t.Fatalf("a refusing guard over a new offender answers %d", code)
	}
}

var refusingGuards = map[string]map[string]string{
	"blackbox": {"a/a_test.go": "package a\n"},
	"fixture":  {"a/a_test.go": "package a_test\n\nimport \"testing\"\n\nfunc TestBuilds(t *testing.T) { _ = t.TempDir() }\n"},
	"ratio":    {"a/a.go": "package a\n", "a/a_test.go": "package a_test\n\nfunc one() {}\nfunc two() {}\n"},
	"script":   {"tools/run": "#!/bin/sh\necho one\n"},
}

func guardNamed(t *testing.T, name string) imports.Guard {
	t.Helper()
	at := slices.IndexFunc(imports.Guards, func(one imports.Guard) bool { return one.Name == name })
	if at < 0 {
		t.Fatalf("no guard is named %s", name)
	}
	return imports.Guards[at]
}

func plantedReads(files map[string]string, baseline string) ([]string, func(string) string) {
	tracked := []string{}
	for path := range files {
		tracked = append(tracked, path)
	}
	slices.Sort(tracked)
	return tracked, func(path string) string {
		if strings.HasPrefix(path, "src/imports/baseline/") {
			return baseline
		}
		return files[path]
	}
}

func TestEachTestGuardRefusesItsPlantedOffenderPastTheBaseline(t *testing.T) {
	t.Parallel()
	for name, files := range refusingGuards {
		guard := guardNamed(t, name)
		tracked, read := plantedReads(files, "")
		lines, code := guardsSaid([]imports.Guard{guard}, tracked, read)
		if code != exitFailed || !slices.ContainsFunc(lines, func(line string) bool { return strings.HasPrefix(line, name+": new ") }) {
			t.Errorf("the %s guard answers %d over %q, not a refusal naming the planted offender", name, code, lines)
		}
	}
}

func TestATestGuardRefusesABaselineLineItNoLongerNames(t *testing.T) {
	t.Parallel()
	tracked, read := plantedReads(map[string]string{"docs/a.md": "# a\n"}, "tools/gone\n")
	lines, code := guardsSaid([]imports.Guard{guardNamed(t, "script")}, tracked, read)
	if code != exitFailed || !slices.Contains(lines, "script: stale tools/gone") {
		t.Fatalf("the script guard answers %d over %q, not a refusal naming the stale line", code, lines)
	}
}
