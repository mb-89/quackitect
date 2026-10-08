// The setup verb: the install's steps past the binaries, which install.sh
// hands to the index last. Each item stands a want, so a miss names what the
// box loses and the setup goes on. It starts npm, npx and code, and no node.
// [[spec/tickets/install-drops-node]] [[spec/tickets/box-verbs-port-to-go]]
package main

import (
	"fmt"
	"path/filepath"
	"slices"
	"strings"

	"quackitect/src/modules/check"
)

// The exit cmd answers where the command it runs stands nowhere. [[spec/tickets/windows-missing-code-reads-absent]]
const cmdMissing = 9009

// The programs Windows ships as cmd shims. [[spec/tickets/setup-reaches-windows-shims]]
var setupShims = []string{"npm", "npx", "code"}

// The extensions the tracked settings point at. [[spec/design_output/lsp#the-panel-reads-the-battery]]
var editorExtensions = check.Extensions

// One want of the setup: its name, why a box wants it, whether it stands, how to get it, and what a miss costs. [[spec/tickets/install-drops-node]]
type setupItem struct {
	want   string
	why    string
	here   func(d boxDoors) bool
	get    func(d boxDoors) bool
	missed string
}

// The setup's wants, in the order it gets them. install.test.js reads each want off this list. [[spec/tickets/install-drops-node]]
var setupItems = []setupItem{
	{
		want: "editor-client",
		why:  "editor-client: the language client the extension starts the server through",
		here: func(d boxDoors) bool {
			return d.disk.stands(filepath.Join(d.root, "src", "extension", "node_modules", "vscode-languageclient"))
		},
		get: func(d boxDoors) bool {
			say(d, "  installing the language client")
			return setupRan(d, []string{"npm", "install", "--no-audit", "--no-fund", "--silent"}, false, "src", "extension")
		},
		missed: "  no language client here, so the editor draws no server line.",
	},
	{
		want: "browser",
		why:  "browser: the chromium the drawing's test drives",
		here: func(d boxDoors) bool {
			path, _ := browserFrom(d.disk, d.env, d.goos == "darwin")
			return path != ""
		},
		get: func(d boxDoors) bool {
			say(d, "  downloading chromium through playwright")
			return setupRan(d, []string{"npx", "--yes", "playwright-core", "install", "chromium"}, false, "src", "extension", "webview")
		},
		missed: "  no browser here, so the check skips the drawing's test.",
	},
	{
		want: "editor-link",
		why:  "editor-link: this tree's own sidebar, linked into the editor and named in its list",
		here: func(d boxDoors) bool { return !editorHere(d) || editorLink(d, false) },
		get: func(d boxDoors) bool {
			if !editorHere(d) {
				return true
			}
			say(d, "  linking the sidebar into the editor")
			return editorLink(d, true)
		},
		missed: "  the sidebar stays unlinked, so the editor draws no panel here.",
	},
	{
		want: "editor-extensions",
		why:  "editor-extensions: the Biome and Mermaid extensions the tracked settings point at",
		here: func(d boxDoors) bool {
			listed, ok := listedExtensions(d)
			if !ok {
				return true
			}
			for _, id := range editorExtensions {
				if !slices.Contains(listed, strings.ToLower(id)) {
					return false
				}
			}
			return true
		},
		get: func(d boxDoors) bool {
			if _, ok := listedExtensions(d); !ok {
				return true
			}
			for _, id := range editorExtensions {
				say(d, "  installing "+id)
				if !setupRan(d, []string{"code", "--install-extension", id, "--force"}, true) {
					return false
				}
			}
			return true
		},
		missed: "  no code on the PATH, so a person takes the recommendation.",
	},
}

func init() { registerBox("setup", setupVerb) }

