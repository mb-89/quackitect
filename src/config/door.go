// The one file of this package reaching the outside. Every other file calls one
// of these, so a reader finds the box in one place.
// [[spec/design_output/doors#a-door-reads-the-outside]]
package config

import "os"

func envOf(key string) string              { return os.Getenv(key) }
func readFile(path string) ([]byte, error) { return os.ReadFile(path) }

// The local layer's writer, which Drop calls. [[spec/tickets/cage-hold-drops-port]]
func writeFile(path string, body []byte, mode os.FileMode) error {
	return os.WriteFile(path, body, mode)
}

func makeDir(path string, mode os.FileMode) error { return os.MkdirAll(path, mode) }
