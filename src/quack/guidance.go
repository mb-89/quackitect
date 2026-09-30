// quack guidance: every leaf of every process, keyed process:path, with the
// notes the guidance module hands it on this box, as JSON. The guidance verb
// and the pull read it beside their own answer while the guidance slice runs
// in shadow.
// [[spec/tickets/the-guidance-topic-lands]]
package main

import (
	"encoding/json"
	"io/fs"
	"os"
	"path/filepath"
	"strings"

	"quackitect/src/modules/guidance"
	"quackitect/src/q"
)

// The variable naming the work root, which stands over the method root as the verbs read it. [[spec/design_output/vehicle#the-work-root-inherits]]
const workRootVar = "SE_WORK_ROOT"

// Every leaf's notes, off the processes and the guidance notes under root, under the env this box reads. [[spec/tickets/the-guidance-topic-lands]]
func guidanceRows(root string, env map[string]string) (map[string][]string, error) {
	method, err := guidanceFiles(root)
	if err != nil {
		return nil, err
	}
	work := map[string]q.Content{}
	if at := strings.TrimSpace(env[workRootVar]); at != "" && filepath.Clean(at) != filepath.Clean(root) {
		if work, err = guidanceFiles(at); err != nil {
			return nil, err
		}
	}
	out := map[string][]string{}
	for key, reads := range guidance.Resolve(guidance.Layered(method, work)) {
		out[key] = guidance.Notes(reads, env)
	}
	return out, nil
}

// The files under the processes and the guidance folders of one root, keyed by their path under it. [[spec/tickets/the-guidance-topic-lands]]
func guidanceFiles(root string) (map[string]q.Content, error) {
	out := map[string]q.Content{}
	for _, folder := range []string{guidance.Processes, guidance.Guidance} {
		base := filepath.Join(root, filepath.FromSlash(folder))
		err := filepath.WalkDir(base, func(at string, entry fs.DirEntry, err error) error {
			if err != nil || entry.IsDir() {
				return err
			}
			body, err := os.ReadFile(at)
			if err != nil {
				return err
			}
			rel, err := filepath.Rel(root, at)
			if err != nil {
				return err
			}
			out[filepath.ToSlash(rel)] = q.Content{Hash: "disk", Text: string(body)}
			return nil
		})
		if err != nil && !os.IsNotExist(err) {
			return nil, err
		}
	}
	return out, nil
}

// Prints every leaf's notes under the root, under the whole environment of this process. [[spec/tickets/the-guidance-topic-lands]]
func guidances(root string) error {
	env := map[string]string{}
	for _, one := range os.Environ() {
		if name, value, ok := strings.Cut(one, "="); ok {
			env[name] = value
		}
	}
	rows, err := guidanceRows(root, env)
	if err != nil {
		return err
	}
	text, err := json.Marshal(rows)
	if err != nil {
		return err
	}
	_, err = os.Stdout.Write(append(text, '\n'))
	return err
}
