// The guards over the tree's source, each with the baseline it reads.
// [[spec/design_output/model#the-guards-hold-a-baseline]]
package imports

// A guard: its name, whether it refuses, and the offenders it names over the tracked files. [[spec/design_output/model#the-guards-hold-a-baseline]]
type Guard struct {
	Name    string
	Refuses bool
	Names   func(tracked []string, read func(path string) string) []string
}

// What a guard names against its baseline: the offenders past it, and the lines it no longer names. [[spec/design_output/model#the-guards-hold-a-baseline]]
type Verdict struct {
	New, Stale []string
}

// Every guard the guards verb runs. [[spec/design_output/model#the-guards-hold-a-baseline]]
var Guards = []Guard{}

// The baseline a guard reads, one offender a line. [[spec/design_output/model#the-guards-hold-a-baseline]]
func BaselineOf(guard string) string { return "" }

// The offenders past the baseline, and the baseline lines the guard no longer names, each sorted. [[spec/design_output/model#the-guards-hold-a-baseline]]
func Compare(baseline, named []string) Verdict {
	return Verdict{}
}
