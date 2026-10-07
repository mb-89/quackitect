// The hook verb: answers the git hooks and the Copilot hooks out of Go, so a
// commit, a push and a Copilot call need no Node. A git event prints its
// refusal and exits one, and a Copilot event prints its reply and exits zero.
// [[spec/tickets/git-hooks-run-in-go]] [[spec/tickets/copilot-hooks-run-in-go]]
package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"time"

	"quackitect/src/index"
	"quackitect/src/modules/hooks"
)

// The verb's usage, the git events it answers, the key the stale span stands under, and the variables naming an agent's push. [[spec/tickets/git-hooks-run-in-go]]
const (
	hookUsage     = "Usage: se-index hook <pre-commit|pre-push|SessionStart|PreToolUse|PostToolUse|Stop>"
	preCommit     = "pre-commit"
	prePush       = "pre-push"
	staleAfterKey = "work.staleAfter"
	beatAfterKey  = "work.beatAfter"
	engineVar     = "SE_ENGINE"
	claudeVar     = "CLAUDECODE"
)

// The span a Copilot hook waits on the hooks door, the address it posts to, the row kind it writes, and the head of a fault it answers. [[spec/tickets/copilot-hooks-run-in-go]]
const (
	copilotWait    = 20 * time.Second
	copilotAddress = "http://127.0.0.1:%d/hook"
	copilotKind    = "copilot"
	copilotFault   = "Level zero: "
)

// The Copilot events the registrations name, which the verb answers beside the git hooks. [[spec/tickets/copilot-hooks-run-in-go]]
var copilotEvents = map[string]bool{"SessionStart": true, "PreToolUse": true, "PostToolUse": true, "Stop": true}

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
	surface := hooks.VSCodeSurface
	if copilotCloudAt(root, os.Getenv) {
		surface = hooks.CloudSurface
	}
	rows, _ := configAt(root)
	return hookDoors{
		root: root, cloud: commandSettings(root).Cloud, env: os.Getenv, stdin: os.Stdin, now: time.Now,
		copilot: surface, ask: hookAsk(root, copilotWait), log: logsRow(root, configWord(rows, "log.level")),
	}
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
func hookAsk(root string, wait time.Duration) func(hooks.Post) (hooks.Answer, error) {
	return func(post hooks.Post) (hooks.Answer, error) {
		var standing hooks.Standing
		text, err := os.ReadFile(filepath.Join(root, filepath.FromSlash(hooks.StandingFile)))
		if err == nil {
			err = json.Unmarshal(text, &standing)
		}
		if err != nil {
			return hooks.Answer{}, err
		}
		body, _ := json.Marshal(post)
		status, said, err := realPost(fmt.Sprintf(copilotAddress, standing.Port), standing.Token, string(body), wait)
		if err == nil && (status < http.StatusOK || status >= http.StatusMultipleChoices) {
			err = fmt.Errorf("the hooks door answers %d", status)
		}
		var answer hooks.Answer
		if err == nil {
			err = json.Unmarshal([]byte(said), &answer)
		}
		return answer, err
	}
}

// Answers one Copilot event: posts each call it stands for, prints the reply, writes one copilot row, and exits zero. A fault prints the reply failureOf answers and a line on stderr, so a broken hook still denies. [[spec/tickets/copilot-hooks-run-in-go]]
func copilotHook(d hookDoors, name string, out, errs io.Writer) int {
	event := hooks.CopilotEvent{Event: name, Surface: d.copilot}
	result, err := copilotAnswer(d, name, &event)
	if err != nil {
		reason := copilotFault + err.Error()
		fmt.Fprintln(errs, reason)
		result = hooks.FailureOf(event, reason)
	}
	var reply bytes.Buffer
	prints := json.NewEncoder(&reply)
	prints.SetEscapeHTML(false)
	_ = prints.Encode(hooks.ReplyOf(event, result))
	fmt.Fprint(out, reply.String())
	return 0
}

// The result one event answers off the door, with the event read off stdin kept for the fault's reply, and the row it writes. [[spec/tickets/copilot-hooks-run-in-go]]
func copilotAnswer(d hookDoors, name string, event *hooks.CopilotEvent) (hooks.CopilotResult, error) {
	var input map[string]any
	text, err := io.ReadAll(d.stdin)
	if err == nil {
		err = json.Unmarshal(text, &input)
	}
	if err != nil {
		return hooks.CopilotResult{}, err
	}
	read, err := hooks.EventOf(input, name, d.copilot)
	if err != nil {
		return hooks.CopilotResult{}, err
	}
	*event = read
	result, err := hooks.CopilotAnswers(read, d.ask, copilotReader(d.root), d.root)
	if err != nil {
		return result, err
	}
	level, said := "info", "complete"
	for _, one := range []string{result.Deny, result.Block, result.Failed} {
		if one != "" {
			level, said = "warn", one
			break
		}
	}
	return result, d.log(level, copilotKind, read.Event+": "+said, map[string]any{"session": read.Session, "tool": read.Tool})
}

// The read of a file an edit names, under the root where the path stands relative. [[spec/tickets/copilot-hooks-run-in-go]]
func copilotReader(root string) func(path string) (string, error) {
	return func(path string) (string, error) {
		if !filepath.IsAbs(path) {
			path = filepath.Join(root, filepath.FromSlash(path))
		}
		text, err := os.ReadFile(path)
		return string(text), err
	}
}

// The hook verb over the doors. [[spec/tickets/git-hooks-run-in-go]]
func hookVerb(d hookDoors) twin {
	return func(argv []string, _ bool, out, errs io.Writer) int {
		event := ""
		if len(argv) > 1 {
			event = argv[1]
		}
		if copilotEvents[event] {
			return copilotHook(d, event, out, errs)
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
