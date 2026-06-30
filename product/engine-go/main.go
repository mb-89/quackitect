// quack — the determinizer engine, Go port (i0003). One static, dependency-free binary.
package main

import "os"

// design: go-binary  implements: req-go-engine
// The engine is one statically-linked Go binary (CGO disabled), built from this module and
// cross-compiled from a single machine. Zero runtime dependencies; nothing fetched at run time.
func main() { Dispatch(stripBase(os.Args[1:])) }

// stripBase removes the --base/-C <path> workspace selector from the args before command dispatch
// (it is consumed by findRoot at init, not a command). Everything else passes through untouched.
func stripBase(args []string) []string {
	out := make([]string, 0, len(args))
	for i := 0; i < len(args); i++ {
		if (args[i] == "--base" || args[i] == "-C") && i+1 < len(args) {
			i++ // skip the flag and its value
			continue
		}
		out = append(out, args[i])
	}
	return out
}

// enddesign
