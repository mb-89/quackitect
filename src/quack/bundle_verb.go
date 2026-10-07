// The bundle verb: esbuild writes the drawing into one script and one style
// sheet under the extension, and a banner names the hash of its sources.
// [[spec/tickets/scripts-folder-leaves]] [[spec/design_output/drawing#the-drawing-ships-prebuilt]]
package main

import (
	"fmt"
	"io/fs"
	"maps"
	"os"
	"path/filepath"
	"slices"
	"strings"

	"quackitect/src/index"
)

func init() { registerBox("bundle", bundleVerb) }

// The webview, its entry under it, the lock naming its modules, the shipped script and the banner opening it. [[spec/design_output/drawing#the-drawing-ships-prebuilt]]
const (
	drawingWebview = "src/extension/webview"
	drawingEntry   = "route/drawing.js"
	drawingLock    = "package-lock.json"
	drawingOut     = "src/extension/drawing/route.mjs"
	drawingBanner  = "// sources "
)

// Bundles the drawing, or under here answers 0 where the shipped banner names the stamp the sources give now. [[spec/tickets/scripts-folder-leaves]]
func bundleVerb(d boxDoors, argv []string) int {
	stamp, err := drawingStamp(d.root)
	if err != nil {
		fmt.Fprintln(d.errs, err)
		return 1
	}
	if len(argv) > 0 && argv[0] == "here" {
		shipped, err := os.ReadFile(filepath.Join(d.root, filepath.FromSlash(drawingOut)))
		if err != nil || strings.SplitN(string(shipped), "\n", 2)[0] != drawingBanner+stamp {
			return 1
		}
		return 0
	}
	webview := filepath.Join(d.root, filepath.FromSlash(drawingWebview))
	if !stands(filepath.Join(webview, "node_modules", "esbuild", "package.json")) {
		fmt.Fprintln(d.errs, "esbuild stands nowhere under "+drawingWebview+": run npm install there, then ./RUNME.sh bundle again.")
		return 1
	}
	out, _ := filepath.Rel(webview, filepath.Join(d.root, filepath.FromSlash(drawingOut)))
	ran := d.run(shimmed(d, []string{"npx", "--no-install", "esbuild", drawingEntry,
		"--bundle", "--minify", "--format=iife", "--jsx=automatic",
		`--define:process.env.NODE_ENV="production"`, "--banner:js=" + drawingBanner + stamp,
		"--log-level=warning", "--outfile=" + filepath.ToSlash(out)}), runOpts{cwd: webview, inherit: true})
	if ran.code != 0 || ran.missing {
		fmt.Fprintln(d.errs, "esbuild answers "+fmt.Sprint(ran.code)+" "+ran.fault)
		return 1
	}
	return 0
}

// The hash of every file under the entry's folder and the lock, each under its path from the root in forward slashes, as hashText in lib/hash.js reads it, so the shipped banner holds on every box. [[spec/design_output/drawing#the-drawing-ships-prebuilt]]
func drawingStamp(root string) (string, error) {
	webview := filepath.Join(root, filepath.FromSlash(drawingWebview))
	files := []string{filepath.Join(webview, drawingLock)}
	err := filepath.WalkDir(filepath.Join(webview, filepath.Dir(filepath.FromSlash(drawingEntry))), func(at string, entry fs.DirEntry, err error) error {
		if err == nil && !entry.IsDir() {
			files = append(files, at)
		}
		return err
	})
	if err != nil {
		return "", err
	}
	named := map[string]string{}
	for _, at := range files {
		rel, _ := filepath.Rel(root, at)
		named[filepath.ToSlash(rel)] = at
	}
	parts := []string{}
	for _, path := range slices.Sorted(maps.Keys(named)) {
		text, err := os.ReadFile(named[path])
		if err != nil {
			return "", err
		}
		parts = append(parts, path+"\n"+string(text))
	}
	return index.HashText(strings.Join(parts, "\n")), nil
}
