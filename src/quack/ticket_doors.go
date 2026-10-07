// The doors the ticket verbs reach the outside through: the roots a vehicle
// holds, and git over the work root.
// [[spec/tickets/ticket-verbs-port-to-go]]
package main

import (
	"encoding/json"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"strings"
	"time"

	"quackitect/src/index"
	"quackitect/src/modules/check"
	"quackitect/src/modules/git"
	"quackitect/src/modules/hooks/brief"
	"quackitect/src/proc"
	"quackitect/src/prose"
	"quackitect/src/pull"
)

// The roots a verb reads: the method root the index stands over, and the work root a vehicle names over it. [[spec/design_output/vehicle#the-work-root-inherits]]
func rootsOf(rootOf func() (string, error)) (method, work string, err error) {
	if method, err = rootOf(); err != nil {
		return "", "", err
	}
	if work = strings.TrimSpace(os.Getenv(workRootVar)); work == "" {
		work = method
	}
	return method, work, nil
}

// The real repository under a root. [[spec/design_output/doors#the-git-door-carries-writes]]
func realRepo(root string) git.Repo { return git.NewRepo(root, proc.Real) }

// The repository a registered verb reaches: the real one, which a case stands a FakeRepo in for over its run. [[spec/tickets/route-cases-hand-their-repo]]
var standingRepo = realRepo

// The repository under a root that every registered verb takes. [[spec/tickets/route-cases-hand-their-repo]]
func registeredRepo(root string) git.Repo { return standingRepo(root) }

// The rules whose findings refuse at a door: a lint that ran nowhere reads no rule, and a private name leaves the box. [[spec/design_output/level0#the-panel-holds-a-warning]]
var refusing = map[string]bool{"VoiceRulesRan": true, "Private": true}

// The pull a verb runs over, built for one call's output and errors: the live one on this box, or one over the fakes in the example harness. [[spec/design_output/examples#one-runner-two-drivers]]
type pullOver func(out, errs io.Writer) (*pull.It, int)

// The live pull over the roots and the repository a registered verb takes. [[spec/design_output/pull#the-answers]]
func pullingHere(rootOf func() (string, error), repoAt func(root string) git.Repo) pullOver {
	return func(out, errs io.Writer) (*pull.It, int) { return pullHere(rootOf, repoAt, out, errs) }
}

// The pull over this box: the disk and git under the work root, the config under the method root, and the verbs and topics other code answers. [[spec/design_output/pull#the-answers]]
func pullHere(rootOf func() (string, error), repoAt func(root string) git.Repo, out, errs io.Writer) (*pull.It, int) {
	method, work, err := rootsOf(rootOf)
	if err != nil {
		fmt.Fprintln(errs, err)
		return nil, exitFailed
	}
	env := map[string]string{}
	for _, one := range os.Environ() {
		if name, value, ok := strings.Cut(one, "="); ok {
			env[name] = value
		}
	}
	rows, _ := configAt(method)
	it := &pull.It{
		Disk: pull.OSDisk{Root: work}, Git: repoAt(work), Now: time.Now, Out: out, Err: errs,
		Root: work, Method: method, Env: env, Agent: pull.AgentOf(env) != "", Cloud: pull.InCloud(env),
		Words: configInt(rows, "names.words"), Fails: configInt(rows, "work.failsBeforePerson"),
		Refusals: configInt(rows, "work.refusalsBeforeFail"), Splits: configInt(rows, "work.stepsBeforeSplit"),
		PersonSigns: configWord(rows, "work.personSigns") == "true",
		Weights:     pull.Weights{Block: configNumber(rows, "queue.block"), Day: configNumber(rows, "queue.day"), Fail: configNumber(rows, "queue.fail")},
		Binding:     configWord(rows, "engine.binding"), CapBytes: configInt(rows, "pull.cap"), CapMargin: configInt(rows, "pull.margin"),
		Log:     pullLog(work, configWord(rows, "log.level")),
		Rules:   brief.RulesOf,
		Shell:   pull.ShellOver(proc.Real, work),
		Schemas: func() *check.Kinds { return check.SchemasIn(check.TreeOver(method, rootDisk{method})) },
	}
	it.Notes = func(key string) []string {
		said, err := guidanceRows(method, env)
		if err != nil {
			return []string{}
		}
		return said[key]
	}
	if valeAt(method) != "" {
		it.Voice = pullVoice(method)
	}
	scripts := filepath.Join(method, "src", "scripts")
	it.Take = func(group string) int { return takesBranch(scripts, group, it) }
	it.Ready = it.ReadyToMerge
	return it, 0
}

