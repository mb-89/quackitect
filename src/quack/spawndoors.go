// The spawns the landing and ticket verbs reach past git: the verb road and the
// branch take through the process door, and claude on the PATH.
// [[spec/design_output/doors#the-process-door]]
package main

import (
	"fmt"
	"path/filepath"
	"strings"

	"quackitect/src/proc"
	"quackitect/src/pull"
)

// A verb through the road the binary answers, run through the process door with both streams on one buffer, so they answer as one text. [[spec/tickets/quack-spawns-all-take-the-runner]]
func roadVerbOver(run proc.Runner, self func() (string, error), root string) func(words ...string) (int, string) {
	return func(words ...string) (int, string) {
		binary, err := self()
		if err != nil {
			return exitFailed, err.Error()
		}
		var both strings.Builder
		said := run(proc.Command{Argv: append([]string{binary, "verb", filepath.Join(root, "src", "scripts")}, words...), Dir: root, Streams: &proc.Streams{Out: &both, Err: &both}})
		if said.Code < 0 {
			return exitFailed, strings.TrimSpace(both.String() + "\n" + said.Err)
		}
		return said.Code, strings.TrimSpace(both.String())
	}
}

// The branch take a cloud box runs on trunk, through the verb road, so the branch verbs answer it wherever they stand, and the index it serves. [[spec/design_output/pull#the-engine-takes-the-branch]]
func takesBranch(scripts, group string, it *pull.It) int {
	return takesBranchOver(proc.Real, selfPath)(scripts, group, it)
}

// The branch take through the process door on the caller's streams, and the index it serves on a cloud box. [[spec/tickets/quack-spawns-all-take-the-runner]]
func takesBranchOver(run proc.Runner, self func() (string, error)) func(scripts, group string, it *pull.It) int {
	return func(scripts, group string, it *pull.It) int {
		binary, err := self()
		if err != nil {
			fmt.Fprintln(it.Err, err)
			return exitFailed
		}
		argv := []string{binary, "verb", scripts, "branch", "take"}
		if group != "" {
			argv = append(argv, group)
		}
		said := run(proc.Command{Argv: argv, Dir: it.Root, Streams: &proc.Streams{Out: it.Out, Err: it.Err}})
		code := said.Code
		if code < 0 {
			fmt.Fprintln(it.Err, said.Err)
			code = exitFailed
		}
		if code != 0 || !it.Cloud {
			return code
		}
		fmt.Fprintln(it.Out, servesHere(it.Root))
		return code
	}
}
