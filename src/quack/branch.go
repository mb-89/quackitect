// quack branch: the branch verbs in Go, registered from this file, over the
// doors the box gives them. The package src/branches answers every verb.
// [[spec/tickets/work-verbs-port-to-go]]
package main

import (
	"encoding/json"
	"io"
	"path/filepath"
	"strings"

	"quackitect/src/branches"
	"quackitect/src/config"
	"quackitect/src/failure"
	"quackitect/src/index"
	"quackitect/src/modules/files"
	"quackitect/src/modules/git"
	"quackitect/src/proc"
)

func init() { register("branch", branchVerb(branchingHere(index.Root, reachV1))) }

// The doors a branch verb runs behind, built for one call's output and errors: the live ones on this box, or fakes in the example harness. [[spec/design_output/examples#one-runner-two-drivers]]
type doorsOver func(out, errs io.Writer) *branches.Doors

// The live doors over the root and the index. [[spec/design_output/vehicle#the-work-root-inherits]]
func branchingHere(root func() (string, error), v1 func() (string, error)) doorsOver {
	return func(out, errs io.Writer) *branches.Doors { return branchDoors(root, v1, out, errs) }
}

// branch off the doors it takes, every word past the verb handed to the package. [[spec/tickets/work-verbs-port-to-go]]
func branchVerb(doors doorsOver) twin {
	return func(argv []string, _ bool, out, errs io.Writer) int {
		return branches.Branch(doors(out, errs), argv[1:])
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
		Root:    work,
		Method:  method,
		Repo:    git.NewRepo(work, proc.Real),
		Run:     proc.Real,
		Disk:    files.NewDisk(work),
		Methods: files.NewDisk(method),
		Now:     wall.Now,
		Out:     out,
		Errs:    errs,
		Log: func(level, kind, said string, more map[string]any) {
			row := map[string]any{"level": level, "kind": kind, "said": said}
			for key, value := range more {
				row[key] = value
			}
			_ = appendsRow(box.disk, work, wall.Now)(row)
		},
		Config: func(key string) any {
			said, _ := config.Value(work, key)
			return said
		},
		Runme:    selfRoad(method),
		Failures: failure.Load(failure.Dir{Root: method}),
		Send:     httpSend,
		Queue:    func() int { return branchQueue(v1)([]string{"branch", "list", "--queue"}, false, out, errs) },
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
func selfRoad(method string) []string { return selfRoadOver(selfPath, method) }

// The verb road off the binary the self answers, or RUNME.sh where it names none. [[spec/tickets/quack-spawns-all-take-the-runner]]
func selfRoadOver(binary func() (string, error), method string) []string {
	if self, err := binary(); err == nil {
		return []string{self, "verb", filepath.Join(method, "src", "scripts")}
	}
	return []string{"sh", filepath.Join(method, "RUNME.sh")}
}
