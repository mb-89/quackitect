// The bundle verb: esbuild writes the drawing into one script and one style
// sheet under the extension, and a banner names the hash of its sources.
// [[spec/tickets/scripts-folder-leaves]] [[spec/design_output/drawing#the-drawing-ships-prebuilt]]
package main

func init() { registerBox("bundle", bundleVerb) }

// A stub until implement lands the bundle. [[spec/tickets/scripts-folder-leaves]]
func bundleVerb(_ boxDoors, _ []string) int { return 0 }

// The hash of the drawing's sources, a stub until implement lands it. [[spec/tickets/scripts-folder-leaves]]
func drawingStamp(_ string) (string, error) { return "", nil }
