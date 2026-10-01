// The module types the wiring loads: each one's registration, the start an IO
// module runs under, and the folder registering it, which a placement restarts on.
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
	"quackitect/src/modules/waits"
	"quackitect/src/modules/work"
	"quackitect/src/q"
)

// A module type the wiring loads: its registration, and for an IO module the start that runs it under the names its instance binds. A module with no start runs on the scheduler alone. [[spec/tickets/tickets-becomes-a-module]]
type ioModule struct {
	registers func(*q.Catalog) q.Writer
	starts    func(root string, commit func(values map[string]any) error) (func(), error)
	// The folder under src/modules registering the type, the topic a placement restarts on. A settings section alone carries none, and stays with the index. [[spec/tickets/topic-folder-in-the-table]]
	folder string
}

var modules = map[string]ioModule{
	"watch": {files.Registers, func(root string, commit func(map[string]any) error) (func(), error) {
		return files.Seeds(root, files.NewWatch(root), commit)
	}, "files"},
	"clock": {clock.Registers, func(_ string, commit func(map[string]any) error) (func(), error) {
		return clock.Start(clock.New(), commit), nil
	}, "clock"},
	"env": {env.Registers, func(_ string, commit func(map[string]any) error) (func(), error) {
		return func() {}, env.Start(env.New(), commit)
	}, "env"},
	// [[spec/tickets/the-index-reads-standing-branches]]
	"git": {git.Registers, func(root string, commit func(map[string]any) error) (func(), error) {
		return git.Start(git.New(root), clock.New().Every, commit), nil
	}, "git"},
	"tickets":   {registers: withActions(tickets.Registers, verbsmodule.TicketsActions), folder: "tickets"},
	"queue":     {registers: queue.Places, folder: "queue"},
	"work":      {registers: withActions(work.Registers, verbsmodule.WorkActions), folder: "work"},
	"migration": {registers: migration.Registers, folder: "migration"},
	"check":     {registers: check.Registers, folder: "check"},
	"guidance":  {registers: guidance.Registers, folder: "guidance"},
	"log":       {registers: logmodule.Registers, folder: "log"},
	"http":      {registers: httpmodule.Registers, folder: "http"},
	// [[spec/tickets/the-hooks-door-lands]]
	hooksModule: {registers: hooks.Registers, folder: "hooks"},
	"session":   {registers: session.Registers, folder: "session"},
	// [[spec/tickets/the-mcp-module-lands]]
	mcpModule: {registers: mcp.Registers, folder: "mcp"},
	// [[spec/tickets/the-lsp-door-lands]]
	lspModule: {registers: lsp.Registers, folder: "lsp"},
	// [[spec/tickets/ticket-verbs-become-actions]]
	"ticket":  {registers: verbsmodule.Topic("ticket", verbsmodule.TicketVerbs), folder: verbsFolder},
	"retro":   {registers: verbsmodule.Topic("retro", verbsmodule.RetroVerbs), folder: verbsFolder},
	"vehicle": {registers: verbsmodule.Topic("vehicle", verbsmodule.VehicleVerbs), folder: verbsFolder},
	"stub":    {registers: verbsmodule.Topic("stub", verbsmodule.StubVerbs), folder: verbsFolder},
	// [[spec/tickets/work-verbs-become-actions]]
	"branch": {registers: verbsmodule.Topic("branch", verbsmodule.BranchVerbs), folder: verbsFolder},
	// [[spec/tickets/agents-call-quack-directly]]
	verbsmodule.TreeTopic: {registers: verbsmodule.Tree(verbsmodule.TreeVerbs), folder: verbsFolder},
	// [[spec/tickets/edit-tools-answer-in-go]]
	edits.Module: {registers: edits.Registers, folder: "edits"},
	// [[spec/tickets/find-and-wait-in-go]]
	search.Module: {registers: search.Registers, folder: "search"},
	waits.Module:  {registers: waits.Registers, folder: "waits"},
	// [[spec/tickets/plan-writes-off-go]]
	plans.Module: {registers: plans.Registers, folder: "plans"},
	// [[spec/tickets/prose-tools-answer-in-go]]
	drafts.Module: {registers: drafts.Registers, folder: "drafts"},
}

// The folder registering every verb topic. [[spec/tickets/topic-folder-in-the-table]]
const verbsFolder = "verbs"

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
