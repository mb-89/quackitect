// The helper's one reach of the disk: a folder made with its parents.
// [[spec/tickets/watchertest-helper-meets-its-door]]
package watchertest

import "os"

// The mode a folder the helper makes takes. [[spec/tickets/watchertest-helper-meets-its-door]]
const folderMode = 0o755

// Makes the folder at the path, with every parent it lacks. [[spec/tickets/watchertest-helper-meets-its-door]]
func makeAll(at string) error { return os.MkdirAll(at, folderMode) }
