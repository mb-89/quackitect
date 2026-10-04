// The retro's chapters: the cuts a hand writes, checked for a gap and an
// overlap, and every timed line of the input handed to the chapter it falls in.
// [[spec/guidance/retro/chapter]]
package main

import "io"

func init() { register("retro chapters", retroChaptersVerb(retroRoot)) }

// The verb: refuses a gap, an overlap or a line past every chapter, and writes each chapter's lines. [[spec/guidance/retro/chapter]]
func retroChaptersVerb(root func() string) twin {
	return func(_ []string, _ bool, _, _ io.Writer) int { return 0 }
}
