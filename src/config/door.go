// The one file of this package reading the outside. Every other file calls one
// of these, so a reader finds the box in one place.
// [[spec/design_output/doors#a-door-reads-the-outside]]
package config

import "os"

func envOf(key string) string              { return os.Getenv(key) }
func readFile(path string) ([]byte, error) { return os.ReadFile(path) }
