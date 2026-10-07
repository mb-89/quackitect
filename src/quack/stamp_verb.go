// The stamp verb: whether the stamp beside a binary the install builds holds
// the hash of the source its build reads, and the write of that stamp.
// [[spec/tickets/scripts-folder-leaves]] [[spec/design_output/lsp#the-build-beside-the-index]]
package main

import (
	"fmt"
	"os"
	"path/filepath"
	"slices"
	"strings"

	"quackitect/src/index"
)

func init() { registerBox("stamp", stampVerb) }

// The package each binary the install builds reads. [[spec/design_output/lsp#the-build-beside-the-index]]
var stampPackages = map[string]string{"se-index": "./src/quack", "se-front": "./src/front/cmd"}

// The Go and embedded files of every package of this module the build imports, each under its import path. [[spec/design_output/lsp#the-build-beside-the-index]]
const stampFiles = `{{if and .Module .Module.Main}}{{$p := .ImportPath}}{{range .GoFiles}}{{$p}}/{{.}}
{{end}}{{range .EmbedFiles}}{{$p}}/{{.}}
{{end}}{{end}}`

// Answers fresh with 0 where the stamp holds the hash the source gives now, and write lands that hash. [[spec/tickets/scripts-folder-leaves]]
func stampVerb(d boxDoors, argv []string) int {
	if len(argv) != 2 || (argv[0] != "fresh" && argv[0] != "write") || stampPackages[argv[1]] == "" {
		fmt.Fprintln(d.errs, "stamp answers fresh or write, over se-index or se-front.")
		return 2
	}
	at := filepath.Join(d.root, filepath.FromSlash(binFolder), "."+argv[1]+"-source")
	now, err := sourceStamp(d, stampPackages[argv[1]])
	if err != nil {
		fmt.Fprintln(d.errs, err)
		return 1
	}
	if argv[0] == "fresh" {
		if said, err := os.ReadFile(at); err != nil || strings.TrimSpace(string(said)) != now {
			return 1
		}
		return 0
	}
	if err := os.MkdirAll(filepath.Dir(at), 0o755); err != nil {
		fmt.Fprintln(d.errs, err)
		return 1
	}
	if err := os.WriteFile(at, []byte(now+"\n"), 0o644); err != nil {
		fmt.Fprintln(d.errs, err)
		return 1
	}
	return 0
}

// The hash of every file the package's build reads and the root go.mod and go.sum, each under its path from the root, so every box reads one stamp. [[spec/design_output/lsp#the-build-beside-the-index]]
func sourceStamp(d boxDoors, pkg string) (string, error) {
	module := d.run([]string{"go", "list", "-m"}, runOpts{cwd: d.root})
	if module.code != 0 || module.missing {
		return "", fmt.Errorf("go list -m answers %d: %s", module.code, orElse(module.stderr, module.fault))
	}
	listed := d.run([]string{"go", "list", "-deps", "-f", stampFiles, pkg}, runOpts{cwd: d.root})
	if listed.code != 0 || listed.missing {
		return "", fmt.Errorf("go list -deps answers %d: %s", listed.code, orElse(listed.stderr, listed.fault))
	}
	prefix := strings.TrimSpace(module.stdout) + "/"
	paths := []string{"go.mod", "go.sum"}
	for _, one := range strings.Split(listed.stdout, "\n") {
		if one = strings.TrimSpace(one); one != "" {
			paths = append(paths, strings.TrimPrefix(one, prefix))
		}
	}
	slices.Sort(paths)
	var parts []string
	for _, one := range slices.Compact(paths) {
		if text, err := os.ReadFile(filepath.Join(d.root, filepath.FromSlash(one))); err == nil {
			parts = append(parts, one+"\n"+string(text))
		}
	}
	return index.HashText(strings.Join(parts, "\n")), nil
}
