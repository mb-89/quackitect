// The log tab's door. Every file call this package makes stands here, so a
// module of it reads the box nowhere.
// [[spec/design_output/doors#a-door-reads-the-outside]]

package log

import "os"

// The outside every other file of this package reads through. [[spec/design_output/doors#a-door-reads-the-outside]]
func readFile(path string) ([]byte, error) { return os.ReadFile(path) }
