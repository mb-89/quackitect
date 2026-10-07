// The plugin-tests part: the kit Claude Code ships runs the plugin's tests, and
// those tests stand at or under the code the hooks entry reaches.
// [[spec/tickets/level0-tests-move-to-plugin-test]]
package main

import (
	"encoding/json"
	"fmt"
	"os"
	"path"
	"path/filepath"
	"strings"

	"quackitect/src/imports"
)

// The plugin's test folder and the manifest naming its hook modules. [[spec/tickets/level0-tests-move-to-plugin-test]]
const (
	pluginTestsDir = pluginDir + "/tests"
	pluginHooksDir = pluginDir + "/hooks"
)

// The kit runs the plugin's tests, and a box with no claude says so and carries on. The test lines then stand at or under the lines the hooks entry reaches. [[spec/tickets/level0-tests-move-to-plugin-test]]
func pluginTestsHold(d checkDoors) int {
	code, said, err := d.run([]string{"claude", "plugin", "test", filepath.FromSlash(pluginDir)}, nil, true)
	if err != nil {
		fmt.Fprintln(d.out, "claude stands nowhere, so the plugin's tests go unrun here.")
	} else if code != 0 {
		fmt.Fprintln(d.errs, strings.TrimSpace(said))
		fmt.Fprintln(d.errs, "The kit runs the plugin's tests, and they fail as the above says.")
		return 1
	}
	tests, reached := pluginTestLines(d), hooksReachedLines(d)
	if tests > reached {
		fmt.Fprintf(d.errs, "The plugin's tests hold %d lines, past the %d lines the hooks entry reaches. Cut the tests to the code.\n", tests, reached)
		return 1
	}
	return 0
}

// The lines of every file under the plugin's test folder. [[spec/tickets/level0-tests-move-to-plugin-test]]
func pluginTestLines(d checkDoors) int {
	// level0: Impure - it walks the plugin's test folder on the disk
	lines := 0
	_ = filepath.WalkDir(d.at(pluginTestsDir), func(at string, entry os.DirEntry, err error) error {
		if err == nil && !entry.IsDir() {
			text, _ := os.ReadFile(at)
			lines += imports.TextLines(string(text))
		}
		return nil
	})
	return lines
}

// The lines of every file the modules the hooks manifest names reach through relative imports. [[spec/tickets/level0-tests-move-to-plugin-test]]
func hooksReachedLines(d checkDoors) int {
	var manifest struct {
		Modules []string `json:"modules"`
	}
	if json.Unmarshal([]byte(d.text(pluginHooksDir+"/hooks.json")), &manifest) != nil {
		return 0
	}
	entries := make([]string, 0, len(manifest.Modules))
	for _, one := range manifest.Modules {
		entries = append(entries, path.Join(pluginHooksDir, one))
	}
	return imports.ReachedLines(entries, d.text)
}
