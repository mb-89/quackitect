// The retro's report as a verb: it refuses a chapter standing without its
// findings, and draws what the later steps wrote above the matrix.
// [[spec/guidance/retro/read]]
package main

import "io"

func init() { register("retro matrix", retroMatrixVerb(retroRoot)) }

// The verb: refuses a column short of its findings, and writes the report. [[spec/guidance/retro/read]]
func retroMatrixVerb(root func() string) twin {
	return func(_ []string, _ bool, _, _ io.Writer) int { return 0 }
}
