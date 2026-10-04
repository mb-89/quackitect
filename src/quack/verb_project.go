// The project verb: writes every projection again, from the source it names.
// Sources read off the work root laid over the method root, and the targets
// land in the work root alone. Under dry it reads and writes nothing.
// [[spec/tickets/config-verbs-port-to-go]]
package main

import (
	"fmt"
	"io"
	"os"
	"path/filepath"
	"strings"

	"quackitect/src/index"
	projector "quackitect/src/projection"
)

// The modes a projected file and its folder take. [[spec/tickets/config-verbs-port-to-go]]
const (
	projectedFile   = 0o644
	projectedFolder = 0o755
)

func init() { register("project", projectVerb(index.Root)) }

// project over the method root the given func answers, and the work root SE_WORK_ROOT names. [[spec/design_output/projection#who-projects-and-when]]
func projectVerb(root func() (string, error)) twin {
	return func(_ []string, dry bool, out, errs io.Writer) int {
		method, err := root()
		if err != nil {
			fmt.Fprintln(errs, err)
			return exitFailed
		}
		work := strings.TrimSpace(os.Getenv(workRootVar))
		if work == "" {
			work = method
		}
		entries := []projector.Entry{}
		if text, err := os.ReadFile(filepath.Join(method, filepath.FromSlash(projector.Projections))); err == nil {
			entries = projector.EntriesIn(string(text))
		}
		targets := projectDisk{root: work}
		var sources projector.Tree = targets
		if filepath.Clean(method) != filepath.Clean(work) {
			sources = projector.Inherits(projectDisk{root: method}, targets)
		}
		said := projector.ReadAll(entries, sources, targets)
		if !dry {
			if err := projectWrites(work, said); err != nil {
				fmt.Fprintln(errs, err)
				return exitFailed
			}
		}
		fmt.Fprintf(out, "%d file(s) projected from %d projection(s).\n", len(said.Wanted), len(entries))
		return 0
	}
}

// Writes every wanted target that differs, and removes every standing one nothing wants. [[spec/design_output/projection#who-projects-and-when]]
func projectWrites(work string, said projector.Result) error {
	for _, path := range projector.Paths(said.Wanted) {
		at := filepath.Join(work, filepath.FromSlash(path))
		if err := os.MkdirAll(filepath.Dir(at), projectedFolder); err != nil {
			return err
		}
		if standing, held := said.Standing[path]; held && standing == said.Wanted[path] {
			continue
		}
		if err := os.WriteFile(at, []byte(said.Wanted[path]), projectedFile); err != nil {
			return err
		}
	}
	for _, path := range projector.Paths(said.Standing) {
		if _, wanted := said.Wanted[path]; wanted {
			continue
		}
		if err := os.Remove(filepath.Join(work, filepath.FromSlash(path))); err != nil && !os.IsNotExist(err) {
			return err
		}
	}
	return nil
}

// The tree under one root on disk. [[spec/design_output/vehicle#the-work-root-inherits]]
type projectDisk struct{ root string }

// The disk path a relative path names under the root. [[spec/design_output/vehicle#the-work-root-inherits]]
func (one projectDisk) at(path string) string {
	return filepath.Join(one.root, filepath.FromSlash(path))
}

// Whether the root holds the path. [[spec/design_output/vehicle#the-work-root-inherits]]
func (one projectDisk) Exists(path string) bool {
	_, err := os.Stat(one.at(path))
	return err == nil
}

// The text the root holds at the path. [[spec/design_output/vehicle#the-work-root-inherits]]
func (one projectDisk) Read(path string) string {
	text, _ := os.ReadFile(one.at(path))
	return string(text)
}

// The names a folder under the root lists, none where it stands nowhere. [[spec/design_output/vehicle#the-work-root-inherits]]
func (one projectDisk) List(folder string) []projector.Listed {
	listed, err := os.ReadDir(one.at(folder))
	if err != nil {
		return nil
	}
	out := make([]projector.Listed, 0, len(listed))
	for _, each := range listed {
		out = append(out, projector.Listed{Name: each.Name(), Dir: each.IsDir()})
	}
	return out
}
