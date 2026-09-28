// The one file of this package reading the outside. Every other file calls one
// of these, so a reader finds the box in one place.
// [[spec/design_output/doors#a-door-reads-the-outside]]
package shadow

import (
	"os"
	"path/filepath"
)

func appendLine(path string, data []byte) error {
	if err := os.MkdirAll(filepath.Dir(path), 0o755); err != nil {
		return err
	}
	file, err := os.OpenFile(path, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0o644)
	if err != nil {
		return err
	}
	if _, err := file.Write(data); err != nil {
		file.Close()
		return err
	}
	return file.Close()
}
