package main

import (
	"encoding/json"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"quackitect/engine/internal/quiet"
)

// WHERE THIS BOX IS, READ OFF ONE TABLE.
//
// The cage asks util/cage/hosts.json through util/cage/host.mjs, and this is
// the engine's reading of the same file. Two readers of one table can only
// disagree by reading it wrong, which is a smaller thing than two tables.
//
// A cloud box is one nobody sits beside. The tree was cloned cold, nothing in
// .bin travelled, and the only way a person learns what happened there is
// whatever the agent carries out. So the record says where it was written,
// and the diagnosis below is how the box explains itself.

// Host is where this box is, and which variable said so.
type Host struct {
	Cloud   bool   `json:"cloud"`
	Harness string `json:"harness"`
	Because string `json:"because"`
	Says    string `json:"says"`
}

type hostTable struct {
	Clouds []struct {
		Harness string `json:"harness"`
		Env     string `json:"env"`
		Is      string `json:"is"`
		Says    string `json:"says"`
	} `json:"clouds"`
}

// TheHost answers off the table under the method root. A table that cannot
// be read answers a desk, and says why, because the worse mistake is a box
// that believes it is in the cloud and starts fetching branches on a desk.
func TheHost(method string) Host {
	b, err := os.ReadFile(filepath.Join(method, "util", "cage", "hosts.json"))
	if err != nil {
		return Host{Because: "util/cage/hosts.json could not be read: " + err.Error(),
			Says: "a box with a person beside it"}
	}
	var t hostTable
	if err := json.Unmarshal(b, &t); err != nil {
		return Host{Because: "util/cage/hosts.json does not read: " + err.Error(),
			Says: "a box with a person beside it"}
	}
	named := ""
	for i, c := range t.Clouds {
		if os.Getenv(c.Env) == c.Is {
			return Host{Cloud: true, Harness: c.Harness, Because: c.Env + "=" + c.Is, Says: c.Says}
		}
		if i > 0 {
			named += ", "
		}
		named += c.Env
	}
	return Host{Because: "none of " + named + " is set", Says: "a box with a person beside it"}
}

// Diagnose writes a diagnosis of this box and prints it, and answers the exit
// code of the program that did.
//
// THE DIAGNOSIS IS MEASURED AND NOT REASONED. An agent on a lane-less cloud box
// read the lane's source and explained a failure the source no longer had, and
// a fix was built on that reading. So the script asks the box what is there:
// the commit against origin, the built programs against their source, the
// engine's own answer, the lane's log under .se/lane.out, and the network. It
// lives in util/cage/diagnose.mjs so a tree with nothing built can run it
// with node alone, and this flag is the same call through the engine, which is
// the one program the write gate lets a shell run.
func Diagnose(r Roots) int {
	script := filepath.Join(r.Method, "util", "cage", "diagnose.mjs")
	cmd := quiet.Quietly(exec.Command("node", script, "--method", r.Method, "--work", r.Work))
	cmd.Dir = r.Work
	cmd.Stdout, cmd.Stderr, cmd.Stdin = os.Stdout, os.Stderr, nil
	if err := cmd.Run(); err != nil {
		if exit, ok := err.(*exec.ExitError); ok {
			return exit.ExitCode()
		}
		fmt.Fprintln(os.Stderr, "quackitect: the diagnosis could not run:", err)
		return 1
	}
	return 0
}