// A config key's value as a word. [[spec/design_output/config#the-engine-controls]]
func configWord(rows map[string]configRow, key string) string {
	var said any
	if json.Unmarshal(rows[key].Value, &said) != nil || said == nil {
		return ""
	}
	if text, ok := said.(string); ok {
		return text
	}
	return fmt.Sprint(said)
}

// A config key's value as a number, and nothing where it holds none. [[spec/design_output/config#the-engine-controls]]
func configNumber(rows map[string]configRow, key string) float64 {
	var said float64
	if json.Unmarshal(rows[key].Value, &said) != nil {
		var text string
		if json.Unmarshal(rows[key].Value, &text) == nil {
			fmt.Sscan(text, &said)
		}
	}
	return said
}

func configInt(rows map[string]configRow, key string) int { return int(configNumber(rows, key)) }

// The levels a row takes, lowest first, the floor where the config names none, and the length a row's sentence keeps. [[spec/design_output/log#what-a-box-writes]]
var logLevels = []string{"debug", "info", "warn", "error", "fatal"}

const (
	logFloor = "info"
	logSaid  = 80
)

// The session log the verbs write under the work root: a row at or past the floor the config names, its sentence on one line and cut, as rowOf in lib/log.js shapes it. [[spec/design_output/log#what-one-line-looks-like]]
func pullLog(work, floor string) func(level, kind, said string, extra map[string]any) {
	write := appendsRow(work, time.Now)
	rank := func(level string) int {
		for i, one := range logLevels {
			if one == level {
				return i
			}
		}
		return 1
	}
	if floor == "" {
		floor = logFloor
	}
	return func(level, kind, said string, extra map[string]any) {
		if rank(level) < rank(floor) {
			return
		}
		said = strings.Join(strings.Fields(said), " ")
		if runes := []rune(said); len(runes) > logSaid {
			said = string(runes[:logSaid])
		}
		row := map[string]any{}
		for key, value := range extra {
			row[key] = value
		}
		row["level"], row["kind"], row["said"] = level, kind, said
		_ = write(row)
	}
}

// The voice over a ticket the pull reads: Vale through the past veto alone, and every marker naming no reason, kept on the rows first to last. [[spec/design_output/pull#the-voice-reads-the-evidence]]
func pullVoice(root string) func(path, text string, first, last int) []pull.Voiced {
	return func(path, text string, first, last int) []pull.Voiced {
		if strings.TrimSpace(text) == "" {
			return nil
		}
		said := heardIn(root, path, text, prose.Past)
		if !said.ran {
			return nil
		}
		out := []pull.Voiced{}
		keep := func(rule, message, severity string, line int) {
			if (severity == "error" || severity == "warning") && line >= first && line <= last {
				name := rule[strings.LastIndex(rule, ".")+1:]
				out = append(out, pull.Voiced{Rule: rule, Message: message, Line: line, Refuses: refusing[name]})
			}
		}
		for _, one := range said.rows {
			severity := one.severity
			if severity == "" {
				severity = "error"
			}
			keep(one.found.Rule, one.message, severity, one.found.Line)
		}
		for _, one := range check.UnreasonedIn(path, text) {
			keep(one.Rule, one.Message, one.Severity, one.Line)
		}
		return out
	}
}

// The hooks door the index writes, and the port it names. [[spec/design_output/pull#the-engine-takes-the-branch]]
const hooksDoor = index.Runtime + "/hooks.json"

// The index this box serves, started where none answers, and the port it stands at. [[spec/design_output/pull#the-engine-takes-the-branch]]
func servesHere(root string) string {
	was, _ := os.ReadFile(filepath.Join(root, filepath.FromSlash(hooksDoor)))
	if _, err := index.V1(); err != nil {
		return "No index answers, and the start fails: " + err.Error()
	}
	door, _ := os.ReadFile(filepath.Join(root, filepath.FromSlash(hooksDoor)))
	var said struct {
		Port int `json:"port"`
	}
	_ = json.Unmarshal(door, &said)
	if len(was) > 0 && string(was) == string(door) {
		return fmt.Sprintf("The index answers at port %d.", said.Port)
	}
	return fmt.Sprintf("The index stands at port %d.", said.Port)
}
