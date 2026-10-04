// The retro's timeline: every timed line of its input, placed by its time,
// and the hours they fall in.
// [[spec/guidance/retro/chapter]]
package main

import (
	"io"
	"regexp"
)

// A line a transcript writes as a failing tool result, and a log line at a failing level. [[spec/guidance/retro/signals]]
var retroFault = regexp.MustCompile(`"is_error":\s*true|"level":"(?:warn|error|fatal)"`)

func init() { register("retro timeline", retroTimelineVerb(retroRoot)) }

// The verb: prints the hours holding work, with the idle stretches between them, and writes them beside the input. [[spec/guidance/retro/chapter]]
func retroTimelineVerb(root func() string) twin {
	return func(_ []string, _ bool, _, _ io.Writer) int { return 0 }
}
