// The composition root: it loads the index manager and the IO modules the
// wiring names into the catalog, and runs the index with a start for each.
// [[spec/design_output/model#io-modules-are-modules]]
package main

import (
	"errors"
	"fmt"
	"io"
	"io/fs"
	"os"
	"path/filepath"
	"strings"
	"time"

	"quackitect/src/index"
	"quackitect/src/modules/check"
	"quackitect/src/modules/clock"
	"quackitect/src/modules/config"
	"quackitect/src/modules/env"
	"quackitect/src/modules/files"
	"quackitect/src/modules/guidance"
	"quackitect/src/modules/holds"
	"quackitect/src/modules/hooks"
	"quackitect/src/modules/mcp"
	httpmodule "quackitect/src/modules/http"
	manager "quackitect/src/modules/index"
	logmodule "quackitect/src/modules/log"
	"quackitect/src/modules/migration"
	"quackitect/src/modules/queue"
	"quackitect/src/modules/session"
	"quackitect/src/modules/tickets"
	verbsmodule "quackitect/src/modules/verbs"
	"quackitect/src/modules/work"
	"quackitect/src/prose"
	"quackitect/src/q"
)

// The folder quack dump writes to, a dot folder the watch stands off, so neither files/ nor a projection reads a dump back, and the argument count of the verb. [[spec/design_output/model#everything-on-disk-mirrors]]
const (
	dumpFolder = ".se/.dump/"
	dumpArgs   = 3
)

// The modules projecting files/, which the root loads beside the watch that provides it. [[spec/design_output/model#everything-on-disk-mirrors]]
var projected = []func(*q.Catalog) q.Writer{queue.Registers, holds.Registers}

// A module type the wiring loads: its registration, and for an IO module the start that runs it under the names its instance binds. A module with no start runs on the scheduler alone. [[spec/tickets/tickets-becomes-a-module]]
type ioModule struct {
	registers func(*q.Catalog) q.Writer
	starts    func(root string, commit func(values map[string]any) error) (func(), error)
}

var modules = map[string]ioModule{
	"watch": {files.Registers, func(root string, commit func(map[string]any) error) (func(), error) {
		return files.Seeds(root, files.NewWatch(root), commit)
	}},
	"clock": {clock.Registers, func(_ string, commit func(map[string]any) error) (func(), error) {
		return clock.Start(clock.New(), commit), nil
	}},
	"env": {env.Registers, func(_ string, commit func(map[string]any) error) (func(), error) {
		return func() {}, env.Start(env.New(), commit)
	}},
	"tickets":   {registers: tickets.Registers},
	"queue":     {registers: queue.Places},
	"work":      {registers: work.Registers},
	"migration": {registers: migration.Registers},
	"check":     {registers: check.Registers},
	"guidance":  {registers: guidance.Registers},
	"log":       {registers: logmodule.Registers},
	"http":      {registers: httpmodule.Registers},
	// [[spec/tickets/the-hooks-door-lands]]
	hooksModule: {registers: hooks.Registers},
	"session":   {registers: session.Registers},
	// [[spec/tickets/the-mcp-module-lands]]
	mcpModule: {registers: mcp.Registers},
	// [[spec/tickets/ticket-verbs-become-actions]]
	"ticket":  {registers: verbsmodule.Topic("ticket", verbsmodule.TicketVerbs)},
	"retro":   {registers: verbsmodule.Topic("retro", verbsmodule.RetroVerbs)},
	"vehicle": {registers: verbsmodule.Topic("vehicle", verbsmodule.VehicleVerbs)},
	"stub":    {registers: verbsmodule.Topic("stub", verbsmodule.StubVerbs)},
	// [[spec/tickets/work-verbs-become-actions]]
	"branch": {registers: verbsmodule.Topic("branch", verbsmodule.BranchVerbs)},
}

