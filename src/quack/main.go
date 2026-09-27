// The composition root: it loads the IO modules the wiring names into the
// catalog, and runs the index with a start for each.
// [[spec/design_output/model#io-modules-are-modules]]
package main

import (
	"errors"
	"fmt"
	"io/fs"
	"os"
	"path/filepath"
	"strings"

	"quackitect/src/index"
	"quackitect/src/modules/clock"
	"quackitect/src/modules/config"
	"quackitect/src/modules/env"
	"quackitect/src/modules/files"
	"quackitect/src/modules/holds"
	"quackitect/src/modules/queue"
	"quackitect/src/q"
)

// The folder quack dump writes to, which no projection covers, and the argument count of the verb. [[spec/design_output/model#everything-on-disk-mirrors]]
const (
	dumpFolder = ".se/dump/"
	dumpArgs   = 3
)

// The modules projecting files/, which the root loads beside the watch that provides it. [[spec/design_output/model#everything-on-disk-mirrors]]
var projected = []func(*q.Catalog) q.Writer{config.Registers, queue.Registers, holds.Registers}

// An IO module type: its registration, and the start that runs it under the names its instance binds. [[spec/design_output/model#io-modules-are-modules]]
type ioModule struct {
	registers func(*q.Catalog) q.Writer
	starts    func(root string, commit func(values map[string]any) error) (func(), error)
}

var modules = map[string]ioModule{
	"watch": {files.Registers, func(root string, commit func(map[string]any) error) (func(), error) {
		return files.Start(files.NewWatch(root), commit)
	}},
	"clock": {clock.Registers, func(_ string, commit func(map[string]any) error) (func(), error) {
		return clock.Start(clock.New(), commit), nil
	}},
	"env": {env.Registers, func(_ string, commit func(map[string]any) error) (func(), error) {
		return func() {}, env.Start(env.New(), commit)
	}},
}

// A loaded projection the root wires: its glob, and the round trip of its codec. [[spec/design_output/model#everything-on-disk-mirrors]]
type projection struct {
	glob      string
	roundTrip func(body []byte) ([]byte, error)
}

// [[spec/design_output/model#everything-on-disk-mirrors]]
func projections() []projection {
	c := q.New()
	for _, registers := range projected {
		registers(c)
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
	if len(os.Args) == dumpArgs && os.Args[1] == "dump" {
		if err := dumps(os.Args[2]); err != nil {
			fmt.Fprintln(os.Stderr, err)
			os.Exit(1)
		}
		return
	}
	starts, err := wired()
	if err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}
	index.Main(starts...)
}

// The IO module instances of the wiring file, loaded into q.Main. A tree with no wiring file runs none. [[spec/design_output/model#the-wiring-file]]
func wired() ([]index.Start, error) {
	root, err := index.Root()
	if err != nil {
		return nil, err
	}
	text, err := os.ReadFile(filepath.Join(root, filepath.FromSlash(q.WiringFile)))
	if errors.Is(err, fs.ErrNotExist) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	w, err := q.ReadWiring(string(text))
	if err != nil {
		return nil, err
	}
	return load(w, q.Main)
}

// Loads each IO module instance into into, and answers a start committing its local names under the names the wiring binds. [[spec/design_output/model#the-wiring-file]]
func load(w q.Wiring, into *q.Catalog) ([]index.Start, error) {
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
	loaded, faults := q.Load(kept, types)
	if len(faults) > 0 {
		return nil, q.Refused(faults)
	}
	into.Take(loaded)
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
	return starts, nil
}
