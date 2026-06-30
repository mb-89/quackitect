// quack — the determinizer engine, Go port (i0003). One static, dependency-free binary.
package main

import "os"

// design: go-binary  implements: req-go-engine
// The engine is one statically-linked Go binary (CGO disabled), built from this module and
// cross-compiled from a single machine. Zero runtime dependencies; nothing fetched at run time.
func main() { Dispatch(os.Args[1:]) }

// enddesign