// A loaded projection the root wires: its glob, and the round trip of its codec. [[spec/design_output/model#everything-on-disk-mirrors]]
type projection struct {
	glob      string
	roundTrip func(body []byte) ([]byte, error)
}

// [[spec/design_output/model#everything-on-disk-mirrors]]
func projections() []projection {
	c := q.New()
	config.Registers(c)
	for _, registers := range projected {
		registers(c)
	}
	// A module type the wiring loads projects too, the tickets among them. [[spec/tickets/tickets-becomes-a-module]]
	for _, module := range modules {
		module.registers(c)
	}
	var out []projection
	for _, one := range c.Projections() {
		if one.Kind == q.Loaded {
			out = append(out, projection{glob: one.Glob, roundTrip: one.RoundTrip})
		}
	}
	return out
}

// The file quack dump writes a prefix to. [[spec/design_output/model#everything-on-disk-mirrors]]
func dumpPath(prefix string) string {
	name := strings.ReplaceAll(strings.Trim(prefix, "/"), "/", "-")
	if name == "" {
		name = "all"
	}
	return dumpFolder + name + ".json"
}

// Asks the index for the dump, and writes it through disk at the revision it reads. [[spec/design_output/model#everything-on-disk-mirrors]]
func dumps(prefix string) error {
	root, err := index.Root()
	if err != nil {
		return err
	}
	said, err := index.Ask("dump", prefix)
	if err != nil {
		return err
	}
	text, _ := said.(string)
	disk, at := files.NewDisk(root), dumpPath(prefix)
	read := ""
	if old, held, err := disk.Read(at); err != nil {
		return err
	} else if held {
		read = files.ContentOf(old).Hash
	}
	if _, err := files.Accept(disk)(q.Request{Module: files.DiskModule, Verb: "write", Args: files.Write{Path: at, Text: text, Read: read}}); err != nil {
		return err
	}
	fmt.Println(at)
	return nil
}

func main() {
	if len(os.Args) > verbArgs && os.Args[1] == "verb" {
		os.Exit(verbRoad(os.Args[2], os.Args[3:]))
	}
	if len(os.Args) == 2 && os.Args[1] == "config" {
		if err := configs("."); err != nil {
			fmt.Fprintln(os.Stderr, err)
			os.Exit(1)
		}
		return
	}
	if len(os.Args) == 2 && os.Args[1] == "guidance" {
		if err := guidances("."); err != nil {
			fmt.Fprintln(os.Stderr, err)
			os.Exit(1)
		}
		return
	}
	if len(os.Args) == 2 && os.Args[1] == "log" {
		if err := logs("."); err != nil {
			fmt.Fprintln(os.Stderr, err)
			os.Exit(1)
		}
		return
	}
	if len(os.Args) == 2 && os.Args[1] == "prose" {
		if err := proses("."); err != nil {
			fmt.Fprintln(os.Stderr, err)
			os.Exit(1)
		}
		return
	}
	if len(os.Args) == dumpArgs && os.Args[1] == "dump" {
		if err := dumps(os.Args[2]); err != nil {
			fmt.Fprintln(os.Stderr, err)
			os.Exit(1)
		}
		return
	}
	if len(os.Args) > 1 && cliVerbs[os.Args[1]] {
		os.Exit(routes(os.Stdout, os.Stderr, index.V1, os.Args[1:]))
	}
	as := manager.Registers(q.Main)
	starts, doors, err := wired()
	if err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}
	// The config module loads always, after the wiring, so it resolves every key the wiring declares. [[spec/design_output/model#the-config-module]]
	config.Registers(q.Main)
	index.Main(manages(as, doors), starts...)
}

// The module type the wiring loads as hooks, whose door the manager's start opens. [[spec/tickets/the-hooks-door-lands]]
const hooksModule = "hooks"

// The module type the wiring loads as mcp, whose listener starts beside the hooks door. [[spec/tickets/the-mcp-module-lands]]
const mcpModule = "mcp"

