// The guards over the tree's source, each with the baseline it reads.
// [[spec/design_output/model#the-guards-hold-a-baseline]]
package imports

import (
	"path"
	"slices"
	"strings"
)

// The folder the baselines stand in. [[spec/design_output/model#the-guards-hold-a-baseline]]
const baselineFolder = "src/imports/baseline/"

// A guard: its name, whether it refuses, and the offenders it names over the tracked files. [[spec/design_output/model#the-guards-hold-a-baseline]]
type Guard struct {
	Name    string
	Refuses bool
	Names   func(tracked []string, read func(path string) string) []string
	// The package an offender stands in, which a report counts by, or nil where the guard names packages itself.
	PackageOf func(offender string) string
}

// What a guard names against its baseline: the offenders past it, and the lines it no longer names. [[spec/design_output/model#the-guards-hold-a-baseline]]
type Verdict struct {
	New, Stale []string
}

// Every guard the guards verb runs. [[spec/design_output/model#the-guards-hold-a-baseline]]
var Guards = []Guard{
	{Name: "blackbox", Names: inPackageTracked, PackageOf: path.Dir},
	{Name: "fixture", Names: fixturesTracked, PackageOf: fixturePackage},
	{Name: "ratio", Names: RatioOffenders},
	{Name: "script", Names: HandScripts},
	{Name: "purity", Names: purityTracked, PackageOf: fixturePackage},
}

// The baseline a guard reads, one offender a line. [[spec/design_output/model#the-guards-hold-a-baseline]]
func BaselineOf(guard string) string { return baselineFolder + guard + ".txt" }

// The offenders past the baseline, and the baseline lines the guard no longer names, each sorted. [[spec/design_output/model#the-guards-hold-a-baseline]]
func Compare(baseline, named []string) Verdict {
	kept := map[string]bool{}
	for _, line := range baseline {
		kept[keyOf(line)] = true
	}
	names := map[string]bool{}
	verdict := Verdict{New: []string{}, Stale: []string{}}
	for _, one := range named {
		names[keyOf(one)] = true
		if !kept[keyOf(one)] {
			verdict.New = append(verdict.New, one)
		}
	}
	for _, line := range baseline {
		if !names[keyOf(line)] {
			verdict.Stale = append(verdict.Stale, line)
		}
	}
	slices.Sort(verdict.New)
	slices.Sort(verdict.Stale)
	return verdict
}

// The text an offender keys on: the part before a tab, so a count riding behind it moves without making the line new. [[spec/design_output/model#the-guards-hold-a-baseline]]
func keyOf(line string) string {
	key, _, _ := strings.Cut(line, "\t")
	return key
}
