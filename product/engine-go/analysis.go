package main

import (
	"os"
	"os/exec"
	"path/filepath"
	"strings"
)

// design: go-build-analysis  implements: req-go-analysis
// The build gate runs the stdlib analyzers - gofmt -l (format debt) and go vet
// (correctness) - and fails on findings (adr-go-analysis-stdlib-first). Zero new
// dependencies: both ride the toolchain the build already requires. staticcheck
// joins grab-if-present when found on PATH; its absence is never an error.
func buildAnalysisFindings(dir string) []string {
	var finds []string
	if out, err := exec.Command("gofmt", "-l", dir).Output(); err == nil {
		for _, f := range strings.Split(strings.TrimSpace(string(out)), "\n") {
			if f != "" {
				finds = append(finds, "gofmt: "+f)
			}
		}
	}
	if _, err := os.Stat(filepath.Join(dir, "go.mod")); err != nil {
		return finds // vet and staticcheck need a module; format-only outside one (fixtures)
	}
	vet := exec.Command("go", "vet", ".")
	vet.Dir = dir
	if out, err := vet.CombinedOutput(); err != nil {
		for _, l := range strings.Split(strings.TrimSpace(string(out)), "\n") {
			if l != "" && !strings.HasPrefix(l, "#") {
				finds = append(finds, "vet: "+l)
			}
		}
	}
	if sc, err := exec.LookPath("staticcheck"); err == nil {
		c := exec.Command(sc, ".")
		c.Dir = dir
		if out, err := c.CombinedOutput(); err != nil {
			for _, l := range strings.Split(strings.TrimSpace(string(out)), "\n") {
				if l != "" {
					finds = append(finds, "staticcheck: "+l)
				}
			}
		}
	}
	return finds
}

// enddesign