// The instances whose listeners the manager's start opens: the hooks door, and the mcp server. [[spec/tickets/the-mcp-module-lands]]
type doors struct {
	hooks, mcp hooked
}

// The hooks instance the wiring loads: its writer, and the name each local name binds to. No instance leaves on false. [[spec/tickets/the-hooks-door-lands]]
type hooked struct {
	on    bool
	as    q.Writer
	bound func(local string) string
}

// The first instance of the module type the wiring loads, so the mcp module reads its own the way the hooks door does. [[spec/tickets/hooked-of-caller-missed]]
func hookedOf(w q.Wiring, hands map[string]q.Writer, module string) hooked {
	for _, one := range w.Instances {
		if one.Module == module {
			name := one.Name
			return hooked{on: true, as: hands[name], bound: func(local string) string { return w.Bound(name, local) }}
		}
	}
	return hooked{}
}

// The index manager's start, over the store and the op table the index hands it, the wall clock, its writer and the IO modules' accept, and the hooks door beside it where the wiring loads one. [[spec/design_output/model#the-index-manager]]
func manages(as q.Writer, open doors) index.Manage {
	return func(root string, store *q.Store, rows index.OpRows, steps func(hand func())) (index.Managed, error) {
		served, err := manager.Serving(manager.Outside{
			Root: root, Store: store, As: as, Rows: opRows{rows}, Steps: steps,
			Now: time.Now, Every: clock.New().Every, Accept: accepts(root),
		})
		if err != nil {
			return index.Managed{}, err
		}
		stop, err := listens(root, store, open, served)
		if err != nil {
			served.Stop()
			return index.Managed{}, err
		}
		return index.Managed{Stop: stop, Call: func(name string, input any, caller string, wait time.Duration) (index.Called, error) {
			said, err := served.Call(name, input, caller, wait)
			return index.Called(said), err
		}}, nil
	}
}

// Opens the hooks door and the mcp server the wiring loads, and answers the stop of each with the manager's. The listeners stand in the index process until the IO process holds every listener. [[spec/tickets/hooks-listener-joins-io-process]]
func listens(root string, store *q.Store, open doors, served manager.Served) (func(), error) {
	halts := []func(){}
	stop := func() {
		for _, halt := range halts {
			halt()
		}
		served.Stop()
	}
	if hook := open.hooks; hook.on {
		halt, err := listensHooks(root, store, hook, served)
		if err != nil {
			return nil, err
		}
		halts = append(halts, halt)
	}
	if one := open.mcp; one.on {
		halt, err := listensMCP(root, store, one, served)
		if err != nil {
			for _, halt := range halts {
				halt()
			}
			return nil, err
		}
		halts = append(halts, halt)
	}
	return stop, nil
}

// Opens the mcp server over the manager's call, so a harness with no function hooks reaches every action. [[spec/tickets/the-mcp-module-lands]]
func listensMCP(root string, store *q.Store, one hooked, served manager.Served) (func(), error) {
	server, err := mcp.New(mcp.Outside{
		Store: store, Bound: one.bound,
		Call: func(name string, input any, caller string, wait time.Duration) (mcp.Called, error) {
			said, err := served.Call(name, input, caller, wait)
			return mcp.Called(said), err
		},
	})
	if err != nil {
		return nil, err
	}
	return mcp.Listen(root, server)
}

// Opens the hooks door over the manager's call and book, at the clock IO module's time. [[spec/tickets/hooks-listener-joins-io-process]]
func listensHooks(root string, store *q.Store, hook hooked, served manager.Served) (func(), error) {
	door := hooks.New(hooks.Outside{
		Store: store, As: hook.as, Bound: hook.bound, Now: clock.New().Now,
		Call: func(name string, input any, caller string, wait time.Duration) (hooks.Called, error) {
			said, err := served.Call(name, input, caller, wait)
			return hooks.Called(said), err
		},
		Ops: func(caller string) []hooks.Op { return opsOf(served.Of(caller), time.Now()) },
	})
	return hooks.Listen(root, door)
}

