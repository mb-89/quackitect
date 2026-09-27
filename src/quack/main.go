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

	"quackitect/src/index"
	"quackitect/src/modules/clock"
	"quackitect/src/modules/env"
	"quackitect/src/modules/files"
	"quackitect/src/q"
)

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

func main() {
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
