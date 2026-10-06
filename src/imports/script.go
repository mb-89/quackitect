// The script guard: a tracked script standing outside the engine.
// [[spec/design_output/model#the-guards-hold-a-baseline]]
package imports

// The marker sparing a script outside the engine, with its reason. [[spec/design_output/model#the-guards-hold-a-baseline]]
const scriptMarker = "level0: HandScript - "

// Each tracked script outside the engine carrying no marker, sorted. [[spec/design_output/model#the-guards-hold-a-baseline]]
func HandScripts(tracked []string, read func(path string) string) []string {
	return nil
}
