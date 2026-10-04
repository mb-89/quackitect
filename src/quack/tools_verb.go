// The tools verb: asks this box where every tool stands, and writes it down.
// [[spec/design_output/tools#where-a-caller-looks]]
package main

import "fmt"

// The width a tool's name pads to, as the doctor pads its rows. [[spec/design_output/tools#where-a-caller-looks]]
const toolColumn = 18

func init() { registerBox("tools", toolsVerb) }

// Surveys the box, writes the file, and prints one row a tool. [[spec/design_output/tools#where-a-caller-looks]]
func toolsVerb(d boxDoors, _ []string) int {
	found, err := writeSurvey(d)
	if err != nil {
		fmt.Fprintln(d.errs, err)
		return exitFailed
	}
	for _, one := range wantedTools {
		fmt.Fprintf(d.out, "%-*s %s\n", toolColumn, one.name, standsAt(found[one.name]))
	}
	fmt.Fprintf(d.out, "\n%s says this, and every caller reads it.\n", toolsFile)
	return 0
}
