// The one file of this package reading the outside. Every other file calls one
// of these, so a reader finds the box in one place.
// [[spec/design_output/doors#a-door-reads-the-outside]]
package swap

import (
	"io/fs"
	"os"
)

func executableOf() (string, error)           { return os.Executable() }
func statOf(path string) (fs.FileInfo, error) { return os.Stat(path) }
