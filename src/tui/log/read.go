// The session file read once, for the one frame the command line draws. The
// window itself reads log/rows off the index.
// [[spec/design_output/tui#one-frame]]

package log

import (
	"errors"
	"io/fs"
	"strings"
	"time"
)

// Every whole line of the file as a record, a line with no time taking the one before it, and nothing where no file stands. A half line waits for its end. [[spec/design_output/tui#one-frame]]
func ReadLog(path string) ([]Record, error) { return readLog(readFile, path) }

// The read over the door a caller hands it, so a case seeds a fake. [[spec/tickets/test-walks-move-onto-fakes]]
func readLog(read func(string) ([]byte, error), path string) ([]Record, error) {
	body, err := read(path)
	if errors.Is(err, fs.ErrNotExist) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	text := string(body)
	end := strings.LastIndexByte(text, '\n')
	if end < 0 {
		return nil, nil
	}
	var out []Record
	var last time.Time
	for _, line := range strings.Split(text[:end], "\n") {
		line = strings.TrimRight(line, "\r")
		if strings.TrimSpace(line) == "" {
			continue
		}
		r := ParseRecord(line)
		if r.At.IsZero() {
			r.At = last
		}
		last = r.At
		out = append(out, r)
	}
	return out, nil
}
