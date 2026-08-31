package main

import (
	"os"
	"path/filepath"
)

// Two roots, and neither is declared. The method root is where this program
// lives. The work root is the folder being worked on. v3 made a person
// register them, which bought nothing and annoyed everyone.
type Roots struct {
	Method string
	Work   string
}

func FindRoots(workArg string) (Roots, error) {
	exe, err := os.Executable()
	if err != nil {
		return Roots{}, err
	}
	// The built program sits in .bin under the method root.
	method := filepath.Dir(filepath.Dir(exe))
	work := workArg
	if work == "" {
		if work, err = os.Getwd(); err != nil {
			return Roots{}, err
		}
	}
	work, err = filepath.Abs(work)
	if err != nil {
		return Roots{}, err
	}
	return Roots{Method: method, Work: work}, nil
}

// Private is where material that must not travel is kept. The log lives here
// because it holds prompts.
func (r Roots) Private(parts ...string) string {
	return filepath.Join(append([]string{r.Work, ".se"}, parts...)...)
}
