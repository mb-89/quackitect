// The work tab's door: every file the edits and the place chord read and
// write passes through here.
// [[spec/design_output/tui#the-work-tab]]

package work

import (
	"io/fs"
	"os"
)

// The outside every other file of this package reads through. [[spec/design_output/doors#a-door-reads-the-outside]]
func readFile(path string) ([]byte, error) { return os.ReadFile(path) }
func writeFile(path string, data []byte, mode fs.FileMode) error {
	return os.WriteFile(path, data, mode)
}
func appendFile(path string, data []byte) error {
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
func statOf(path string) (fs.FileInfo, error)     { return os.Stat(path) }
func makeDir(path string, mode fs.FileMode) error { return os.MkdirAll(path, mode) }
