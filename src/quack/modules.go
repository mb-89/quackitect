// The module types the wiring loads: each one's registration, the start of
// an IO module, and the folder a placed module stands in.
// [[spec/design_output/model#io-modules-are-modules]]
package main

import (
	"quackitect/src/modules/check"
	"quackitect/src/modules/clock"
	"quackitect/src/modules/drafts"
	"quackitect/src/modules/edits"
	"quackitect/src/modules/env"
	"quackitect/src/modules/files"
	"quackitect/src/modules/git"
	"quackitect/src/modules/guidance"
	"quackitect/src/modules/holds"
	"quackitect/src/modules/hooks"
	httpmodule "quackitect/src/modules/http"
	logmodule "quackitect/src/modules/log"
	"quackitect/src/modules/lsp"
	"quackitect/src/modules/mcp"
	"quackitect/src/modules/migration"
	"quackitect/src/modules/plans"
	"quackitect/src/modules/queue"
	"quackitect/src/modules/search"
	"quackitect/src/modules/session"
	"quackitect/src/modules/settings"
	"quackitect/src/modules/tickets"
	verbsmodule "quackitect/src/modules/verbs"
	"quackitect/src/modules/views"
	"quackitect/src/modules/waits"
	"quackitect/src/modules/work"
	"quackitect/src/q"
)

// The modules projecting files/, which the root loads beside the watch that provides it. [[spec/design_output/model#everything-on-disk-mirrors]]
var projected = []func(*q.Catalog) q.Writer{queue.Registers, holds.Registers, views.Registers}

// A module type the wiring loads: its registration, and for an IO module the start that runs it under the names its instance binds. A module with no start runs on the scheduler alone. [[spec/tickets/tickets-becomes-a-module]]
type ioModule struct {
	registers func(*q.Catalog) q.Writer
	starts    func(root string, commit func(values map[string]any) error) (func(), error)
	// The folder under src/modules registering a module the placements put in a process. A door, an IO module and a settings section carry none, and stay where they run. [[spec/design_output/model#a-module-rebuilds-alone]]
	topic string
}

// The folder registering the verb topics, which share it. [[spec/design_output/model#a-module-rebuilds-alone]]
const verbsTopic = "verbs"

var modules = map[string]ioModule{
	"watch": {registers: files.Registers, starts: func(root string, commit func(map[string]any) error) (func(), error) {
		return files.Seeds(root, files.NewWatch(root), commit)
	}},
	"clock": {registers: clock.Registers, starts: func(_ string, commit func(map[string]any) error) (func(), error) {
		return clock.Start(clock.New(), commit), nil
	}},
	"env": {registers: env.Registers, starts: func(_ string, commit func(map[string]any) error) (func(), error) {
		return func() {}, env.Start(env.New(), commit)
	}},
	// [[spec/tickets/the-index-reads-standing-branches]]
	"git": {registers: git.Registers, starts: func(root string, commit func(map[string]any) error) (func(), error) {
		return git.Start(git.New(root), clock.New().Every, commit), nil
	}},
	"tickets":   {registers: withActions(tickets.Registers, verbsmodule.TicketsActions), topic: "tickets"},
	"queue":     {registers: queue.Places, topic: "queue"},
	"work":      {registers: withActions(work.Registers, verbsmodule.WorkActions), topic: "work"},
	"migration": {registers: migration.Registers, topic: "migration"},
	"check":     {registers: check.Registers, topic: "check"},
	"guidance":  {registers: guidance.Registers, topic: "guidance"},
	"log":       {registers: logmodule.Registers, topic: "log"},
	"http":      {registers: httpmodule.Registers},
	// [[spec/tickets/the-hooks-door-lands]]
	hooksModule: {registers: hooks.Registers},
	"session":   {registers: session.Registers, topic: "session"},
	// [[spec/tickets/the-mcp-module-lands]]
	mcpModule: {registers: mcp.Registers},
	// [[spec/tickets/the-lsp-door-lands]]
	lspModule: {registers: lsp.Registers},
	// [[spec/tickets/ticket-verbs-become-actions]]
	"ticket":  {registers: verbsmodule.Topic("ticket", verbsmodule.TicketVerbs), topic: verbsTopic},
	"retro":   {registers: verbsmodule.Topic("retro", verbsmodule.RetroVerbs), topic: verbsTopic},
	"vehicle": {registers: verbsmodule.Topic("vehicle", verbsmodule.VehicleVerbs), topic: verbsTopic},
	"stub":    {registers: verbsmodule.Topic("stub", verbsmodule.StubVerbs), topic: verbsTopic},
	// [[spec/tickets/work-verbs-become-actions]]
	"branch": {registers: verbsmodule.Topic("branch", verbsmodule.BranchVerbs), topic: verbsTopic},
	// [[spec/tickets/agents-call-quack-directly]]
	verbsmodule.TreeTopic: {registers: verbsmodule.Tree(verbsmodule.TreeVerbs), topic: verbsTopic},
	// [[spec/tickets/edit-tools-answer-in-go]]
	edits.Module: {registers: edits.Registers, topic: "edits"},
	// [[spec/tickets/find-and-wait-in-go]]
	search.Module: {registers: search.Registers, topic: "search"},
	waits.Module:  {registers: waits.Registers, topic: "waits"},
	// [[spec/tickets/plan-writes-off-go]]
	plans.Module: {registers: plans.Registers, topic: "plans"},
	// [[spec/tickets/prose-tools-answer-in-go]]
	drafts.Module: {registers: drafts.Registers, topic: "drafts"},
}

// A module type taking the view actions its instance answers beside its own registration. [[spec/tickets/view-actions-run-through-verbs]]
func withActions(own, actions func(*q.Catalog) q.Writer) func(*q.Catalog) q.Writer {
	return func(c *q.Catalog) q.Writer { return q.Join(own(c), actions(c)) }
}

// A settings section loads as a module type of its own name, and a module of that name takes the section's keys beside its own. [[spec/tickets/the-config-schema-gets-generated]]
func init() {
	for _, section := range settings.Sections() {
		keys := settings.Of(section)
		own, ok := modules[section]
		if !ok {
			modules[section] = ioModule{registers: keys}
			continue
		}
		registers := own.registers
		own.registers = func(c *q.Catalog) q.Writer {
			first := registers(c)
			keys(c)
			return first
		}
		modules[section] = own
	}
}