// Gets each missing want SE_INSTALL_SKIP leaves in, then writes the survey, the Copilot registrations and the brand, and answers zero. [[spec/tickets/install-drops-node]]
func setupVerb(d boxDoors, argv []string) int {
	skipped := strings.Fields(d.env("SE_INSTALL_SKIP"))
	var missing []setupItem
	for _, one := range setupItems {
		if !slices.Contains(skipped, one.want) && !one.here(d) {
			missing = append(missing, one)
		}
	}
	for _, one := range missing {
		say(d, one.why)
		one.get(d)
		if !one.here(d) {
			say(d, one.missed)
		}
	}
	landed := slices.Contains(argv, "--landed") || len(missing) > 0
	if landed || !d.disk.stands(filepath.Join(d.root, filepath.FromSlash(toolsFile))) {
		if _, err := writeSurvey(d); err != nil {
			say(d, "  the survey wrote no tools.json, so every caller guesses again.")
		}
	}
	// [[spec/design_output/copilot#setup-and-discovery]]
	if !setupCopilot(d, slices.Contains(argv, "--cloud")) {
		say(d, "  the copilot setup stopped, so the files it writes stand as they stood.")
	}
	// [[spec/design_output/vehicle#the-brand-a-vehicle-stamps]]
	if !setupBrand(d) {
		say(d, "  the brand reached no name, so the marketplace keeps the one it holds.")
	}
	return 0
}

// Says one line to the caller. [[spec/tickets/install-drops-node]]
func say(d boxDoors, line string) { fmt.Fprintln(d.out, line) }

// Whether a home folder stands with the editor's extensions folder under it. [[spec/design_output/extension#a-box-names-its-home]]
func editorHere(d boxDoors) bool {
	home := homeOf(d.env)
	return home != "" && d.disk.stands(filepath.Join(home, ".vscode", "extensions"))
}

// The extensions the editor lists, lowercased, and false where no code stands. A code exiting past zero lists none. [[spec/tickets/code-failure-reads-missing]]
func listedExtensions(d boxDoors) ([]string, bool) {
	ran := d.run(shimmed(d, []string{"code", "--list-extensions"}), runOpts{cwd: d.root})
	switch {
	case ran.missing, d.windows() && ran.code == cmdMissing:
		return nil, false
	case ran.code != 0:
		return []string{}, true
	}
	var listed []string
	for _, one := range strings.Split(strings.ToLower(ran.stdout), "\n") {
		listed = append(listed, strings.TrimSpace(one))
	}
	return listed, true
}

// Whether a run under the tree exits zero, writing to the caller's streams unless quiet. [[spec/tickets/install-drops-node]]
func setupRan(d boxDoors, argv []string, quiet bool, under ...string) bool {
	ran := d.run(shimmed(d, argv), runOpts{cwd: filepath.Join(append([]string{d.root}, under...)...), inherit: !quiet})
	return ran.code == 0 && !ran.missing
}

// Windows ships npm, npx and code as cmd shims, which a start with no shell reaches through cmd alone. [[spec/tickets/setup-reaches-windows-shims]]
func shimmed(d boxDoors, argv []string) []string {
	if d.windows() && slices.Contains(setupShims, argv[0]) {
		return append([]string{"cmd", "/c"}, argv...)
	}
	return argv
}

// Writes the Copilot registrations where Copilot runs here, or with the cloud mark under cloud, saying the files it writes, and answers whether it held. [[spec/tickets/copilot-hooks-run-in-go]]
func setupCopilot(d boxDoors, cloud bool) bool {
	target := "auto"
	if cloud {
		target = "cloud"
	}
	written, err := copilotSetup(d, target)
	if err != nil {
		fmt.Fprintln(d.errs, "Level zero: "+err.Error())
		return false
	}
	if len(written) > 0 {
		say(d, "Copilot: "+strings.Join(written, ", "))
	}
	return true
}

// Stamps the brand the tree's folder names, saying each target it writes, and answers whether a brand landed. [[spec/design_output/vehicle#the-brand-a-vehicle-stamps]]
func setupBrand(d boxDoors) bool {
	brand := brandOf(d.root)
	if brand == "" {
		fmt.Fprintln(d.errs, emptyBrand(d.root))
		return false
	}
	done, err := stamps(d.disk, d.root, brand)
	for _, one := range done {
		say(d, "  "+one+" reads "+brand)
	}
	if err != nil {
		fmt.Fprintln(d.errs, err)
		return false
	}
	return true
}
