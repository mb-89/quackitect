// The standing verb: what level zero hands the agent every session.
// [[spec/design_output/level0#the-standing-layer]]
package main

import (
	"encoding/json"
	"fmt"
	"io"
	"path/filepath"
	"strings"

	"quackitect/src/index"
	"quackitect/src/modules/hooks/brief"
)

// The key that turns the stop hook off where it reads false. [[spec/design_output/level0#the-canary]]
const stopKey = "stop.enabled"

func init() { register("standing", standingVerb(index.Root, quietBox)) }

// standing over the root, the work root over it where SE_WORK_ROOT names one: the layer with no kind, then the canary. [[spec/design_output/level0#the-standing-layer]]
func standingVerb(root func() (string, error), box func() boxDoors) twin {
	return func(_ []string, _ bool, out, errs io.Writer) int {
		at, err := root()
		if err != nil {
			fmt.Fprintln(errs, err)
			return exitFailed
		}
		hand := box()
		env := hand.env
		if !hand.disk.stands(filepath.Join(at, filepath.FromSlash(brief.Guidance))) {
			fmt.Fprintf(errs, "There is no %s, so nothing is handed over.\n", brief.Guidance)
			return exitUsage
		}
		var tree brief.Tree = rootDisk{at}
		if work := strings.TrimSpace(env(workRootVar)); work != "" && filepath.Clean(work) != filepath.Clean(at) {
			tree = brief.Layered(tree, rootDisk{work})
		}
		layer := brief.LayerFor(tree, env, "")
		if layer == "" {
			fmt.Fprintln(out, "No guidance note carries an Actionables chapter.")
			return 0
		}
		fmt.Fprintf(out, "%s\n\n%s\n", layer, brief.Canary(brief.CountsOf(tree, env), stopOn(at)))
		return 0
	}
}

// Whether the stop hook stands on: every answer but a false one. [[spec/design_output/level0#the-canary]]
func stopOn(root string) bool {
	rows, err := configAt(root)
	if err != nil {
		return true
	}
	var on bool
	return json.Unmarshal(rows[stopKey].Value, &on) != nil || on
}
