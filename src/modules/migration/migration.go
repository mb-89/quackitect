// The migration module: the switches of the migration's slices, each a shared
// key the default file alone sets, and nothing else.
// [[spec/design_output/model#config-comes-off-the-registrations]]
package migration

import "quackitect/src/q"

// The key of the open-tasks slice, by its local name. [[spec/tickets/open-tasks-run-in-shadow]]
const OpenTasksKey = "opentasks"

// The keys of the read-only topic slices, by their local names. [[spec/tickets/read-topics-land-in-shadow]]
const (
	ConfigKey   = "config"
	LogKey      = "log"
	GuidanceKey = "guidance"
	CheckKey    = "check"
	ProseKey    = "prose"
)

// The key of the verbs slice, the road ./RUNME.sh hands a verb down, by its local name. [[spec/tickets/runme-hands-verbs-to-quack]]
const VerbsKey = "verbs"

// The key of the window slice, the reads the window makes off the index, by its local name. [[spec/tickets/the-log-becomes-a-view]]
const WindowKey = "window"

// The key of the sidebar slice, the views section the sidebar weighs against its old groups, by its local name. [[spec/tickets/the-sidebar-shadow-compares]]
const SidebarKey = "sidebar"

// The key of the cage slice, the road a hook event takes to the hooks IO module, by its local name. [[spec/tickets/the-hooks-door-lands]]
const CageKey = "cage"

// The key of the lsp slice, the LSP's rules the check module answers beside it, by its local name. [[spec/tickets/lsp-rules-move-to-check]]
const LspKey = "lsp"

// The key of the processes slice, where the IO process and the module processes run, by its local name. [[spec/tickets/the-doors-process-stands]]
const ProcessesKey = "processes"

// The modes a slice takes before it switches over. [[spec/tickets/the-config-schema-gets-generated]]
var modes = []string{"old", "shadow", "new"}

// Every slice this module switches, its built-in mode, and what each covers. The open-tasks slice stands switched over to new. [[spec/tickets/read-topics-land-in-shadow]]
var slices = []struct {
	key, mode, doc string
	enum           []string
}{
	{OpenTasksKey, "new", "The open-tasks slice's record, switched over in phase 2. The badge, the work tab's brackets and its queue column read the index.", []string{"new"}},
	{ConfigKey, "new", "The config readers, switched over in phase 4.", []string{"new"}},
	{LogKey, "new", "The session log rows, switched over in phase 4.", []string{"new"}},
	{GuidanceKey, "new", "The rules a step reads, switched over in phase 4.", []string{"new"}},
	{CheckKey, "new", "The check twins, switched over in phase 4.", []string{"new"}},
	{ProseKey, "new", "The prose checks, switched over in phase 4.", []string{"new"}},
	{VerbsKey, "new", "The road a verb runs, switched over in phase 4. Each verb quack answers runs alone.", []string{"new"}},
	{CageKey, "new", "The cage, switched over in phase 5. The hooks IO module answers each hook event.", []string{"new"}},
	{WindowKey, "new", "The window, switched over in phase 6. It draws the index's reads alone.", []string{"new"}},
	{SidebarKey, "old", "The sidebar: old draws its own groups alone, shadow weighs the views section against them and logs each pair apart, new draws the views section.", modes},
	{LspKey, "old", "The LSP's rules: old answers on the LSP's own sweep alone, shadow runs the check module's sweep beside it and logs each finding apart, new answers the module's.", modes},
}

// Every phase switch, what the phase holds, and the ticket a cloud box takes once it reads true on main. [[spec/tickets/the-config-schema-gets-generated]]
var phases = []struct{ key, what, ticket string }{
	{"phase0", "Phase 0, the specs.", "the-migration-writes-its-specs"},
	{"phase1", "Phase 1, the foundation.", "the-foundation-lands-unchanged"},
	{"phase1gaps", "Phase 1, its gaps.", "the-foundation-closes-its-gaps"},
	{"phase2shadow", "Phase 2 in shadow.", "open-tasks-shadow-lands"},
	{"phase2switch", "Phase 2 switched over.", "open-tasks-switch-lands"},
	{"phase3shadow", "Phase 3 in shadow.", "read-topics-land-in-shadow"},
	{"phase3switch", "Phase 3 switched over.", "read-topics-switch-over"},
	{"phase4shadow", "Phase 4 in shadow.", "quack-verbs-land-in-shadow"},
	{"phase4switch", "Phase 4 switched over.", "quack-verbs-switch-over"},
	{"phase5shadow", "Phase 5 in shadow.", "go-cage-lands-in-shadow"},
	{"phase5switch", "Phase 5 switched over.", "go-cage-switches-over"},
	{"phase6shadow", "Phase 6 in shadow.", "tui-shell-lands-in-shadow"},
	{"phase6switch", "Phase 6 switched over.", "tui-shell-switches-over"},
	{"phase7shadow", "Phase 7 in shadow.", "lsp-door-lands-in-shadow"},
	{"phase7switch", "Phase 7 switched over.", "lsp-door-switches-over"},
	{"phase8shadow", "Phase 8 in shadow.", "sidebar-lands-in-shadow"},
	{"phase8switch", "Phase 8 switched over.", "sidebar-switches-over"},
	{"phase9shadow", "Phase 9 in shadow.", "module-processes-land-in-shadow"},
	{"phase9switch", "Phase 9 switched over.", "module-processes-switch-over"},
	{"phase10", "Phase 10, Node leaving the boxes.", "node-leaves-the-boxes"},
}

// The module type the wiring loads as migration: each phase switch, built-in false, and each slice. It returns the first key's writer, which no caller reads. [[spec/tickets/the-config-schema-gets-generated]]
func Registers(c *q.Catalog) q.Writer {
	var first q.Writer
	for i, one := range phases {
		doc := one.what + " true in the tracked file on main lets a cloud box take " + one.ticket + ". A write on this box turns nothing on in the cloud."
		writer := q.CfgIn(c, one.key, false, q.Shared(), q.Doc(doc))
		if i == 0 {
			first = writer
		}
	}
	for _, one := range slices {
		q.CfgIn(c, one.key, one.mode, q.Shared(), q.Doc(one.doc), q.Enum(one.enum...))
	}
	return first
}
