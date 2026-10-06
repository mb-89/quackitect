// quack branch: the branch verbs in Go, registered from this file, over the
// doors the box gives them. The package src/branches answers every verb.
// [[spec/tickets/work-verbs-port-to-go]]
package main

import (
	"encoding/json"
	"io"
	"path/filepath"
	"strings"
	"time"

	"quackitect/src/branches"
	"quackitect/src/config"
	"quackitect/src/index"
)

func init() { register("branch", branchVerb(index.Root, reachV1)) }

// branch off the doors over the root and the index, every word past the verb handed to the package. [[spec/tickets/work-verbs-port-to-go]]
func branchVerb(root func() (string, error), v1 func() (string, error)) twin {
	return func(argv []string, _ bool, out, errs io.Writer) int {
		return branches.Branch(branchDoors(root, v1, out, errs), argv[1:])
	}
}

// The doors a branch or cloud verb runs behind: the work root over the method root, the clock, the config, the session log, the queue and the index's values. [[spec/design_output/vehicle#the-work-root-inherits]]
func branchDoors(root func() (string, error), v1 func() (string, error), out, errs io.Writer) *branches.Doors {
	method, err := root()
	if err != nil {
		method = "."
	}
	box := realBoxDoors(out, errs)
	work := method
	if at := strings.TrimSpace(box.env(workRootVar)); at != "" {
		work = at
	}
	return &branches.Doors{
		Root:   work,
		Method: method,
		Now:    time.Now,
		Out:    out,
		Errs:   errs,
		Log: func(level, kind, said string, more map[string]any) {
			row := map[string]any{"level": level, "kind": kind, "said": said}
			for key, value := range more {
				row[key] = value
			}
			_ = appendsRow(box.disk, work, time.Now)(row)
		},
		Config: func(key string) any {
			said, _ := config.Value(work, key)
			return said
		},
		Runme: selfRoad(method),
		Queue: func() int { return branchQueue(v1)([]string{"branch", "list", "--queue"}, false, out, errs) },
		Value: func(name string, into any) error {
			base, err := v1()
			if err != nil {
				return err
			}
			var said struct {
				Value json.RawMessage `json:"value"`
			}
			if err := reads(base+"/values/"+name, &said); err != nil {
				return err
			}
			return json.Unmarshal(said.Value, into)
		},
		Guidance: func() (map[string][]string, error) {
			return guidanceRows(box.disk, method, vehicleEnv(box.environ()))
		},
	}
}

// The road a verb runs another verb by: this binary's verb road over the scripts folder, as RUNME.sh hands it past the install, or RUNME.sh where the binary names no path. [[spec/tickets/the-verbs-need-no-wrapper]]
func selfRoad(method string) []string {
	if self, err := selfPath(); err == nil {
		return []string{self, "verb", filepath.Join(method, "src", "scripts")}
	}
	return []string{"sh", filepath.Join(method, "RUNME.sh")}
}
