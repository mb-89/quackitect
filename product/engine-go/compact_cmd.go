package main

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"
)

// design: go-compact-cmd  implements: req-iterations-compacted
// The CLI verb for the compactor: `quack compact <iteration>` folds ONE shipped
// iteration into its archive.md (compactIteration does the work and enforces the
// refusals). The ACTIVE iteration is refused outright — only shipped history
// compacts. Ledger truth is untouched by construction (verbatim payloads), so the
// verb is not attest-gated; the battery around a batch is the safety net.
func cmdCompact(rest []string) {
	args := []string{}
	for _, a := range rest {
		if !strings.HasPrefix(a, "--") {
			args = append(args, a)
		}
	}
	if len(args) != 1 {
		fmt.Fprintln(os.Stderr, "usage: "+brand()+" compact <iteration>   (one shipped iteration -> archive.md)")
		os.Exit(2)
	}
	iter := args[0]
	if iter == readProjectConfig().Version {
		fmt.Fprintln(os.Stderr, "compact: "+iter+" is the ACTIVE iteration - only shipped history compacts")
		os.Exit(1)
	}
	dir := filepath.Join(SPEC, "iterations", iter)
	before := countFilesUnder(dir)
	if err := compactIteration(SPEC, iter); err != nil {
		fmt.Fprintln(os.Stderr, err.Error())
		os.Exit(1)
	}
	fmt.Printf("compacted %s: %d files -> %d (archive.md + evidence docs)\n", iter, before, countFilesUnder(dir))
}

func countFilesUnder(dir string) int {
	n := 0
	filepath.Walk(dir, func(path string, fi os.FileInfo, err error) error {
		if err == nil && fi != nil && !fi.IsDir() {
			n++
		}
		return nil
	})
	return n
}

func init() { registerCmd("compact", cmdCompact) }

// enddesign