// The book's operations as the hooks door reads them: the fraction done, and the time gone by to its end or to now. [[spec/design_output/model#the-agent-does-not-poll]]
func opsOf(all []manager.Op, now time.Time) []hooks.Op {
	out := make([]hooks.Op, 0, len(all))
	for _, one := range all {
		end := now
		if !one.Ended.IsZero() {
			end = one.Ended
		}
		var fraction float64
		if one.Progress.Known > 0 {
			fraction = float64(one.Progress.Done) / float64(one.Progress.Known)
		}
		out = append(out, hooks.Op{Handle: one.ID, Action: one.Action, State: string(one.State), Fraction: fraction, Gone: end.Sub(one.Started), Result: one.Result, Error: one.Error})
	}
	return out
}

// The IO modules that answer a request an action lists: disk over the root, and a refusal naming any other. [[spec/tickets/actions-answer-over-http]]
func accepts(root string) func(q.Request) (any, error) {
	disk := files.Accept(files.NewDisk(root))
	node := nodeAccept(root)
	return func(asked q.Request) (any, error) {
		if asked.Module == files.DiskModule {
			return disk(asked)
		}
		// [[spec/tickets/ticket-verbs-become-actions]]
		if asked.Module == verbsmodule.NodeModule && asked.Verb == verbsmodule.NodeRun {
			return node(asked)
		}
		return nil, fmt.Errorf("no IO module accepts %s.%s", asked.Module, asked.Verb)
	}
}

// The index's op table read as the manager's rows, so neither side names the other's types. [[spec/design_output/model#an-operation-outlives-callers]]
type opRows struct{ table index.OpRows }

func (one opRows) Save(id string, body []byte) error { return one.table.Save(id, body) }
func (one opRows) Drop(id string) error              { return one.table.Drop(id) }

func (one opRows) All() ([]manager.Row, error) {
	all, err := one.table.All()
	if err != nil {
		return nil, err
	}
	out := make([]manager.Row, 0, len(all))
	for _, row := range all {
		out = append(out, manager.Row{ID: row.ID, Body: row.Body})
	}
	return out, nil
}

// The module instances of the wiring file, loaded into q.Main. A tree with no wiring file loads its vehicle's, and where neither stands the index runs none. [[spec/design_output/model#the-wiring-file]]
func wired() ([]index.Start, doors, error) {
	root, err := index.Root()
	if err != nil {
		return nil, doors{}, err
	}
	text, err := wiringOf(root, vehicleOf(os.Executable()))
	if text == "" || err != nil {
		return nil, doors{}, err
	}
	w, err := q.ReadWiring(text)
	if err != nil {
		return nil, doors{}, err
	}
	starts, hands, err := loaded(w, q.Main)
	return starts, doors{hooks: hookedOf(w, hands, hooksModule), mcp: hookedOf(w, hands, mcpModule)}, err
}

// The text of the first wiring file standing: the work root's, then the vehicle's. [[spec/design_output/model#the-wiring-file]]
func wiringOf(roots ...string) (string, error) {
	for _, root := range roots {
		if root == "" {
			continue
		}
		text, err := os.ReadFile(filepath.Join(root, filepath.FromSlash(q.WiringFile)))
		if errors.Is(err, fs.ErrNotExist) {
			continue
		}
		return string(text), err
	}
	return "", nil
}

// The vehicle folder a binary stands in: the install builds it into the vehicle's runtime bin folder, and a binary anywhere else stands in none. [[spec/design_output/model#the-wiring-file]]
func vehicleOf(exe string, err error) string {
	if err != nil {
		return ""
	}
	bin := filepath.Dir(exe)
	if !strings.HasSuffix(filepath.ToSlash(bin), "/"+index.Runtime+"/bin") {
		return ""
	}
	return filepath.Dir(filepath.Dir(filepath.Dir(bin)))
}

