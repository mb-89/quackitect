// The hook verb: answers the git hooks out of Go, so a commit and a push need
// no Node. Each event prints its refusal and exits one, or exits zero.
// [[spec/tickets/git-hooks-run-in-go]]
package main

import (
	"fmt"
	"io"
	"os"
	"time"

	"quackitect/src/index"
	"quackitect/src/modules/hooks"
)

// The verb's usage, the git events it answers, the key the stale span stands under, and the variables naming an agent's push. [[spec/tickets/git-hooks-run-in-go]]
const (
	hookUsage     = "Usage: se-index hook <pre-commit|pre-push>"
	preCommit     = "pre-commit"
	prePush       = "pre-push"
	staleAfterKey = "work.staleAfter"
	beatAfterKey  = "work.beatAfter"
	engineVar     = "SE_ENGINE"
	claudeVar     = "CLAUDECODE"
)

func init() {
	register("hook", func(argv []string, dry bool, out, errs io.Writer) int {
		return hookVerb(hookHere())(argv, dry, out, errs)
	})
}

// The doors over this box: the root the index names, the cloud the harness variables say, the process's environment and stdin, and the clock. [[spec/tickets/git-hooks-run-in-go]]
func hookHere() hookDoors {
	root, err := index.Root()
	if err != nil {
		root = "."
	}
	return hookDoors{root: root, cloud: commandSettings(root).Cloud, env: os.Getenv, stdin: os.Stdin, now: time.Now}
}

// The outside the hook verb reads: the root, whether a cloud box runs it, the environment, the text git pipes in, and the clock. [[spec/tickets/git-hooks-run-in-go]]
type hookDoors struct {
	root  string
	cloud bool
	env   func(name string) string
	stdin io.Reader
	now   func() time.Time
	// The Copilot surface a hook answers on, vscode or cloud. [[spec/tickets/copilot-hooks-run-in-go]]
	copilot string
	// The post to the hooks door, which errs where the door answers nothing. [[spec/tickets/copilot-hooks-run-in-go]]
	ask func(post hooks.Post) (hooks.Answer, error)
	// The session log's one row a Copilot event writes. [[spec/tickets/copilot-hooks-run-in-go]]
	log func(level, kind, line string, fields map[string]any) error
	// The run of a program in a folder the down word starts the index with, as serveDoors.run answers it. [[spec/tickets/level0-hooks-forward-to-go]]
	run func(argv []string, cwd string) (int, string, error)
}

// The ask reading the standing file under the root and posting there with its bearer token, within the wait. [[spec/tickets/copilot-hooks-run-in-go]]
func hookAsk(_ string, _ time.Duration) func(hooks.Post) (hooks.Answer, error) {
	return func(hooks.Post) (hooks.Answer, error) { return hooks.Answer{}, nil }
}

// The hook verb over the doors. [[spec/tickets/git-hooks-run-in-go]]
func hookVerb(d hookDoors) twin {
	return func(argv []string, _ bool, _, errs io.Writer) int {
		event := ""
		if len(argv) > 1 {
			event = argv[1]
		}
		door := hooks.New(hooks.Outside{Root: d.root, Git: gitRead})
		settings := commandSettings(d.root)
		settings.Cloud = d.cloud
		said := ""
		switch event {
		case preCommit:
			said = door.PreCommit(d.root, settings)
		case prePush:
			refs, _ := io.ReadAll(d.stdin)
			said = door.PrePush(d.root, hooks.Push{
				Refs: string(refs), Cloud: d.cloud, Agent: agentPushes(d),
				StaleAfter: textSetting(d.root, staleAfterKey), BeatAfter: textSetting(d.root, beatAfterKey), Now: d.now(),
			})
		default:
			said = hookUsage
		}
		if said == "" {
			return 0
		}
		fmt.Fprintln(errs, said)
		return exitFailed
	}
}

// An agent's push: a session the engine runs, a cloud box, or a Claude Code session on a desk. The owner's own terminal pushes ungated. [[spec/tickets/push-gate-needs-the-engine]]
func agentPushes(d hookDoors) bool {
	return d.env(engineVar) == "1" || d.cloud || d.env(claudeVar) != ""
}
