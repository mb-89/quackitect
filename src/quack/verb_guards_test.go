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
	if code != 0 || !strings.Contains(joined, "a") || !strings.Contains(joined, "c") || slices.ContainsFunc(lines, func(one string) bool { return strings.HasSuffix(one, " b") }) {
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

func TestTheGuardsRefuseAnswersOneOverANewOffender(t *testing.T) {
	t.Parallel()
	if _, code := guardsSaid(plantedGuard(true), nil, baselineReads); code != 1 {
		t.Fatalf("a refusing guard over a new offender answers %d", code)
	}
}