// Loads each IO module instance into into, and answers a start committing its local names under the names the wiring binds. [[spec/design_output/model#the-wiring-file]]
func load(w q.Wiring, into *q.Catalog) ([]index.Start, error) {
	starts, _, err := loaded(w, into)
	return starts, err
}

// Load, answering the writer each instance's registration hands back beside the starts. [[spec/tickets/the-hooks-door-lands]]
func loaded(w q.Wiring, into *q.Catalog) ([]index.Start, map[string]q.Writer, error) {
	kept := q.Wiring{Wires: w.Wires}
	hands := map[string]q.Writer{}
	types := map[string]func(*q.Catalog){}
	for _, one := range w.Instances {
		module, ok := modules[one.Module]
		if !ok {
			continue
		}
		kept.Instances = append(kept.Instances, one)
		name := one.Name
		types[one.Module] = func(c *q.Catalog) { hands[name] = module.registers(c) }
	}
	catalog, faults := q.Load(kept, types)
	if len(faults) > 0 {
		return nil, nil, q.Refused(faults)
	}
	into.Take(catalog)
	// A projection reads files/, so it loads where the wiring loads the watch that provides it. [[spec/design_output/model#everything-on-disk-mirrors]]
	for _, one := range kept.Instances {
		if one.Module == "watch" {
			for _, registers := range projected {
				registers(into)
			}
			break
		}
	}
	starts := make([]index.Start, 0, len(kept.Instances))
	for _, one := range kept.Instances {
		instance, module := one.Name, modules[one.Module]
		if module.starts == nil {
			continue
		}
		starts = append(starts, func(root string, commit index.Commit) (func(), error) {
			return module.starts(root, func(values map[string]any) error {
				bound := make(map[string]any, len(values))
				for local, value := range values {
					bound[w.Bound(instance, local)] = value
				}
				return commit(hands[instance], bound)
			})
		})
	}
	return starts, hands, nil
}

// Prints every key off the config module, over both files under the root, the wiring and the SE_ variables. [[spec/tickets/cfg-topic-holds-one-resolver]]
func configs(root string) error {
	rows, err := configAt(root)
	if err != nil {
		return err
	}
	text, err := configText(rows)
	if err != nil {
		return err
	}
	_, err = os.Stdout.Write(text)
	return err
}

// Every key both config files under the root hold, resolved over the wiring's shared keys and the SE_ variables. [[spec/tickets/cfg-topic-holds-one-resolver]]
func configAt(root string) (map[string]configRow, error) {
	read := func(path string) []byte {
		body, _ := os.ReadFile(filepath.Join(root, filepath.FromSlash(path)))
		return body
	}
	shared, err := sharedKeys(string(read(q.WiringFile)))
	if err != nil {
		return nil, err
	}
	env := map[string]string{}
	for _, one := range os.Environ() {
		if name, value, ok := strings.Cut(one, "="); ok && strings.HasPrefix(name, "SE_") {
			env[name] = value
		}
	}
	return configRows(read(config.Tracked), read(config.Local), env, shared)
}

// Reads one prose request on stdin, and prints what the Go vetoes keep over the caps and the domain words the tree names. [[spec/tickets/prose-checks-run-in-go]]
func proses(root string) error {
	read := func(path string) string {
		body, _ := os.ReadFile(filepath.Join(root, filepath.FromSlash(path)))
		return string(body)
	}
	caps, paths := proseSchema([]byte(read(paragraphSchema)))
	words := prose.Words(read(paths[0]), read(paths[1]), read(paths[2]))
	ask, err := io.ReadAll(os.Stdin)
	if err != nil {
		return err
	}
	text, err := proseAnswer(ask, words, caps)
	if err != nil {
		return err
	}
	_, err = os.Stdout.Write(text)
	return err
}
